/**
 * Photo-to-search OCR seam.
 *
 * STUBBED for now — returns null, so photo uploads simply skip the
 * "already answered?" lookup and the ask flow continues normally. All the
 * surrounding plumbing is live: `POST /api/ocr` accepts the photo, calls
 * this, and runs the extracted text through the same answer-bank search
 * the title field uses.
 *
 * To turn OCR on later, replace the body of extractTextFromImage with one
 * of:
 *
 * 1. tesseract.js (free, self-hosted, ~no setup):
 *      npm install tesseract.js
 *      const { createWorker } = await import("tesseract.js");
 *      const worker = await createWorker("eng");
 *      const { data } = await worker.recognize(buffer);
 *      await worker.terminate();
 *      return data.text || null;
 *    Notes: ~2–5s per image on a small server; fine for this flow since
 *    it runs once per photo. Bundle the eng traineddata or let it fetch
 *    from the CDN at runtime (Railway allows outbound network).
 *
 * 2. A vision API (Anthropic/Google/AWS) if/when an API key budget exists —
 *    higher accuracy on handwriting, per-call cost.
 *
 * Nothing else needs to change — the route, the form wiring, and the
 * search behind it are already done.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string | null> {
  console.log(
    `[ocr:stub] Photo received (${buffer.length} bytes) — OCR not enabled yet, skipping text extraction.`
  );
  return null;
}
