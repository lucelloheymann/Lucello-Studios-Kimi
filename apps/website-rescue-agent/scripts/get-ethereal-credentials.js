const nodemailer = require('nodemailer');

// Create Ethereal test account
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create test account:', err);
    process.exit(1);
  }
  
  console.log('=== ETHEREAL TEST ACCOUNT ===');
  console.log('SMTP_HOST="' + account.smtp.host + '"');
  console.log('SMTP_PORT="' + account.smtp.port + '"');
  console.log('SMTP_USER="' + account.user + '"');
  console.log('SMTP_PASS="' + account.pass + '"');
  console.log('SMTP_FROM="' + account.user + '"');
  console.log('SMTP_FROM_NAME="Test Account"');
  console.log('');
  console.log('WEB INTERFACE: https://ethereal.email/login');
  console.log('USERNAME: ' + account.user);
  console.log('PASSWORD: ' + account.pass);
  console.log('==============================');
});
