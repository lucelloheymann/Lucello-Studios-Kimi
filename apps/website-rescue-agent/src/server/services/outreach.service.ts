// Outreach-Service: Generiert, verwaltet und sendet (nach Freigabe) Kontaktaufnahmen

import { db } from "@/lib/db";
import { generateLLMObject } from "@/lib/llm";
import {
  getOutreachSystemPrompt,
  buildOutreachUserPrompt,
  outreachSchema,
} from "@/server/prompts/outreach.prompt";
import { OutreachType } from "@/types";
import {
  logOutreachDraftCreated,
  logOutreachApproved,
  logOutreachRejected,
  logOutreachSent,
} from "./audit.service";

export async function generateOutreachDraft(
  companyId: string,
  typeStr?: string
): Promise<void> {
  const type = (typeStr as OutreachType) ?? OutreachType.EMAIL_SHORT;

  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });

  const analysis = await db.analysis.findFirst({
    where: { companyId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  if (!analysis) throw new Error(`Keine Analyse für ${companyId}`);

  const generatedSite = await db.generatedSite.findFirst({
    where: { companyId, status: "GENERATED" },
    orderBy: { createdAt: "desc" },
  });

  const contact = await db.contact.findFirst({ where: { companyId } });

  // Versionsnummer
  const existingCount = await db.outreachDraft.count({ where: { companyId, type } });

  const systemPrompt = getOutreachSystemPrompt(type);
  const userPrompt = buildOutreachUserPrompt({
    company,
    analysis,
    generatedSite,
    type,
    contactName: contact?.name ?? undefined,
  });

  const { object: outreachContent, model } = await generateLLMObject(
    "outreach",
    systemPrompt,
    userPrompt,
    outreachSchema,
    { maxTokens: 2048, temperature: 0.5 }
  );

  const draft = await db.outreachDraft.create({
    data: {
      companyId,
      contactId: contact?.id,
      type,
      version: existingCount + 1,
      recipientName: contact?.name || company.name,
      recipientEmail: contact?.email || company.email,
      subject: outreachContent.subject,
      body: outreachContent.body,
      redFlags: JSON.stringify(outreachContent.redFlags),
      hasUnreviewedPlaceholders: outreachContent.hasUnreviewedPlaceholders,
      isBlockedForSend: outreachContent.isBlockedForSend,
      blockReason: outreachContent.blockReason,
      status: "DRAFT",
      llmModel: model,
      promptVersion: "1.0",
    },
  });

  // Audit-Log: Entwurf erstellt
  await logOutreachDraftCreated(companyId, draft.id, type);

  await db.company.update({
    where: { id: companyId },
    data: { status: "OUTREACH_DRAFT_READY" },
  });
}

// ─── Freigabe-Flow ────────────────────────────────────────────────────────────

export async function approveOutreach(
  outreachId: string,
  userId: string
): Promise<void> {
  const draft = await db.outreachDraft.findUniqueOrThrow({
    where: { id: outreachId },
    include: { company: true },
  });

  // Guardrails
  if (draft.isBlockedForSend) {
    throw new Error(`Versand blockiert: ${draft.blockReason}`);
  }
  if (draft.hasUnreviewedPlaceholders) {
    throw new Error("Nachricht enthält ungeprüfte Platzhalter — bitte vor Freigabe ersetzen");
  }

  await db.outreachDraft.update({
    where: { id: outreachId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  await db.company.update({
    where: { id: draft.companyId },
    data: { status: "APPROVED_FOR_OUTREACH" },
  });

  // Audit-Log: Freigabe
  await logOutreachApproved(draft.companyId, outreachId, userId);
}

export async function rejectOutreach(
  outreachId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const draft = await db.outreachDraft.findUniqueOrThrow({
    where: { id: outreachId },
    select: { companyId: true },
  });

  await db.outreachDraft.update({
    where: { id: outreachId },
    data: { status: "REJECTED" },
  });

  // Audit-Log: Ablehnung
  await logOutreachRejected(draft.companyId, outreachId, reason || "", userId);
}

// ─── Versand (nur nach Freigabe!) ─────────────────────────────────────────────

export async function sendOutreach(
  outreachId: string,
  userId: string
): Promise<void> {
  const draft = await db.outreachDraft.findUniqueOrThrow({
    where: { id: outreachId },
    include: { company: { include: { contacts: true } } },
  });

  // Sicherheitsprüfungen — keine Kompromisse
  if (draft.status !== "APPROVED") {
    throw new Error("Versand nur nach expliziter Freigabe möglich");
  }
  if (draft.isBlockedForSend) {
    throw new Error(`Versand blockiert: ${draft.blockReason}`);
  }
  if (draft.company.isBlacklisted) {
    throw new Error("Firma ist auf der Blacklist");
  }
  if (draft.company.isContacted) {
    throw new Error("Firma wurde bereits kontaktiert");
  }
  if (draft.sentAt) {
    throw new Error("Diese Nachricht wurde bereits gesendet");
  }

  const recipientEmail =
    draft.company.email || draft.company.contacts[0]?.email;

  if (!recipientEmail) {
    throw new Error("Keine Empfänger-E-Mail-Adresse vorhanden");
  }

  // E-Mail-Versand (wenn SMTP konfiguriert)
  if (process.env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject: draft.subject || "",
      text: draft.body || "",
    });
  } else {
    console.log(`[outreach] SMTP nicht konfiguriert — simulierter Versand an ${recipientEmail}`);
  }

  // Status aktualisieren
  await db.outreachDraft.update({
    where: { id: outreachId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentBy: userId,
    },
  });

  await db.company.update({
    where: { id: draft.companyId },
    data: {
      status: "SENT",
      isContacted: true,
    },
  });

  // Audit-Log: Versand
  await logOutreachSent(draft.companyId, outreachId, recipientEmail, userId);
}

// ─── Bearbeitung ──────────────────────────────────────────────────────────────

import { logOutreachEdited } from "./audit.service";

export interface UpdateOutreachData {
  recipientName?: string;
  recipientEmail?: string;
  recipientRole?: string;
  subject?: string;
  body?: string;
  offerPriceRange?: string;
  offerValidUntil?: Date;
}

export async function updateOutreachDraft(
  outreachId: string,
  userId: string,
  data: UpdateOutreachData
): Promise<void> {
  const draft = await db.outreachDraft.findUniqueOrThrow({
    where: { id: outreachId },
  });

  // Nur DRAFT darf bearbeitet werden
  if (draft.status !== "DRAFT") {
    throw new Error("Nur Entwürfe im Status DRAFT können bearbeitet werden");
  }

  // Änderungen tracken
  const changedFields: string[] = [];
  const historyEntry: {
    at: string;
    by: string;
    fields: { field: string; oldVal?: string; newVal?: string }[];
  } = {
    at: new Date().toISOString(),
    by: userId,
    fields: [],
  };

  // Prüfe welche Felder sich geändert haben
  if (data.recipientName !== undefined && data.recipientName !== draft.recipientName) {
    changedFields.push("recipientName");
    historyEntry.fields.push({ field: "recipientName", oldVal: draft.recipientName || "", newVal: data.recipientName });
  }
  if (data.recipientEmail !== undefined && data.recipientEmail !== draft.recipientEmail) {
    changedFields.push("recipientEmail");
    historyEntry.fields.push({ field: "recipientEmail", oldVal: draft.recipientEmail || "", newVal: data.recipientEmail });
  }
  if (data.recipientRole !== undefined && data.recipientRole !== draft.recipientRole) {
    changedFields.push("recipientRole");
    historyEntry.fields.push({ field: "recipientRole", oldVal: draft.recipientRole || "", newVal: data.recipientRole });
  }
  if (data.subject !== undefined && data.subject !== draft.subject) {
    changedFields.push("subject");
    historyEntry.fields.push({ field: "subject", oldVal: draft.subject || "", newVal: data.subject });
  }
  if (data.body !== undefined && data.body !== draft.body) {
    changedFields.push("body");
    // Für Body nur Preview speichern (zu lang für History)
    historyEntry.fields.push({ field: "body", oldVal: "[geändert]", newVal: "[geändert]" });
  }
  if (data.offerPriceRange !== undefined && data.offerPriceRange !== draft.offerPriceRange) {
    changedFields.push("offerPriceRange");
    historyEntry.fields.push({ field: "offerPriceRange", oldVal: draft.offerPriceRange || "", newVal: data.offerPriceRange });
  }

  if (changedFields.length === 0) {
    return; // Nichts geändert
  }

  // Historie laden und aktualisieren (max 10 Einträge)
  const currentHistory = draft.editHistory ? JSON.parse(draft.editHistory) : [];
  const updatedHistory = [historyEntry, ...currentHistory].slice(0, 10);

  // Update durchführen
  await db.outreachDraft.update({
    where: { id: outreachId },
    data: {
      ...data,
      lastEditedAt: new Date(),
      lastEditedBy: userId,
      editCount: { increment: 1 },
      editHistory: JSON.stringify(updatedHistory),
    },
  });

  // Audit-Log
  await logOutreachEdited(draft.companyId, outreachId, changedFields, userId);
}
