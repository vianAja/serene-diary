import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

let sqlClient: postgres.Sql | null = null;
let database: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (
    !connectionString ||
    (!connectionString.startsWith("postgres://") &&
      !connectionString.startsWith("postgresql://"))
  ) {
    return null;
  }

  if (!database) {
    try {
      sqlClient = postgres(connectionString, {
        prepare: false, // Important for Supabase transaction pooler (pgbouncer)
        max: 5,
        connect_timeout: 10,
        idle_timeout: 20,
      });
      database = drizzle(sqlClient, { schema });
    } catch (error) {
      console.error("Failed to initialize database client:", error);
      return null;
    }
  }

  return database;
}
