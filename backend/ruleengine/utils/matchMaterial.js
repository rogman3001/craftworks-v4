
// matchMaterial.js - Utility für robustes Material-Matching
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9äöüß\s]/g, "").trim();
}

function matchMaterial(beschreibung, materialKeywords) {
  const descNorm = normalizeText(beschreibung);
  for (const keyword of materialKeywords) {
    const keyNorm = normalizeText(keyword);
    if (descNorm.includes(keyNorm)) {
      return true;
    }
    if (levenshtein(descNorm, keyNorm) <= 2) {
      return true;
    }
  }
  return false;
}

module.exports = { matchMaterial };
