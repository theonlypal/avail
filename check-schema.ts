import { Client } from 'pg';

async function checkSchema() {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'id'
  `);
  
  console.log('teams.id type:', result.rows[0]);
  await client.end();
}

checkSchema();
