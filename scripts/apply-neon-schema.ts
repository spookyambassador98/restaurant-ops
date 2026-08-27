import "dotenv/config";
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = neon(url);
  const script = readFileSync("prisma/neon-init.sql", "utf8").replace(/\r\n/g, "\n");

  const statements = script
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);

  console.log(`Applying ${statements.length} statements via Neon HTTP...`);

  for (const [i, statement] of statements.entries()) {
    try {
      await sql.query(statement);
      console.log(`OK ${i + 1}/${statements.length}: ${statement.slice(0, 50).replace(/\n/g, " ")}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("duplicate")) {
        console.log(`SKIP ${i + 1}: ${message.slice(0, 100)}`);
        continue;
      }
      console.error(`FAIL ${i + 1}:`, statement.slice(0, 200));
      throw err;
    }
  }

  console.log("Schema applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
