const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CREATING SECOND TEST OUTREACH ===\n');
  
  // Create NEW company (not contacted yet)
  const company = await prisma.company.create({
    data: {
      name: 'Test Firma 2 GmbH',
      domain: 'testfirma2.de',
      email: 'info@testfirma2.de',
      status: 'QUALIFIED',
      city: 'München',
      state: 'BY',
      industry: 'Handwerk',
      isContacted: false, // NOT contacted
      isBlacklisted: false
    }
  });
  
  console.log(`Created Company: ${company.name} (${company.id})`);
  
  // Create contact
  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: 'Erika Mustermann',
      email: 'erika@testfirma2.de',
      role: 'Geschäftsführerin'
    }
  });
  
  console.log(`Created Contact: ${contact.name} (${contact.email})`);
  
  // Create APPROVED outreach draft
  const outreach = await prisma.outreachDraft.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      type: 'EMAIL_SHORT',
      status: 'APPROVED',
      recipientName: contact.name,
      recipientEmail: contact.email,
      subject: 'Test 2: Website-Optimierung',
      body: `Sehr geehrte Frau Mustermann,\n\nwir haben Ihre Website analysiert und möchten Ihnen ein verbessertes Design vorstellen.\n\nMit freundlichen Grüßen\nIhr Website-Team`,
      isBlockedForSend: false,
      hasUnreviewedPlaceholders: false,
      approvedAt: new Date(),
      approvedBy: 'test-user',
      version: 1
    }
  });
  
  console.log(`\n=== CREATED APPROVED OUTREACH ===`);
  console.log(`ID: ${outreach.id}`);
  console.log(`Company: ${company.name}`);
  console.log(`Recipient: ${outreach.recipientEmail}`);
  console.log(`Subject: ${outreach.subject}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
