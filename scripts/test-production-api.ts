/**
 * Test production API searches
 */

async function testSearch(query: string) {
  console.log(`\n🔍 Testing: "${query}"`);
  console.log('─'.repeat(60));

  try {
    const response = await fetch('https://leadly-a6u0n9cm5-rayan-pals-projects.vercel.app/api/ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
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

    console.log(`✅ Response received:`);
    console.log(`   Leads Found: ${data.leadsFound || 0}`);
    console.log(`   Leads Added: ${data.leadsAdded || 0}`);

    if (data.error) {
      console.error(`   Error: ${data.error}`);
    }

    if (data.leads && data.leads.length > 0) {
      console.log(`\n📋 Sample Leads (showing first 3):`);
      data.leads.slice(0, 3).forEach((lead: any, i: number) => {
        console.log(`   ${i + 1}. ${lead.business_name}`);
        console.log(`      Location: ${lead.location}`);
        console.log(`      Score: ${lead.opportunity_score}`);
        console.log(`      Website: ${lead.website || 'None'}`);
      });
    }

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

async function main() {
  console.log('🚀 Testing Production API');
  console.log('═'.repeat(60));

  // Test the queries that were failing
  await testSearch('plumbing companies in Eugene Oregon');
  await testSearch('halal smash burgers in Los Angeles');
  await testSearch('halal smash burgers in Michigan');

  console.log('\n✅ Testing complete!');
}

main();
