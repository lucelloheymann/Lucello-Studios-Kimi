/**
 * Seed-Skript für Test-Conversations
 * 
 * Erstellt:
 * 1. Aktive Conversation mit Follow-ups
 * 2. Geschlossene Conversation (WON)
 * 3. Geschlossene Conversation (NO_REPLY)
 */

import { db } from "../src/lib/db";
import { ConversationStatus, ReplySentiment, FollowUpStatus } from "../src/types";

async function seedConversations() {
  console.log("🌱 Seeding test conversations...\n");

  // Hole die ersten 3 Companies
  const companies = await db.company.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  if (companies.length < 3) {
    console.error("❌ Need at least 3 companies in the database");
    process.exit(1);
  }

  const [company1, company2, company3] = companies;

  // Cleanup: Lösche bestehende Conversations dieser Companies
  await db.conversation.deleteMany({
    where: { companyId: { in: [company1.id, company2.id, company3.id] } },
  });
  console.log("🗑️  Cleaned up existing conversations\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. AKTIVE CONVERSATION - HEUTE FÄLLIG (mit Reply und Follow-up)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("📬 Creating ACTIVE conversation (due today)...");
  
  const today = new Date();
  today.setHours(14, 0, 0, 0); // Heute 14:00
  
  const activeConversation = await db.conversation.create({
    data: {
      companyId: company1.id,
      initialOutreachId: null,
      status: ConversationStatus.REPLIED,
      currentSentiment: ReplySentiment.POSITIVE,
      firstSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 Tage her
      lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 Tage her
      replyReceivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      followUpCount: 1,
      nextFollowUpDueAt: today, // HEUTE fällig
    },
  });

  // Reply hinzufügen
  await db.reply.create({
    data: {
      conversationId: activeConversation.id,
      sentiment: ReplySentiment.POSITIVE,
      content: "Vielen Dank für Ihre Nachricht! Das klingt sehr interessant. Können wir nächste Woche telefonieren?",
      notes: "Kunde zeigt Interesse, Terminwunsch",
      receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: "Demo User",
    },
  });

  // Follow-up erstellen
  await db.followUp.create({
    data: {
      conversationId: activeConversation.id,
      sequenceNumber: 1,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`   ✅ Active conversation: ${company1.name}`);
  console.log(`      Status: REPLIED (Positive)`);
  console.log(`      Follow-ups: 1/3 sent`);
  console.log(`      Next due: Tomorrow\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ÜBERFÄLLIGE CONVERSATION (für Dashboard-Test)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("⏰ Creating OVERDUE conversation...");
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0); // Gestern 10:00
  
  const overdueConversation = await db.conversation.create({
    data: {
      companyId: company2.id,
      initialOutreachId: null,
      status: ConversationStatus.PENDING,
      currentSentiment: null,
      firstSentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      replyReceivedAt: null,
      followUpCount: 0,
      nextFollowUpDueAt: yesterday, // ÜBERFÄLLIG (gestern)
    },
  });
  
  // Follow-up dazu
  await db.followUp.create({
    data: {
      conversationId: overdueConversation.id,
      sequenceNumber: 1,
      status: FollowUpStatus.DRAFT,
      dueAt: yesterday,
    },
  });

  console.log(`   ✅ Overdue conversation: ${company2.name}`);
  console.log(`      Status: PENDING (Follow-up 1 überfällig)`);
  console.log(`      Due: Yesterday\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GEWONNENE CONVERSATION (geschlossen)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🏆 Creating CLOSED_WON conversation...");
  
  const wonConversation = await db.conversation.create({
    data: {
      companyId: company3.id,
      initialOutreachId: null,
      status: ConversationStatus.CLOSED_WON,
      currentSentiment: ReplySentiment.POSITIVE,
      firstSentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastContactAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      replyReceivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      followUpCount: 2,
      nextFollowUpDueAt: null,
    },
  });

  // Positive Reply
  await db.reply.create({
    data: {
      conversationId: wonConversation.id,
      sentiment: ReplySentiment.POSITIVE,
      content: "Wir sind interessiert. Bitte senden Sie uns ein Angebot für die neue Website.",
      notes: "Angebot angefordert - DEAL WON",
      receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: "Demo User",
    },
  });

  // Follow-ups
  await db.followUp.create({
    data: {
      conversationId: wonConversation.id,
      sequenceNumber: 1,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  await db.followUp.create({
    data: {
      conversationId: wonConversation.id,
      sequenceNumber: 2,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`   ✅ Won conversation: ${company3.name}`);
  console.log(`      Status: CLOSED_WON`);
  console.log(`      Follow-ups: 2/3 sent`);
  console.log(`      Outcome: Angebot angefordert\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. KEINE ANTWORT (NO_REPLY_CLOSED) - wird nicht im Dashboard angezeigt (geschlossen)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("📭 Creating NO_REPLY_CLOSED conversation...");
  
  // Wir brauchen einen 4. Lead für diesen Test - nehmen wir den ersten verfügbaren
  const allCompanies = await db.company.findMany({
    where: { id: { notIn: [company1.id, company2.id, company3.id] } },
    take: 1,
  });
  
  const company4 = allCompanies[0] || company1; // Fallback
  
  const noReplyConversation = await db.conversation.create({
    data: {
      companyId: company4.id,
      initialOutreachId: null,
      status: ConversationStatus.NO_REPLY_CLOSED,
      currentSentiment: null,
      firstSentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      replyReceivedAt: null,
      followUpCount: 3,
      nextFollowUpDueAt: null,
    },
  });

  // Alle 3 Follow-ups versendet
  await db.followUp.create({
    data: {
      conversationId: noReplyConversation.id,
      sequenceNumber: 1,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
    },
  });

  await db.followUp.create({
    data: {
      conversationId: noReplyConversation.id,
      sequenceNumber: 2,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  await db.followUp.create({
    data: {
      conversationId: noReplyConversation.id,
      sequenceNumber: 3,
      status: FollowUpStatus.SENT,
      dueAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`   ✅ No-reply conversation: ${company4.name}`);
  console.log(`      Status: NO_REPLY_CLOSED`);
  console.log(`      Follow-ups: 3/3 sent`);
  console.log(`      Outcome: No response after max follow-ups\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ Seeding complete!");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\nTest-URLs:");
  console.log(`1. Active (REPLIED, due TODAY):  http://localhost:3000/leads/${company1.id}`);
  console.log(`2. OVERDUE (due YESTERDAY):      http://localhost:3000/leads/${company2.id}`);
  console.log(`3. Closed Won:                   http://localhost:3000/leads/${company3.id}`);
  console.log(`4. No Reply Closed:              http://localhost:3000/leads/${company4.id}`);
  console.log("\nDashboard sollte zeigen:");
  console.log("   - Heute fällig: 1");
  console.log("   - Überfällig: 1");
  console.log("   - Dringende Follow-ups: 2 Einträge (1 überfällig, 1 heute)");
  console.log("\n");
}

seedConversations()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
