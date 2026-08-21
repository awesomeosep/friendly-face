import 'dotenv/config';
import { db } from './app/server/db/index.ts';
import { organizationTable } from './app/server/db/schema.ts';
import { eq } from 'drizzle-orm';

const org = await db.query.organizationTable.findFirst({
  where: eq(organizationTable.code, 'LDHS26'),
  with: { rooms: true, periods: true, room_layouts: true },
});

console.log(JSON.stringify(org, null, 2));
