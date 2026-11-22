import { neon } from "@neondatabase/serverless";

/**
 * Creates a database client from the DATABASE_URL environment variable.
 * Called inside each request so a missing variable fails loudly at runtime
 * instead of silently at build time.
 */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
}
