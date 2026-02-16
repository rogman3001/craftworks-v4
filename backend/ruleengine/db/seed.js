const fs = require("fs");
const path = require("path");
const pool = require("./index");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Create tables
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);
    console.log("Schema erstellt.");

    // 2) Seed rules from JSON catalog
    const rules = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "engine", "ruleCatalog_v3.json"),
        "utf8"
      )
    );
    for (const r of rules) {
      await client.query(
        `INSERT INTO rules (rule_id, gewerk_id, einheit, alert_threshold, max_threshold, message)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (rule_id) DO UPDATE SET
           gewerk_id = EXCLUDED.gewerk_id,
           einheit = EXCLUDED.einheit,
           alert_threshold = EXCLUDED.alert_threshold,
           max_threshold = EXCLUDED.max_threshold,
           message = EXCLUDED.message`,
        [r.rule_id, r.gewerk_id, r.einheit, r.alert_threshold, r.max_threshold, r.message]
      );
    }
    console.log(`${rules.length} Regeln eingefügt.`);

    // 3) Seed price benchmarks
    const benchmarks = fs.readFileSync(
      path.join(__dirname, "price_benchmarks.sql"),
      "utf8"
    );
    await client.query("DELETE FROM price_benchmarks");
    await client.query(benchmarks);
    console.log("Preisbenchmarks eingefügt.");

    await client.query("COMMIT");
    console.log("Seed abgeschlossen.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed fehlgeschlagen:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
