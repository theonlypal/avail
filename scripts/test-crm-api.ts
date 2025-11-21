/**
 * Test CRM API End-to-End Flow
 *
 * Verifies that all CRM operations work:
 * 1. Create Business
 * 2. Create Contact
 * 3. Create Deal
 * 4. Send SMS (if Twilio configured)
 * 5. Create Appointment
 * 6. Fetch all data back
 */

import { createBusiness, createContact, createDeal, createAppointment, createMessage } from '../src/lib/db-crm';
import { getContactsByBusiness, getDealsByContact, getAppointmentsByContact, getMessagesByContact } from '../src/lib/db-crm';

async function testCRMFlow() {
  console.log('🧪 Testing CRM API End-to-End Flow\n');

  try {
    // 1. Create Business
    console.log('1️⃣ Creating Business...');
    const business = await createBusiness({
      team_id: 'test-team-' + Date.now(),
      name: 'Test Plumbing Co',
      industry: 'Plumbing',
      phone: '+1-555-TEST-123',
      website: 'https://testplumbing.com',
      address: '123 Main St, San Diego, CA 92101',
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      metadata: {
        testRun: true,
        timestamp: new Date().toISOString(),
      },
    });
    console.log('✅ Business created:', business.id, '-', business.name);
    console.log();

    // 2. Create Contact
    console.log('2️⃣ Creating Contact...');
    const contact = await createContact({
      business_id: business.id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@testplumbing.com',
      phone: '+1-555-CONTACT',
      title: 'Owner',
      tags: ['test', 'crm-flow', 'demo'],
    });
    console.log('✅ Contact created:', contact.id, '-', contact.first_name, contact.last_name);
    console.log();

    // 3. Create Deal
    console.log('3️⃣ Creating Deal...');
    const deal = await createDeal({
      contact_id: contact.id,
      stage: 'new',
      value: 5000,
      source: 'test-script',
      notes: 'This is a test deal created by test-crm-api.ts',
    });
    console.log('✅ Deal created:', deal.id, '- Stage:', deal.stage, '- Value: $' + deal.value);
    console.log();

    // 4. Create Message (simulated SMS)
    console.log('4️⃣ Creating Message log...');
    const message = await createMessage({
      contact_id: contact.id,
      direction: 'outbound',
      channel: 'sms',
      body: 'Hi John, thanks for your interest in AVAIL! This is a test message.',
      status: 'sent',
      sent_at: new Date(),
    });
    console.log('✅ Message logged:', message.id, '- Channel:', message.channel);
    console.log();

    // 5. Create Appointment
    console.log('5️⃣ Creating Appointment...');
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 3); // 3 days from now
    startTime.setHours(14, 0, 0, 0); // 2:00 PM

    const endTime = new Date(startTime);
    endTime.setHours(15, 0, 0, 0); // 3:00 PM

    const appointment = await createAppointment({
      contact_id: contact.id,
      start_time: startTime,
      end_time: endTime,
      location: 'Virtual Meeting',
      notes: 'Discovery call - discuss AVAIL platform',
      status: 'scheduled',
    });
    console.log('✅ Appointment created:', appointment.id, '-', startTime.toLocaleString());
    console.log();

    // 6. Fetch all data back
    console.log('6️⃣ Fetching data to verify...\n');

    const contacts = await getContactsByBusiness(business.id);
    console.log(`   📋 Contacts for business: ${contacts.length}`);

    const deals = await getDealsByContact(contact.id);
    console.log(`   💼 Deals for contact: ${deals.length}`);

    const appointments = await getAppointmentsByContact(contact.id);
    console.log(`   📅 Appointments for contact: ${appointments.length}`);

    const messages = await getMessagesByContact(contact.id);
    console.log(`   💬 Messages for contact: ${messages.length}`);

    console.log();
    console.log('✅ All CRM operations successful!\n');

    console.log('📊 Summary:');
    console.log(`   Business ID: ${business.id}`);
    console.log(`   Contact ID: ${contact.id}`);
    console.log(`   Deal ID: ${deal.id}`);
    console.log(`   Appointment ID: ${appointment.id}`);
    console.log(`   Message ID: ${message.id}`);
    console.log();

    console.log('🎉 CRM API test completed successfully!');

    return {
      success: true,
      businessId: business.id,
      contactId: contact.id,
      dealId: deal.id,
      appointmentId: appointment.id,
      messageId: message.id,
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testCRMFlow()
  .then((result) => {
    console.log('\n✅ Test passed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
