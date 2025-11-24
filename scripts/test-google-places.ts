/**
 * Test Google Places API with "indian food in san diego"
 * Verify we get professional-grade results with verified data
 */

import { discoverLeadsWithPlaces } from '../src/lib/google-places-discovery';

async function testGooglePlaces() {
  console.log('🧪 Testing Google Places API with "indian food in san diego"\n');
  console.log('=' .repeat(80));

  try {
    const result = await discoverLeadsWithPlaces({
      query: 'indian food',
      location: 'San Diego, CA',
      maxResults: 10
    });

    console.log(`\n✅ SUCCESS: Found ${result.leads.length} verified businesses\n`);
    console.log('=' .repeat(80));

    // Display each lead with full details
    result.leads.forEach((lead, idx) => {
      console.log(`\n📍 ${idx + 1}. ${lead.name}`);
      console.log('─'.repeat(80));
      console.log(`   Industry: ${lead.industry}`);
      console.log(`   Phone: ${lead.phone || '❌ No phone'}`);
      console.log(`   Website: ${lead.website || '❌ No website'}`);
      console.log(`   Address: ${lead.address}`);
      console.log(`   City: ${lead.city}, ${lead.state} ${lead.zipCode || ''}`);
      console.log(`   Rating: ${lead.rating ? `⭐ ${lead.rating}/5` : 'No rating'}`);
      console.log(`   Reviews: ${lead.reviewCount || 0}`);
      console.log(`   Opportunity Score: ${lead.opportunityScore}/100`);

      if (lead.painPoints && lead.painPoints.length > 0) {
        console.log(`   Pain Points:`);
        lead.painPoints.forEach(point => {
          console.log(`     • ${point}`);
        });
      }

      console.log(`   Confidence: ${lead.confidenceScore}%`);
      console.log(`   Source: ${lead.source}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total found: ${result.totalFound}`);
    console.log(`   Qualified leads: ${result.leads.length}`);
    console.log(`   With phone numbers: ${result.leads.filter(l => l.phone).length}`);
    console.log(`   With websites: ${result.leads.filter(l => l.website).length}`);
    console.log(`   Average rating: ${(result.leads.reduce((sum, l) => sum + (l.rating || 0), 0) / result.leads.length).toFixed(2)}`);
    console.log(`   Search query: "${result.searchQuery}"`);
    console.log('\n' + '='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ FAILED:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testGooglePlaces();
