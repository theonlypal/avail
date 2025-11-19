// Quick Twilio Connection Test
require('dotenv').config({ path: '.env.local' });
const twilio = require('twilio');

console.log('Testing Twilio Configuration...\n');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Credentials Found:');
console.log('   Account SID:', accountSid);
console.log('   Auth Token:', authToken ? '***' + authToken.slice(-4) : 'MISSING');
console.log('   Phone Number:', phoneNumber, '\n');

if (!accountSid || !authToken || !phoneNumber) {
  console.log('ERROR: Missing credentials in .env.local');
  process.exit(1);
}

try {
  const client = twilio(accountSid, authToken);

  console.log('Fetching your Twilio account info...\n');

  client.api.accounts(accountSid)
    .fetch()
    .then(account => {
      console.log('SUCCESS: Twilio Connection Works!\n');
      console.log('Account Details:');
      console.log('   Status:', account.status);
      console.log('   Type:', account.type);
      console.log('   Friendly Name:', account.friendlyName, '\n');

      console.log('Your auto dialer is ready to make calls!');
      console.log('\nNext: Open http://localhost:3000/dashboard and click a lead to call\n');
    })
    .catch(error => {
      console.log('ERROR: Twilio API Error:', error.message);
      console.log('\nPossible issues:');
      console.log('   - Invalid Account SID or Auth Token');
      console.log('   - Network/firewall blocking Twilio API');
      console.log('   - Account suspended/deactivated\n');
    });
} catch (error) {
  console.log('ERROR:', error.message);
}
