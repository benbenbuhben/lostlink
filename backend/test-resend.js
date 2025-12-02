// Quick test script to verify Resend API key
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment');
  process.exit(1);
}

console.log('🔍 Testing Resend API Key...');
console.log(`📧 FROM_EMAIL: ${FROM_EMAIL}`);
console.log(`🔑 API Key (first 10 chars): ${RESEND_API_KEY.substring(0, 10)}...`);

const resend = new Resend(RESEND_API_KEY);

// Test email
console.log('\n📧 Attempting to send test email...');

resend.emails.send({
  from: FROM_EMAIL,
  to: FROM_EMAIL, // Send to yourself for testing
  subject: 'Test Email from LostLink',
  html: '<p>This is a test email to verify Resend configuration.</p>',
  text: 'This is a test email to verify Resend configuration.',
})
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Failed to send test email:');
      console.error('Error:', error.message);
      console.error('Details:', JSON.stringify(error, null, 2));
      
      if (error.message?.includes('API key')) {
        console.error('\n💡 Solution:');
        console.error('   1. Check if API key is correct');
        console.error('   2. Verify API key starts with "re_"');
        console.error('   3. Generate a new API key in Resend Dashboard');
      }
      
      process.exit(1);
    } else {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Email ID: ${data?.id || 'N/A'}`);
      console.log('📬 Check your inbox (and spam folder)');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:');
    console.error('Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  });

