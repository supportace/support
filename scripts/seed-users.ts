import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";

config({ path: ".env.local" });

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL niet ingesteld in .env.local");
  process.exit(1);
}

const client = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(client);

function hashPassword(password: string): string {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

const users = [
  {
    email: "testalgemeen",
    password: hashPassword("algemeentesten"),
    role: "user" as const,
    name: "Test Algemeen",
  },
  {
    email: "Sanna",
    password: hashPassword("arjanislief"),
    role: "user" as const,
    name: "Sanna",
  },
  {
    email: "Arjan",
    password: hashPassword("sannaislief"),
    role: "admin" as const,
    name: "Arjan",
  },
];

async function seed() {
  console.log("Gebruikers aanmaken...");

  for (const u of users) {
    try {
      const existing = await db.execute(
        `SELECT id FROM "User" WHERE email = '${u.email}' LIMIT 1`
      );
      if (existing.length > 0) {
        await db.execute(
          `UPDATE "User" SET password = '${u.password}', role = '${u.role}', name = '${u.name}' WHERE email = '${u.email}'`
        );
        console.log(`↻ ${u.email} (${u.role}) — bijgewerkt`);
      } else {
        await db.execute(
          `INSERT INTO "User" (email, password, role, name, "emailVerified", "isAnonymous")
           VALUES ('${u.email}', '${u.password}', '${u.role}', '${u.name}', false, false)`
        );
        console.log(`✓ ${u.email} (${u.role}) — aangemaakt`);
      }
    } catch (err) {
      console.error(`✗ ${u.email}:`, err);
    }
  }

  console.log("Klaar!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed mislukt:", err);
  process.exit(1);
});
