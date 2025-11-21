/**
 * Test San Francisco garage door search
 */

async function testSFSearch() {
  console.log('🔍 Testing: "garage door repair San Francisco california"');
  console.log('═'.repeat(60));

  try {
    const response = await fetch('https://leadly-8cdllrqes-rayan-pals-projects.vercel.app/api/ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'garage door repair San Francisco california',
        teamId: 'cm3u2qe5g0000kslxvmm90uv9',
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }

    const data = await response.json();

    console.log(`\n✅ Response received:`);
    console.log(`   Leads Found: ${data.leadsFound || 0}`);
    console.log(`   Leads Added: ${data.leadsAdded || 0}`);

    if (data.error) {
      console.error(`   Error: ${data.error}`);
    }

    if (data.leads && data.leads.length > 0) {
      console.log(`\n📋 First 5 leads:`);
      data.leads.slice(0, 5).forEach((lead: any, i: number) => {
        console.log(`\n${i + 1}. ${lead.business_name}`);
        console.log(`   Location: ${lead.location}`);
        console.log(`   Score: ${lead.opportunity_score}`);
        console.log(`   Website: ${lead.website || 'None'}`);

        // Check if location contains SF area keywords
        const loc = lead.location.toLowerCase();
        const isSFArea = loc.includes('san francisco') || loc.includes('ca ') || loc.includes('california');
        const isNotSF = loc.includes('washington') || loc.includes('virginia') || loc.includes('maryland');

        if (isNotSF) {
          console.log(`   ⚠️  WARNING: This is NOT in San Francisco area!`);
        } else if (isSFArea) {
          console.log(`   ✅ Correctly in SF/California area`);
        }
      });
    } else {
      console.log('\n❌ No leads returned!');
    }

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testSFSearch();
