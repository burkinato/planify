const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const regions = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
];

const connectionPassword = 'CBIsil123$$..'; // From run-migrations.js

async function runAdminMigrations() {
  for (const pooler of regions) {
    const connectionString = `postgresql://postgres.rjutnbgeqesyzokqrdmx:${connectionPassword}@${pooler}:6543/postgres`;
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      console.log('Trying DB on', pooler);
      await client.connect();
      console.log('Connected to', pooler);

      const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '007_admin_system.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');

      console.log('Executing 007_admin_system.sql...');
      await client.query(sql);
      console.log('Migration 007 executed successfully.');

      await client.end();
      return;
    } catch (err) {
      console.error('Migration failed on', pooler, err.message);
      try { await client.end(); } catch {}
    }
  }
  console.error('All regions failed for migration.');
}

runAdminMigrations();
