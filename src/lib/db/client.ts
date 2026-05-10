import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/lib/db/schema";

function createDatabase(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle({ client: sql, schema });
}

let database: ReturnType<typeof createDatabase> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!database) {
    database = createDatabase(connectionString);
  }

  return database;
}
