const regions = [
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
];

async function tryConnect() {
  const [{ Client }, fs, path] = await Promise.all([
    import('pg'),
    import('node:fs'),
    import('node:path'),
  ]);

  for (const pooler of regions) {
    const connectionString = `postgresql://postgres.rjutnbgeqesyzokqrdmx:CBIsil123$$..@${pooler}:6543/postgres`;
    console.log('Trying', pooler);

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log('Connected to', pooler);

      const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

      console.log('Found migrations:', migrationFiles);

      for (const file of migrationFiles) {
        try {
          console.log(`Executing ${file}...`);
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await client.query(sql);
          console.log(`${file} executed successfully.`);
        } catch (fileErr) {
          const message = fileErr instanceof Error ? fileErr.message : String(fileErr);
          console.warn(`Skipping ${file}: ${message}`);
        }
      }

      await client.end();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed on', pooler, message);
    }
  }

  return false;
}

tryConnect().then((success) => {
  if (success) console.log('ALL DONE');
  else console.log('FAILED ALL');
});
