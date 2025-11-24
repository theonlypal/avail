/**
 * Test improved smash burger search - try broader queries
 */

import { discoverLeadsWithPlaces } from '../src/lib/google-places-discovery';

async function testBroaderSearch() {
  console.log('🧪 Testing BROADER search: "burgers" in "Los Angeles, CA"\n');
  console.log('='.repeat(80));

  try {
    const result = await discoverLeadsWithPlaces({
      query: 'burgers',
      location: 'Los Angeles, CA',
      maxResults: 20
    });

    console.log(`\n✅ Found ${result.leads.length} burger places\n`);
    console.log('='.repeat(80));

    result.leads.forEach((lead, index) => {
      console.log(`\n🍔 ${index + 1}. ${lead.name}`);
      console.log('─'.repeat(80));
      console.log(`   Phone: ${lead.phone || 'No phone'}`);
      console.log(`   Address: ${lead.address}`);
      console.log(`   Rating: ${lead.rating ? lead.rating + '/5 ⭐' : 'No rating'} (${lead.reviewCount || 0} reviews)`);
      console.log(`   Website: ${lead.website || 'No website'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total: ${result.leads.length}`);
    console.log(`   With phones: ${result.leads.filter(l => l.phone).length}`);
    console.log(`   With websites: ${result.leads.filter(l => l.website).length}`);
    console.log(`   Avg rating: ${(result.leads.reduce((s, l) => s + (l.rating || 0), 0) / result.leads.length).toFixed(2)}`);
    console.log('\n' + '='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testBroaderSearch();
