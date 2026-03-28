// Outreach-Service: Generiert, verwaltet und sendet (nach Freigabe) Kontaktaufnahmen

import { db } from "@/lib/db";
import { generateLLMObject } from "@/lib/llm";
import {
  getOutreachSystemPrompt,
  buildOutreachUserPrompt,
  outreachSchema,
} from "@/server/prompts/outreach.prompt";
import { OutreachType } from "@prisma/client";

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

  await db.outreachDraft.create({
    data: {
      companyId,
      contactId: contact?.id,
      type,
      version: existingCount + 1,
      subject: outreachContent.subject,
      body: outreachContent.body,
      redFlags: outreachContent.redFlags,
      hasUnreviewedPlaceholders: outreachContent.hasUnreviewedPlaceholders,
      isBlockedForSend: outreachContent.isBlockedForSend,
      blockReason: outreachContent.blockReason,
      status: "DRAFT",
      llmModel: model,
      promptVersion: "1.0",
    },
  });

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

  await db.auditLog.create({
    data: {
      companyId: draft.companyId,
      action: "outreach.approved",
      entityType: "OutreachDraft",
      entityId: outreachId,
      userId,
    },
  });
}

export async function rejectOutreach(
  outreachId: string,
  userId: string,
  reason?: string
): Promise<void> {
  await db.outreachDraft.update({
    where: { id: outreachId },
    data: { status: "REJECTED" },
  });

  await db.auditLog.create({
    data: {
      action: "outreach.rejected",
      entityType: "OutreachDraft",
      entityId: outreachId,
      userId,
      metadata: { reason },
    },
  });
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

  await db.auditLog.create({
    data: {
      companyId: draft.companyId,
      action: "outreach.sent",
      entityType: "OutreachDraft",
      entityId: outreachId,
      userId,
      metadata: { recipientEmail },
    },
  });
}
