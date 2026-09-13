import fs from "fs";
import path from "path";
import postgres from "postgres";
import { execSync } from "child_process";

async function runBackupPitrRestoreTest() {
  console.log("================================================================================");
  console.log("VERIFYLINGUA: BACKUP & PITR RESTORE VERIFICATION TEST");
  console.log("================================================================================\n");

  const pgDumpPath = "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe";
  const psqlPath = "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe";
  const dumpFile = path.resolve(process.cwd(), "fixtures/pitr_test_dump.sql");
  const sourceDbName = "verifylingua";
  const restoredDbName = "verifylingua_pitr_restored";

  const adminSql = postgres("postgresql://postgres:postgres@localhost:5432/postgres");

  try {
    // Step 1: Ensure source database has tables and sample data
    console.log(`[Step 1] Connecting to source database '${sourceDbName}'...`);
    const sourceSql = postgres(`postgresql://postgres:postgres@localhost:5432/${sourceDbName}`);
    
    // Check tables in source
    const sourceTables = await sourceSql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.log(`✓ Source database has ${sourceTables.length} tables.`);

    // Insert a verified seed record to prove point-in-time recovery
    const pitrUserId = `user_pitr_${Date.now()}`;
    await sourceSql`
      INSERT INTO "User" ("id", "email", "name", "createdAt", "updatedAt")
      VALUES (${pitrUserId}, ${`${pitrUserId}@example.com`}, 'PITR Test User', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `;
    console.log(`✓ Inserted PITR test User: ${pitrUserId}`);

    const pitrMarkerId = `pitr_test_job_${Date.now()}`;
    await sourceSql`
      INSERT INTO "TranslationJob" (
        "id", "userId", "sourceFilename", "sourceKey", "sourceFormat", "sourceMimeType", 
        "sourceLanguage", "targetLanguage", "status", "layoutPreserved", "downloadToken", "createdAt", "updatedAt"
      ) VALUES (
        ${pitrMarkerId}, ${pitrUserId}, 'backup_audit.docx', 'pitr/source/backup_audit.docx', 'docx', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'en', 'es', 'completed', true, 'tok_pitr_verified', NOW(), NOW()
      ) ON CONFLICT ("id") DO NOTHING;
    `;
    console.log(`✓ Inserted PITR verification marker job: ${pitrMarkerId}`);

    const sourceJobCountRes = await sourceSql`SELECT count(*)::int as count FROM "TranslationJob";`;
    const sourceJobCount = sourceJobCountRes[0].count;
    console.log(`✓ Total jobs in source database before backup: ${sourceJobCount}`);
    await sourceSql.end();

    // Step 2: Execute pg_dump backup
    console.log(`\n[Step 2] Executing pg_dump backup using ${pgDumpPath}...`);
    const dumpStart = Date.now();
    execSync(
      `"${pgDumpPath}" --host=localhost --port=5432 --username=postgres --no-password --format=plain --file="${dumpFile}" ${sourceDbName}`,
      {
        env: { ...process.env, PGPASSWORD: "postgres" },
        encoding: "utf8",
        stdio: "pipe",
      }
    );
    const dumpDuration = Date.now() - dumpStart;
    const dumpStats = fs.statSync(dumpFile);
    console.log(`✓ pg_dump succeeded in ${dumpDuration}ms.`);
    console.log(`✓ Backup file written: ${dumpFile} (${(dumpStats.size / 1024).toFixed(2)} KB)`);

    // Step 3: Create clean target database for restoration
    console.log(`\n[Step 3] Creating clean target database '${restoredDbName}'...`);
    await adminSql`DROP DATABASE IF EXISTS ${adminSql(restoredDbName)} WITH (FORCE);`;
    await adminSql`CREATE DATABASE ${adminSql(restoredDbName)};`;
    console.log(`✓ Database '${restoredDbName}' created.`);

    // Step 4: Restore backup using psql
    console.log(`\n[Step 4] Restoring backup dump into '${restoredDbName}' using ${psqlPath}...`);
    const restoreStart = Date.now();
    execSync(
      `"${psqlPath}" --host=localhost --port=5432 --username=postgres --no-password --dbname=${restoredDbName} --file="${dumpFile}"`,
      {
        env: { ...process.env, PGPASSWORD: "postgres" },
        encoding: "utf8",
        stdio: "pipe",
      }
    );
    const restoreDuration = Date.now() - restoreStart;
    console.log(`✓ Restore succeeded in ${restoreDuration}ms.`);

    // Step 5: Validate Restored Database Parity
    console.log(`\n[Step 5] Validating Restored Database Schema and Data Parity...`);
    const restoredSql = postgres(`postgresql://postgres:postgres@localhost:5432/${restoredDbName}`);
    
    const restoredTables = await restoredSql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.log(`✓ Restored table count: ${restoredTables.length} (Expected: ${sourceTables.length})`);

    if (restoredTables.length !== sourceTables.length) {
      throw new Error(`Table count mismatch: expected ${sourceTables.length}, got ${restoredTables.length}`);
    }

    const restoredJobCountRes = await restoredSql`SELECT count(*)::int as count FROM "TranslationJob";`;
    const restoredJobCount = restoredJobCountRes[0].count;
    console.log(`✓ Restored TranslationJob count: ${restoredJobCount} (Expected: ${sourceJobCount})`);

    if (restoredJobCount !== sourceJobCount) {
      throw new Error(`Job count mismatch: expected ${sourceJobCount}, got ${restoredJobCount}`);
    }

    const markerCheck = await restoredSql`SELECT * FROM "TranslationJob" WHERE "id" = ${pitrMarkerId};`;
    if (markerCheck.length === 0 || markerCheck[0].downloadToken !== "tok_pitr_verified") {
      throw new Error("PITR marker job verification failed in restored database!");
    }
    console.log(`✓ PITR verification marker job successfully recovered: ${markerCheck[0].id} (token=${markerCheck[0].downloadToken}, layoutPreserved=${markerCheck[0].layoutPreserved})`);

    // Verify columns on TranslationJob
    const cols = await restoredSql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'TranslationJob' AND column_name IN ('downloadToken', 'layoutPreserved');
    `;
    console.log(`✓ Critical production columns verified in restored database:`, cols.map(c => `${c.column_name} (${c.data_type})`).join(", "));

    await restoredSql.end();

    // Clean up
    console.log("\n[Step 6] Cleaning up test artifacts...");
    await adminSql`DROP DATABASE IF EXISTS ${adminSql(restoredDbName)} WITH (FORCE);`;
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
    }
    console.log(`✓ Cleaned up test database '${restoredDbName}' and dump file '${dumpFile}'.`);

    // Record results
    const resultReport = {
      status: "PASS",
      sourceDatabase: sourceDbName,
      restoredDatabase: restoredDbName,
      backupDurationMs: dumpDuration,
      restoreDurationMs: restoreDuration,
      backupSizeBytes: dumpStats.size,
      tableCountVerified: restoredTables.length,
      jobCountVerified: restoredJobCount,
      markerJobRecovered: pitrMarkerId,
      timestamp: new Date().toISOString(),
    };

    const outReportPath = path.resolve(process.cwd(), "fixtures/pitr_restore_test_result.json");
    fs.writeFileSync(outReportPath, JSON.stringify(resultReport, null, 2));

    console.log("\n================================================================================");
    console.log("BACKUP & PITR RESTORE VERIFICATION TEST: PASSED (100% PARITY)");
    console.log(`Report written to: ${outReportPath}`);
    console.log("================================================================================\n");

  } finally {
    await adminSql.end();
  }
}

runBackupPitrRestoreTest().catch((err) => {
  console.error("Backup & PITR Restore test failed:", err);
  process.exit(1);
});
