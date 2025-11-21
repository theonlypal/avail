/**
 * Test all 3 queries requested by ChatGPT
 */

const DEPLOY_URL = 'https://leadly-jy8y0q5r4-rayan-pals-projects.vercel.app';
const TEAM_ID = 'cm3u2qe5g0000kslxvmm90uv9';

async function testQuery(queryName: string, query: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST: ${queryName}`);
  console.log(`Query: "${query}"`);
  console.log('='.repeat(70));

  try {
    const response = await fetch(`${DEPLOY_URL}/api/ai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        teamId: TEAM_ID,
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }

    const data = await response.json();

    console.log(`\n✅ API Response:`);
    console.log(`   Leads Found: ${data.leadsFound || 0}`);
    console.log(`   Leads Added: ${data.leadsAdded || 0}`);

    if (data.leads && data.leads.length > 0) {
      console.log(`\n📋 Top 5 Leads:`);
      data.leads.slice(0, 5).forEach((lead: any, i: number) => {
        console.log(`\n${i + 1}. ${lead.business_name}`);
        console.log(`   Address: ${lead.location}`);
        console.log(`   Score: ${lead.opportunity_score}`);
        console.log(`   Website: ${lead.website || 'None'}`);
      });
    } else {
      console.log('\n❌ NO LEADS RETURNED');
    }

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

async function main() {
  console.log('\n🚀 TESTING PRODUCTION DEPLOYMENT');
  console.log(`URL: ${DEPLOY_URL}`);

  await testQuery('Test 1', 'garage door repair San Francisco California');
  await testQuery('Test 2', 'halal smash burgers in Los Angeles');
  await testQuery('Test 3', 'plumbing companies in Eugene Oregon');

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS COMPLETE');
  console.log('='.repeat(70));
}

main();
