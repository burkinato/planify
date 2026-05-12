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

async function runLatestMigrations() {
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

      const migrationsToRun = [
        '016_security_and_anti_fraud.sql',
        '017_admin_crm_extension.sql',
        '018_fix_login_logs_rls.sql'
      ];

      for (const file of migrationsToRun) {
        const migrationPath = path.join(process.cwd(), 'planify-app', 'supabase', 'migrations', file);
        if (fs.existsSync(migrationPath)) {
          console.log(`Executing ${file}...`);
          const sql = fs.readFileSync(migrationPath, 'utf8');
          try {
            await client.query(sql);
            console.log(`Migration ${file} executed successfully.`);
          } catch (e) {
            console.error(`Error executing ${file}:`, e.message);
          }
        } else {
          console.error(`File not found: ${migrationPath}`);
        }
      }

      await client.end();
      return;
    } catch (err) {
      console.error('Migration failed on', pooler, err.message);
      try { await client.end(); } catch {}
    }
  }
  console.error('All regions failed for migration.');
}

runLatestMigrations();
