/**
 * Test script to verify Google Places API integration
 */

import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.development.local') });

const client = new Client({});

async function testGooglePlaces() {
  console.log('🔍 Testing Google Places API Integration\n');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('❌ ERROR: GOOGLE_PLACES_API_KEY is not set in environment');
    console.error('Current env keys:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    process.exit(1);
  }

  console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');

  try {
    // Test 1: Text Search
    console.log('\n📍 Test 1: Searching for "fitness studios in Austin, TX"...');

    const searchResponse = await client.textSearch({
      params: {
        query: 'fitness studios in Austin, TX',
        key: apiKey,
      },
    });

    if (searchResponse.data.status !== 'OK') {
      console.error('❌ Search failed with status:', searchResponse.data.status);
      console.error('Error message:', searchResponse.data.error_message);
      process.exit(1);
    }

    console.log(`✓ Found ${searchResponse.data.results.length} results`);

    if (searchResponse.data.results.length > 0) {
      const firstPlace = searchResponse.data.results[0];
      console.log('\nFirst result:');
      console.log('  Name:', firstPlace.name);
      console.log('  Address:', firstPlace.formatted_address);
      console.log('  Rating:', firstPlace.rating || 'N/A');
      console.log('  Place ID:', firstPlace.place_id);

      // Test 2: Place Details
      console.log('\n📍 Test 2: Getting detailed information...');

      const detailsResponse = await client.placeDetails({
        params: {
          place_id: firstPlace.place_id!,
          key: apiKey,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'business_status',
            'types',
            'geometry',
            'opening_hours',
            'price_level',
            'reviews',
          ],
        },
      });

      if (detailsResponse.data.status !== 'OK') {
        console.error('❌ Details fetch failed with status:', detailsResponse.data.status);
        process.exit(1);
      }

      const details = detailsResponse.data.result;
      console.log('✓ Details retrieved successfully');
      console.log('\nDetailed information:');
      console.log('  Name:', details.name);
      console.log('  Phone:', details.formatted_phone_number || 'N/A');
      console.log('  Website:', details.website || 'N/A');
      console.log('  Rating:', details.rating || 'N/A');
      console.log('  Total Reviews:', details.user_ratings_total || 0);
      console.log('  Business Status:', details.business_status || 'N/A');
      console.log('  Types:', details.types?.slice(0, 3).join(', ') || 'N/A');
      console.log('  Coordinates:', details.geometry?.location);
    }

    console.log('\n✅ All tests passed! Google Places API is working correctly.\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERROR during API call:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testGooglePlaces();
