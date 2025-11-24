/**
 * Test Google Places API with "smash burgers sunset blvd los angeles"
 */

import { discoverLeadsWithPlaces } from '../src/lib/google-places-discovery';

async function testSmashBurgers() {
  console.log('🧪 Testing: "smash burgers sunset blvd los angeles"\n');
  console.log('=' .repeat(80));

  try {
    const result = await discoverLeadsWithPlaces({
      query: 'smash burgers',
      location: 'Sunset Blvd, Los Angeles, CA',
      maxResults: 15
    });

    console.log(`\n✅ SUCCESS: Found ${result.leads.length} verified businesses\n`);
    console.log('=' .repeat(80));

    result.leads.forEach((lead, idx) => {
      console.log(`\n🍔 ${idx + 1}. ${lead.name}`);
      console.log('─'.repeat(80));
      console.log(`   Industry: ${lead.industry}`);
      console.log(`   Phone: ${lead.phone || '❌ No phone'}`);
      console.log(`   Website: ${lead.website || '❌ No website'}`);
      console.log(`   Address: ${lead.address}`);
      console.log(`   City: ${lead.city}, ${lead.state} ${lead.zipCode || ''}`);
      console.log(`   Rating: ${lead.rating ? `⭐ ${lead.rating}/5` : 'No rating'}`);
      console.log(`   Reviews: ${lead.reviewCount || 0}`);
      console.log(`   Confidence: ${lead.confidenceScore}%`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total found: ${result.totalFound}`);
    console.log(`   Qualified leads: ${result.leads.length}`);
    console.log(`   With phone numbers: ${result.leads.filter(l => l.phone).length}`);
    console.log(`   With websites: ${result.leads.filter(l => l.website).length}`);
    console.log(`   Average rating: ${(result.leads.reduce((sum, l) => sum + (l.rating || 0), 0) / result.leads.length).toFixed(2)}`);
    console.log('\n' + '='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

testSmashBurgers();
