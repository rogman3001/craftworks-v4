const Tesseract = require("tesseract.js");

async function readTextFromImage(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, "deu", {
      logger: info => console.log(info), // Fortschritt
    });
    return text;
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Fehler bei der Texterkennung");
  }
}

module.exports = { readTextFromImage };
