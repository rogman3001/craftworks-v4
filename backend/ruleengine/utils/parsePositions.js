
const normalizePriceString = (str) => {
  try {
    if (!str) return null;
    return parseFloat(str.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, ''));
  } catch (err) {
    return null;
  }
};

function parsePositions(text) {
  const lines = text.split('\n');
  const positions = [];

  const regex = /(\d+(?:[.,]\d+)?)\s*(stk|std|m|m\*|m²|qm|pauschal|stück)?[^\d]*(\d+(?:[.,]\d+)?)?\s*€?/i;

  for (const line of lines) {
    const match = regex.exec(line.toLowerCase());
    if (match) {
      const menge = normalizePriceString(match[1]);
      const einheit = match[2] || null;
      const preis = normalizePriceString(match[3]);
      if (menge && preis) {
        positions.push({
          menge,
          mengeEinheit: einheit,
          preis,
          einheit: "€",
        });
      } else if (preis) {
        positions.push({
          menge: null,
          mengeEinheit: einheit,
          preis,
          einheit: "€",
        });
      }
    }
  }
  return positions;
}

module.exports = { parsePositions };
