import postgres from "postgres";
import { execSync } from "child_process";

async function main() {
  console.log("=== TESTING PRISMA MIGRATIONS AGAINST CLEAN DATABASE ===");

  const adminSql = postgres("postgresql://postgres:postgres@localhost:5432/postgres");

  try {
    // 1. Drop existing test database if present
    console.log("Step 1: Dropping old test database if exists...");
    await adminSql`DROP DATABASE IF EXISTS verifylingua_clean_test WITH (FORCE);`;

    // 2. Create fresh clean database
    console.log("Step 2: Creating fresh clean database 'verifylingua_clean_test'...");
    await adminSql`CREATE DATABASE verifylingua_clean_test;`;
    console.log("✓ Clean database created successfully.");
  } finally {
    await adminSql.end();
  }

  // 3. Run prisma migrate deploy against the clean database
  console.log("Step 3: Executing 'npx prisma migrate deploy' on clean database...");
  const cleanDbUrl = "postgresql://postgres:postgres@localhost:5432/verifylingua_clean_test?schema=public";
  
  const deployOutput = execSync("npx prisma migrate deploy", {
    env: {
      ...process.env,
      DATABASE_URL: cleanDbUrl,
    },
    encoding: "utf8",
  });
  console.log("Migration Deploy Output:\n", deployOutput);

  // 4. Verify columns in TranslationJob in the clean database
  console.log("Step 4: Verifying schema and columns in clean database...");
  const cleanSql = postgres("postgresql://postgres:postgres@localhost:5432/verifylingua_clean_test");
  try {
    const columns = await cleanSql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'TranslationJob'
      AND column_name IN ('downloadToken', 'layoutPreserved')
      ORDER BY column_name;
    `;

    console.log("Verified TranslationJob columns:", columns);

    if (columns.length < 2) {
      throw new Error(`Expected 2 columns (downloadToken, layoutPreserved), found ${columns.length}`);
    }

    const tableCount = await cleanSql`
      SELECT count(*)::int as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    console.log("Total tables created in clean database:", tableCount[0].count);

    const migrationRecord = await cleanSql`
      SELECT migration_name, finished_at, rolled_back_at 
      FROM _prisma_migrations;
    `;
    console.log("Prisma migration record:", migrationRecord);

    console.log("\n========================================================");
    console.log("CLEAN DATABASE MIGRATION TEST: 100% PASS");
    console.log("========================================================");
  } finally {
    await cleanSql.end();
  }
}

main().catch((err) => {
  console.error("Migration test failed:", err);
  process.exit(1);
});
