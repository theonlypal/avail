/**
 * Test Google Places API directly for SF garage doors
 */

import { searchGooglePlaces } from '../src/lib/google-places';

async function testGoogleDirect() {
  console.log('🔍 Testing Google Places API directly');
  console.log('Query: garage door repair');
  console.log('Location: San Francisco, California');
  console.log('═'.repeat(60));

  try {
    const results = await searchGooglePlaces({
      query: 'garage door repair',
      location: 'San Francisco, California',
      maxResults: 20,
    });

    console.log(`\n✅ Found ${results.length} results from Google\n`);

    if (results.length > 0) {
      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.name}`);
        console.log(`   Address: ${result.formatted_address}`);
        console.log(`   Rating: ${result.rating || 'N/A'} (${result.user_ratings_total || 0} reviews)`);
        console.log('');
      });
    } else {
      console.log('❌ No results returned from Google Places API!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGoogleDirect();
