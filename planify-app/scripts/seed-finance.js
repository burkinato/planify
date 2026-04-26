const { Client } = require('pg');

const regions = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
];

const connectionPassword = 'CBIsil123$$..';

async function seedFinanceData() {
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

      const sql = `
        INSERT INTO public.admin_finance (type, category, amount, description)
        VALUES 
          ('revenue', 'Subscription', 499.00, 'Pro Subscription - User #1245'),
          ('revenue', 'Subscription', 499.00, 'Pro Subscription - User #1289'),
          ('expense', 'Server', 150.00, 'Vercel Infrastructure'),
          ('expense', 'API', 45.00, 'Supabase Database Addon'),
          ('revenue', 'Subscription', 1299.00, 'Enterprise Plan - Corp X')
        ON CONFLICT DO NOTHING;
      `;

      await client.query(sql);
      console.log('Finance data seeded successfully.');

      await client.end();
      return;
    } catch (err) {
      console.error('Seeding failed on', pooler, err.message);
      try { await client.end(); } catch {}
    }
  }
}

seedFinanceData();
