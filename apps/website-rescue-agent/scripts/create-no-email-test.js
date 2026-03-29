const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CREATING NO-EMAIL TEST ===\n');
  
  // Create company WITHOUT email
  const company = await prisma.company.create({
    data: {
      name: 'Firma Ohne Email GmbH',
      domain: 'keine-email.de',
      email: null, // NO EMAIL
      status: 'QUALIFIED',
      city: 'Hamburg',
      state: 'HH',
      industry: 'Handwerk',
      isContacted: false,
      isBlacklisted: false
    }
  });
  
  // Create contact WITHOUT email
  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: 'Max Mustermann',
      email: null, // NO EMAIL
      role: 'Geschäftsführer'
    }
  });
  
  // Create APPROVED outreach draft (no recipient email)
  const outreach = await prisma.outreachDraft.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      type: 'EMAIL_SHORT',
      status: 'APPROVED',
      recipientName: contact.name,
      recipientEmail: null, // NO EMAIL
      subject: 'Test: Kein Empfänger',
      body: 'Test body',
      isBlockedForSend: false,
      hasUnreviewedPlaceholders: false,
      approvedAt: new Date(),
      approvedBy: 'test-user',
      version: 1
    }
  });
  
  console.log(`Created outreach: ${outreach.id}`);
  console.log(`No recipient email - should fail with "Keine Empfänger-E-Mail"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
