import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - Database features will be disabled");
}

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export default sql;
