const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CHECKING OUTREACH DRAFTS ===\n');
  
  // Check all outreach
  const all = await prisma.outreachDraft.findMany({
    include: { company: true },
    take: 10
  });
  
  console.log(`Found ${all.length} total outreach drafts:\n`);
  
  for (const draft of all) {
    console.log(`ID: ${draft.id}`);
    console.log(`Company: ${draft.company?.name || 'N/A'}`);
    console.log(`Status: ${draft.status}`);
    console.log(`SentStatus: ${draft.sentStatus || 'null'}`);
    console.log(`Recipient: ${draft.recipientEmail || draft.company?.email || 'NONE'}`);
    console.log(`Subject: ${draft.subject ? draft.subject.substring(0, 50) + '...' : 'N/A'}`);
    console.log(`isBlocked: ${draft.isBlockedForSend}`);
    console.log(`hasPlaceholders: ${draft.hasUnreviewedPlaceholders}`);
    console.log('---');
  }
  
  // Show approved ones
  const approved = all.filter(d => d.status === 'APPROVED');
  console.log(`\nAPPROVED count: ${approved.length}`);
  
  if (approved.length > 0) {
    console.log('\n=== FIRST APPROVED ID ===');
    console.log(approved[0].id);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
