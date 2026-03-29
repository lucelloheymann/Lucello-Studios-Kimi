const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CREATING TEST OUTREACH ===\n');
  
  // Find or create a company
  let company = await prisma.company.findFirst({
    where: { status: { not: 'BLACKLISTED' } }
  });
  
  if (!company) {
    console.log('Creating test company...');
    company = await prisma.company.create({
      data: {
        name: 'Test Firma GmbH',
        domain: 'testfirma.de',
        email: 'kontakt@testfirma.de',
        status: 'QUALIFIED',
        city: 'Berlin',
        state: 'BE',
        industry: 'Handwerk'
      }
    });
  }
  
  console.log(`Company: ${company.name} (${company.id})`);
  
  // Create contact
  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: 'Max Mustermann',
      email: 'max.mustermann@testfirma.de',
      role: 'Geschäftsführer'
    }
  });
  
  console.log(`Contact: ${contact.name} (${contact.email})`);
  
  // Create APPROVED outreach draft
  const outreach = await prisma.outreachDraft.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      type: 'EMAIL_SHORT',
      status: 'APPROVED', // APPROVED for sending
      recipientName: contact.name,
      recipientEmail: contact.email,
      subject: 'Test: Ihre Website-Analyse',
      body: `Sehr geehrte Damen und Herren,\n\n wir haben Ihre Website analysiert und möchten Ihnen ein verbessertes Design vorstellen.\n\n Mit freundlichen Grüßen\n Ihr Website-Team`,
      isBlockedForSend: false,
      hasUnreviewedPlaceholders: false,
      approvedAt: new Date(),
      approvedBy: 'test-user',
      version: 1
    }
  });
  
  console.log(`\n=== CREATED APPROVED OUTREACH ===`);
  console.log(`ID: ${outreach.id}`);
  console.log(`Status: ${outreach.status}`);
  console.log(`Recipient: ${outreach.recipientEmail}`);
  console.log(`Subject: ${outreach.subject}`);
  console.log(`\nUse this ID for testing: ${outreach.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
