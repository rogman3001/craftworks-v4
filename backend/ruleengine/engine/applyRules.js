const pool = require("../db/index");
const staticRules = require("./ruleCatalog_v3.json");

async function loadRules() {
  try {
    const { rows } = await pool.query(
      "SELECT rule_id, gewerk_id, einheit, alert_threshold, max_threshold, message FROM rules"
    );
    if (rows.length > 0) return rows;
  } catch {
    // DB unavailable – fall back to static JSON
  }
  return staticRules;
}

async function loadBenchmark(gewerkId, einheit, regionId) {
  try {
    const { rows } = await pool.query(
      `SELECT unterer_preis, oberer_preis FROM price_benchmarks
       WHERE gewerk_id = $1 AND art = $2
         AND (region_id = $3 OR region_id IS NULL)
       ORDER BY region_id NULLS LAST
       LIMIT 1`,
      [gewerkId, einheit, regionId || null]
    );
    if (rows.length > 0) return rows[0];
  } catch {
    // DB unavailable – no benchmark data
  }
  return null;
}

async function applyRules(positions, regionId) {
  const rules = await loadRules();
  const results = [];

  for (const pos of positions) {
    const applicable = rules.filter(
      (r) =>
        r.gewerk_id === pos.gewerk_id &&
        r.einheit === pos.einheit &&
        pos.gesamtpreis > r.alert_threshold
    );

    let bewertung = "grün";
    const kommentare = [];

    for (const rule of applicable) {
      if (pos.gesamtpreis > rule.max_threshold) {
        bewertung = "rot";
        kommentare.push(rule.message);
      } else if (bewertung !== "rot") {
        bewertung = "gelb";
        kommentare.push(rule.message);
      }
    }

    const benchmark = await loadBenchmark(pos.gewerk_id, pos.einheit, regionId);

    results.push({
      position_id: pos.id,
      bewertung,
      kommentare,
      benchmark: benchmark
        ? { unterer_preis: benchmark.unterer_preis, oberer_preis: benchmark.oberer_preis }
        : null,
    });
  }

  return results;
}

module.exports = { applyRules };
