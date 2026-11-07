import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts plain text from an uploaded CV buffer (PDF, DOCX, TXT).
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName = "",
  mimeType = ""
): Promise<string> {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  // 1. PDF
  if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const pdfData = await parser.getText();
      return pdfData.text || "";
    } finally {
      await parser.destroy();
    }
  }

  // 2. DOCX (Word)
  if (
    lowerName.endsWith(".docx") ||
    lowerMime.includes("wordprocessingml") ||
    lowerMime.includes("officedocument")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // 3. Plain Text / Markdown
  if (
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerMime.includes("text/plain")
  ) {
    return buffer.toString("utf-8");
  }

  // 4. DOC (legacy binary) or unknown - try mammoth first, then string fallback
  try {
    const docxResult = await mammoth.extractRawText({ buffer });
    if (docxResult.value && docxResult.value.trim().length > 20) {
      return docxResult.value;
    }
  } catch {
    // ignore
  }

  // Last resort text decode
  const rawDecoded = buffer.toString("utf-8");
  // Check if it has mostly printable characters
  const printableChars = rawDecoded.replace(/[^\x20-\x7E\r\n\t]/g, "");
  if (printableChars.length > 50) {
    return printableChars;
  }

  throw new Error(
    "Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file."
  );
}

