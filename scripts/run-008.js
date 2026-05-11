const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rjutnbgeqesyzokqrdmx:CBIsil123$$..@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/migrations/008_admin_settings.sql', 'utf8');
    await client.query(sql);
    console.log('Migration 008 executed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
