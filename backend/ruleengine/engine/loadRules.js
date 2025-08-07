const fs = require("fs");
const path = require("path");

function loadRules(pathToCatalog = "./ruleCatalog_v5.json") {
  const fullPath = path.resolve(__dirname, "..", "utils", pathToCatalog);
  const content = fs.readFileSync(fullPath, "utf8");

  try {
    const json = JSON.parse(content);
    if (Array.isArray(json)) {
      return json;
    } else if (json && Array.isArray(json.regeln)) {
      return json.regeln;
    } else {
      console.warn("⚠️ Keine gültige Regelstruktur gefunden. Leeres Regelset wird verwendet.");
      return [];
    }
  } catch (err) {
    console.error("❌ Fehler beim Parsen des Regelkatalogs:", err.message);
    return [];
  }
}

module.exports = loadRules;
