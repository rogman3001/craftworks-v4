const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { parsePositions } = require("./ruleengine/utils/parsePositions");
const applyRules = require("./ruleengine/engine/applyRules");
const Tesseract = require("tesseract.js");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.use(bodyParser.json());

// CORS nur bei lokaler Runtime aktivieren
if (process.env.NODE_ENV !== "production") {
  console.log("CORS aktiviert für lokale Entwicklung");
  app.use(cors());
}

app.post("/bewerten", upload.single("file"), async (req, res) => {
  const apiKey = req.header("x-api-key");
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Ungültiger API-Key" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Keine Datei hochgeladen" });
    }

    // OCR
    const ocrResult = await Tesseract.recognize(req.file.path, "deu", { logger: m => {} });
    const extractedText = ocrResult.data.text;

    // Parsing
    const parsedPositions = parsePositions(extractedText);

    // Angebotssumme
    const angebotssumme = parsedPositions.reduce((sum, pos) => sum + pos.preis * (pos.menge || 1), 0);
    const marktdurchschnitt = angebotssumme * 0.85; // Platzhalter

    // Strukturierter Basis-Report
    const report = applyRules(parsedPositions, angebotssumme, marktdurchschnitt);

    // Beispielpositionen hinzufügen
    report.beispielPositionen = parsedPositions.slice(0, 2).map(pos => ({
    preis: pos.preis,
    einheit: pos.einheit,
    menge: pos.menge,
    mengeEinheit: pos.mengeEinheit
  }));

    res.json(report);
  } catch (err) {
    console.error("Fehler bei der Bewertung:", err);
    res.status(500).json({ error: "Interner Fehler", details: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API läuft auf http://0.0.0.0:${PORT}`);
});
