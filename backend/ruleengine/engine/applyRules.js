
const loadRules = require("./loadRules");
const rules = loadRules(); // Regelkatalog wird einmal beim Start geladen

function applyRules(positionen, angebotssumme, marktdurchschnitt) {
  const bewertungen = [];

  for (const pos of positionen) {
    for (const regel of rules) {
      if (
        regel.typ &&
        pos.typ &&
        regel.typ.toLowerCase() === pos.typ.toLowerCase()
      ) {
        if (regel.grenzwert && pos.preis && pos.preis > regel.grenzwert) {
          bewertungen.push({
            typ: regel.typ,
            anzahl: 1,
            beschreibung: regel.beschreibung,
          });
        }
      }
    }
  }

  return {
    ampel: angebotssumme > marktdurchschnitt * 1.1 ? "gelb" : "grün",
    fairnessScore: 82,
    bewertungKurz: angebotssumme > marktdurchschnitt ? "Eher teuer" : "Preislich fair",
    bewertungLang: angebotssumme > marktdurchschnitt
      ? "Das Angebot liegt über dem Durchschnitt. Prüfen Sie Details zu einzelnen Positionen."
      : "Das Angebot liegt im marktüblichen Bereich.",
    angebotssumme,
    marktdurchschnitt,
    probleme: bewertungen
  };
}

module.exports = applyRules;
