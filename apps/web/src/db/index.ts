import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://realdeal:realdeal@localhost:5432/realdeal";

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
