const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const o = await prisma.outreachDraft.findUnique({
    where: { id: 'cmnbxoolb000411g1itkvc7f6' },
    include: { company: true }
  });
  
  console.log('=== DB STATE AFTER SEND ===');
  console.log('sentStatus:', o.sentStatus);
  console.log('messageId:', o.messageId);
  console.log('sentProvider:', o.sentProvider);
  console.log('sentError:', o.sentError);
  console.log('sentAt:', o.sentAt);
  console.log('sentBy:', o.sentBy);
  console.log('company.isContacted:', o.company.isContacted);
  console.log('company.status:', o.company.status);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
