const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./ruleengine/db/index");
const { applyRules } = require("./ruleengine/engine/applyRules");

require("dotenv").config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

//app.use(cors()); Nur bei lokaler runtime wieder einfügen
app.use(bodyParser.json());

function auth(req, res, next) {
  if (req.header("x-api-key") !== API_KEY) {
    return res.status(403).json({ error: "Ungültiger API-Key" });
  }
  next();
}

// Angebot anlegen
app.post("/angebote", auth, async (req, res) => {
  const { region_id, anonymized_metadata, positions } = req.body;

  if (!positions || !Array.isArray(positions) || positions.length === 0) {
    return res.status(400).json({ error: "Positionen fehlen" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: offerRows } = await client.query(
      `INSERT INTO offers (region_id, anonymized_metadata)
       VALUES ($1, $2) RETURNING id`,
      [region_id || null, anonymized_metadata || null]
    );
    const offerId = offerRows[0].id;

    for (const pos of positions) {
      await client.query(
        `INSERT INTO positions (offer_id, gewerk_id, einheit, menge, gesamtpreis)
         VALUES ($1, $2, $3, $4, $5)`,
        [offerId, pos.gewerk_id, pos.einheit, pos.menge, pos.gesamtpreis]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ offer_id: offerId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Fehler beim Anlegen", details: err.message });
  } finally {
    client.release();
  }
});

// Angebot bewerten
app.post("/bewerten", auth, async (req, res) => {
  const { offer_id } = req.body;

  if (!offer_id) {
    return res.status(400).json({ error: "offer_id fehlt" });
  }

  try {
    const { rows: offerRows } = await pool.query(
      "SELECT id, region_id FROM offers WHERE id = $1",
      [offer_id]
    );

    if (offerRows.length === 0) {
      return res.status(404).json({ error: "Angebot nicht gefunden" });
    }

    const regionId = offerRows[0].region_id;

    const { rows: positions } = await pool.query(
      "SELECT id, gewerk_id, einheit, menge, gesamtpreis FROM positions WHERE offer_id = $1",
      [offer_id]
    );

    if (positions.length === 0) {
      return res.status(404).json({ error: "Keine Positionen gefunden" });
    }

    const result = await applyRules(positions, regionId);
    res.json({ offer_id, ergebnis: result });
  } catch (err) {
    res.status(500).json({ error: "Interner Fehler", details: err.message });
  }
});

// Angebot abrufen
app.get("/angebote/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: offerRows } = await pool.query(
      "SELECT * FROM offers WHERE id = $1",
      [id]
    );

    if (offerRows.length === 0) {
      return res.status(404).json({ error: "Angebot nicht gefunden" });
    }

    const { rows: positions } = await pool.query(
      "SELECT id, gewerk_id, einheit, menge, gesamtpreis FROM positions WHERE offer_id = $1",
      [id]
    );

    res.json({ ...offerRows[0], positions });
  } catch (err) {
    res.status(500).json({ error: "Interner Fehler", details: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API läuft auf http://0.0.0.0:${PORT}`);
});
