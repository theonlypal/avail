/**
 * Test Google Places API with "plumbers with no website santa fe, new mexico"
 * This should filter results to ONLY show plumbers WITHOUT websites
 */

import { discoverLeadsWithPlaces } from '../src/lib/google-places-discovery';

async function testPlumbersNoWebsite() {
  console.log('🧪 Testing: "plumbers with no website santa fe, new mexico"\n');
  console.log('='.repeat(80));

  try {
    const result = await discoverLeadsWithPlaces({
      query: 'plumbers',
      location: 'Santa Fe, New Mexico',
      maxResults: 20
    });

    // Filter to ONLY businesses WITHOUT websites
    const noWebsiteLeads = result.leads.filter(lead => !lead.website);

    console.log(`\n✅ SUCCESS: Found ${noWebsiteLeads.length} plumbers WITHOUT websites\n`);
    console.log('='.repeat(80));

    noWebsiteLeads.forEach((lead, idx) => {
      console.log(`\n🔧 ${idx + 1}. ${lead.name}`);
      console.log('─'.repeat(80));
      console.log(`   Industry: ${lead.industry}`);
      console.log(`   Phone: ${lead.phone || '❌ No phone'}`);
      console.log(`   Website: ❌ NO WEBSITE (HIGH OPPORTUNITY!)`);
      console.log(`   Address: ${lead.address}`);
      console.log(`   City: ${lead.city}, ${lead.state} ${lead.zipCode || ''}`);
      console.log(`   Rating: ${lead.rating ? `⭐ ${lead.rating}/5` : 'No rating'}`);
      console.log(`   Reviews: ${lead.reviewCount || 0}`);
      console.log(`   Opportunity Score: ${lead.opportunityScore}/100`);
      console.log(`   Confidence: ${lead.confidenceScore}%`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total plumbers found: ${result.leads.length}`);
    console.log(`   Plumbers WITHOUT websites: ${noWebsiteLeads.length}`);
    console.log(`   Plumbers WITH websites: ${result.leads.filter(l => l.website).length}`);
    console.log(`   With phone numbers: ${noWebsiteLeads.filter(l => l.phone).length}`);
    console.log(`   Average rating (no website): ${noWebsiteLeads.length > 0 ? (noWebsiteLeads.reduce((sum, l) => sum + (l.rating || 0), 0) / noWebsiteLeads.length).toFixed(2) : 'N/A'}`);
    console.log('\n💡 INSIGHT: These businesses have NO website - perfect opportunities for web design services!');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

testPlumbersNoWebsite();
