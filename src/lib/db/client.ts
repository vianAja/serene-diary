import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@/lib/db/schema";

neonConfig.webSocketConstructor = ws;

function createDatabase(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle({ client: pool, schema });
}

let database: ReturnType<typeof createDatabase> | null = null;

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
      database = createDatabase(connectionString);
    } catch (error) {
      console.error("Failed to initialize database client:", error);
      return null;
    }
  }

  return database;
}
