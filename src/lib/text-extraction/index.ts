import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { genAI, safeGenerateContent } from "../gemini";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function downloadFileFromStorage(filePath: string, supabaseClient?: any): Promise<ArrayBuffer> {
  const client = supabaseClient || supabase;
  const { data, error } = await client.storage.from("resumes").download(filePath);
  if (error || !data) throw new Error(`Failed to download file: ${error?.message || "No data"}`);

  return await data.arrayBuffer();
}

export async function extractTextFromBuffer(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  // 1. Check size (max 20MB)
  if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
    throw new Error("File size exceeds the maximum limit of 20MB.");
  }

  // 2. Reject executables (e.g. check for MZ header or .exe extension)
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "exe" || ext === "bat" || ext === "cmd" || ext === "sh" || ext === "msi") {
    throw new Error("Executable files are not allowed for security reasons.");
  }

  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 2));
  if (firstBytes[0] === 0x4d && firstBytes[1] === 0x5a) {
    throw new Error("Invalid file content: executable MZ header detected.");
  }

  // 3. Compute hash and check OCR cache
  const fileHash = createHash("sha256").update(Buffer.from(arrayBuffer)).digest("hex");
  try {
    const { data: cacheData, error: cacheErr } = await supabase
      .from("ocr_cache")
      .select("extracted_text")
      .eq("file_hash", fileHash)
      .maybeSingle();

    if (!cacheErr && cacheData?.extracted_text) {
      console.log("Returning cached extracted text for hash:", fileHash);
      return cacheData.extracted_text;
    }
  } catch (dbErr) {
    console.error("Error reading from ocr_cache:", dbErr);
  }

  let extractedText = "";

  if (ext === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const { getData } = await import("pdf-parse/worker");

    PDFParse.setWorker(getData());

    let parser;
    try {
      parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    } catch (parseErr: any) {
      if (parseErr?.name === "PasswordException" || parseErr?.message?.includes("password")) {
        throw new Error("This PDF file is password-protected. Please remove the password and try again.");
      }
      throw new Error("Failed to load PDF. The file may be corrupted.");
    }

    try {
      const textResult = await parser.getText();
      extractedText = textResult.text || "";

      // Step 2 & 3: If extracted text length > 300, accept it. Otherwise trigger OCR
      if (extractedText.trim().length > 300) {
        await parser.destroy();
      } else {
        console.log("PDF text length <= 300 (length is " + extractedText.trim().length + "). Triggering page-by-page Gemini Vision OCR fallback...");
        
        // Get screenshots of all pages for OCR
        const screenshotResult = await parser.getScreenshot({ scale: 1.5, imageBuffer: true });
        await parser.destroy();

        if (!screenshotResult?.pages || screenshotResult.pages.length === 0) {
          throw new Error("Failed to render PDF pages for OCR.");
        }

        const pagesText: string[] = [];

        for (const page of screenshotResult.pages) {
          const base64Data = Buffer.from(page.data).toString("base64");
          
          let pageText = "";
          try {
            pageText = await safeGenerateContent([
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/png"
                }
              },
              "You are an ATS parser. Extract every visible word from this resume page. Do not summarize. Preserve formatting. Preserve bullet points. Return only resume text."
            ], "gemini-2.5-flash");
          } catch (ocrErr) {
            console.error(`OCR failed for page ${page.pageNumber}:`, ocrErr);
            throw ocrErr;
          }
          
          if (pageText) {
            pagesText.push(pageText.trim());
          }
        }

        extractedText = pagesText.join("\n\n");
      }
    } catch (err: any) {
      if (err?.name === "PasswordException" || err?.message?.includes("password")) {
        throw new Error("This PDF file is password-protected. Please remove the password and try again.");
      }
      throw err;
    }
  } else if (ext === "docx") {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      extractedText = result.value || "";
    } catch (err) {
      throw new Error("Failed to parse DOCX. The file may be corrupted.");
    }
  } else if (ext === "txt") {
    extractedText = Buffer.from(arrayBuffer).toString("utf8");
  } else if (ext === "doc") {
    // OLD .doc format is not supported by mammoth. Instruct user to convert
    throw new Error("The older .doc format is not directly supported. Please convert your file to .docx or .pdf and upload it again.");
  } else {
    throw new Error(`Unsupported file type: .${ext}. Only PDF, DOCX, and TXT are supported.`);
  }

  const cleanedText = extractedText.trim();
  if (!cleanedText) {
    throw new Error("No text content could be extracted from this document.");
  }

  // 4. Save to OCR cache for performance optimization (Step 15)
  try {
    await supabase.from("ocr_cache").insert({
      file_hash: fileHash,
      extracted_text: cleanedText
    });
  } catch (cacheSaveErr) {
    // Ignore cache insert errors (e.g. duplicate key)
    console.error("Cache save error:", cacheSaveErr);
  }

  return cleanedText;
}
