import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL or LOCAL_DATABASE_URL environment variable');
}

const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

