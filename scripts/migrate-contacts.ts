/**
 * Migration script for contacts/companies/deals system
 * Adds proper CRM functionality on top of leads
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'leadly.db');
const db = new Database(dbPath);

async function migrateCRM() {
  console.log('🚀 Starting CRM migration...\\n');

  try {
    // Create contacts table (individual people within businesses)
    console.log('📋 Creating contacts table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        lead_id TEXT,
        user_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        title TEXT,
        department TEXT,
        is_primary BOOLEAN DEFAULT 0,
        linkedin_url TEXT,
        notes TEXT,
        last_contact_date TEXT,
        next_follow_up TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ contacts table created');

    // Create companies table (superset of leads, for better organization)
    console.log('\\n📋 Creating companies table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        country TEXT DEFAULT 'USA',
        employee_count INTEGER,
        annual_revenue INTEGER,
        description TEXT,
        logo_url TEXT,
        linkedin_url TEXT,
        twitter_url TEXT,
        facebook_url TEXT,
        tags TEXT,
        status TEXT DEFAULT 'prospect',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ companies table created');

    // Create deals/opportunities table
    console.log('\\n📋 Creating deals table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT,
        lead_id TEXT,
        contact_id TEXT,
        title TEXT NOT NULL,
        value REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        stage TEXT DEFAULT 'discovery',
        probability INTEGER DEFAULT 10,
        expected_close_date TEXT,
        actual_close_date TEXT,
        description TEXT,
        notes TEXT,
        lost_reason TEXT,
        status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      )
    `);
    console.log('  ✓ deals table created');

    // Create activities/interactions table
    console.log('\\n📋 Creating activities table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lead_id TEXT,
        company_id TEXT,
        contact_id TEXT,
        deal_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        completed BOOLEAN DEFAULT 0,
        completed_at TEXT,
        priority TEXT DEFAULT 'medium',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ activities table created');

    // Create notes table (unified notes for any entity)
    console.log('\\n📋 Creating notes table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lead_id TEXT,
        company_id TEXT,
        contact_id TEXT,
        deal_id TEXT,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ notes table created');

    // Create indexes for performance
    console.log('\\n📊 Creating indexes...');

    db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status)`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status)`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_completed ON activities(completed)`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id)`);

    console.log('  ✓ All indexes created');

    // Add company_id to leads table for linking
    console.log('\\n📋 Adding company_id to leads table...');
    const leadsInfo = db.pragma('table_info(leads)') as any[];
    const hasCompanyId = leadsInfo.some((col: any) => col.name === 'company_id');

    if (!hasCompanyId) {
      db.exec(`ALTER TABLE leads ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE SET NULL`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id)`);
      console.log('  ✓ Added company_id to leads');
    } else {
      console.log('  ✓ company_id already exists in leads');
    }

    // Verify the schema
    console.log('\\n✅ Verifying schema...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name IN ('contacts', 'companies', 'deals', 'activities', 'notes')
      ORDER BY name
    `).all();

    if (tables.length > 0) {
      console.log('  New tables created:');
      tables.forEach((table: any) => {
        console.log(`    - ${table.name}`);
      });
    }

    // Check current data
    console.log('\\n📈 Current data:');
    const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as any;
    const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get() as any;
    const dealCount = db.prepare('SELECT COUNT(*) as count FROM deals').get() as any;
    console.log(`  - Contacts: ${contactCount.count}`);
    console.log(`  - Companies: ${companyCount.count}`);
    console.log(`  - Deals: ${dealCount.count}`);

    console.log('\\n✨ CRM migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
migrateCRM()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
