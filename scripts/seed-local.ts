import 'dotenv/config';
import postgres from 'postgres';

const TABLES = [
  { name: 'admins', columns: ['id', 'email', 'name', 'created_at'] },
  { name: 'organizations', columns: ['id', 'name', 'code', 'created_at', 'admin_id', 'is_hidden', 'custom_message_visible', 'custom_message', 'layouts_disabled'] },
  { name: 'periods', columns: ['id', 'organization_id', 'start_time', 'end_time', 'label', 'created_at'] },
  { name: 'rooms', columns: ['id', 'organization_id', 'label'] },
  { name: 'room_layouts', columns: ['id', 'organization_id', 'time_period_id', 'room_id', 'label', 'layout_data', 'created_at', 'updated_at', 'updated_by', 'approved_at', 'approved_by'] },
  { name: 'org_roles', columns: ['id', 'organization_id', 'user_id', 'role'] },
];

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  const prodUrl = process.env.DATABASE_URL;
  const localUrl = process.env.LOCAL_DATABASE_URL;

  if (!prodUrl) throw new Error('DATABASE_URL is not set');
  if (!localUrl) throw new Error('LOCAL_DATABASE_URL is not set');

  const prod = postgres(prodUrl, { max: 1 });
  const local = postgres(localUrl, { max: 1 });

  try {
    console.log('Seeding local database from production...\n');

    for (const table of TABLES) {
      const rows = await prod.unsafe(`SELECT * FROM ${table.name}`);
      console.log(`  ${table.name}: ${rows.length} rows`);

      if (rows.length === 0) continue;

      await local.unsafe('BEGIN');
      try {
        await local.unsafe(`TRUNCATE ${table.name} RESTART IDENTITY CASCADE`);

        for (const row of rows) {
          const values = table.columns.map((col) => formatValue(row[col]));
          await local.unsafe(
            `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES (${values.join(', ')})`
          );
        }

        await local.unsafe('COMMIT');
      } catch (err) {
        await local.unsafe('ROLLBACK');
        throw err;
      }
    }

    console.log('\nDone.');
  } finally {
    await prod.end();
    await local.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
