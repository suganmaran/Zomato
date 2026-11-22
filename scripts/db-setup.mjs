// Applies db/schema.sql to the database in DATABASE_URL, then prints the rows.
// Run with: npm run db:setup
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Add it to .env.local and try again.");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// The Neon HTTP driver runs one statement at a time, so split the file on
// semicolons. This schema has no semicolons inside strings or functions.
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log("\nrestaurants");
console.table(await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`);

console.log("\nreviews");
console.table(
  await sql`SELECT id, restaurant_id, rating, comment, created_at
            FROM reviews ORDER BY created_at ASC`
);

console.log(
  "\nDone. Note: there is no average_rating column and no latest_review column."
);
