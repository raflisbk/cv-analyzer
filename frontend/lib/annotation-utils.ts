/**
 * annotation-utils.ts — Annotation coordinate mapping utilities.
 *
 * Phase 13 deliverable: proof-of-concept text substring → PDF bounding rect.
 * Digunakan oleh annotation spike untuk memvalidasi pendekatan sebelum
 * membangun annotation overlay di Phase 14.
 *
 * Algorithm:
 * 1. Panggil page.getTextContent() untuk mendapatkan TextItem array
 * 2. Setiap TextItem memiliki transform [a,b,c,d,tx,ty] di mana tx/ty = bottom-left position
 * 3. Temukan item yang mengandung searchText
 * 4. Konversi koordinat PDF (bottom-up) ke viewport space (top-down) via viewport.convertToViewportPoint()
 * 5. Return SuggestionAnchor dengan rect
 */

/** Data structure untuk anchor koordinat saran ke PDF */
export interface SuggestionAnchor {
  section: string; // nama section, e.g. "experience"
  searchText: string; // substring yang dipakai untuk locate rect
  charOffset: number; // character offset dari section start (untuk future use)
  length: number; // jumlah karakter
  pageIndex: number; // 0-indexed page number
  rect: {
    x: number; // viewport x (pixels, dari kiri)
    y: number; // viewport y (pixels, dari atas)
    w: number; // lebar dalam viewport pixels
    h: number; // tinggi dalam viewport pixels
  };
}

/**
 * Cari bounding rect untuk text substring pada PDF page.
 *
 * @param page - PDFPageProxy dari react-pdf onLoadSuccess callback
 * @param searchText - text substring yang dicari (case-sensitive)
 * @param pageIndex - 0-indexed page number (untuk SuggestionAnchor)
 * @param section - nama section (untuk SuggestionAnchor)
 * @returns SuggestionAnchor jika ditemukan, null jika tidak ada match
 *
 * @example
 * // Dalam PdfViewerInner onPageLoadSuccess callback:
 * const anchor = await findTextRect(page, "Software Engineer", 0, "experience");
 * if (anchor) console.log("[Annotation Spike] rect:", anchor.rect);
 */
export async function findTextRect(
  page: unknown,
  searchText: string,
  pageIndex: number = 0,
  section: string = "unknown"
): Promise<SuggestionAnchor | null> {
  // Cast ke any untuk mengakses pdfjs-dist API yang tidak punya TypeScript types di scope ini
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfPage = page as any;

  try {
    const textContent = await pdfPage.getTextContent();
    const viewport = pdfPage.getViewport({ scale: 1.0 });

    for (const item of textContent.items) {
      // Filter hanya TextItem (bukan TextMarkedContent)
      if (!("str" in item) || !item.str) continue;

      const textItem = item as {
        str: string;
        transform: number[];
        width: number;
        height: number;
      };

      if (textItem.str.includes(searchText)) {
        // PDF transform: [a, b, c, d, tx, ty]
        // tx = x position (left), ty = y position (bottom-up dari PDF origin)
        const [, , , , tx, ty] = textItem.transform;

        // Konversi dari PDF coordinate space (bottom-up) ke viewport space (top-down)
        const [viewportX, viewportY] = viewport.convertToViewportPoint(tx, ty);

        return {
          section,
          searchText,
          charOffset: 0, // Untuk future use — exact char offset computation
          length: searchText.length,
          pageIndex,
          rect: {
            x: viewportX,
            y: viewportY - textItem.height, // Adjust ke top-left dari text item
            w: textItem.width,
            h: textItem.height,
          },
        };
      }
    }

    // Text tidak ditemukan — bisa karena:
    // 1. Text span multiple TextItems
    // 2. Case/whitespace mismatch
    // 3. Text tidak ada di page ini
    return null;
  } catch (err) {
    console.warn("[annotation-utils] findTextRect error:", err);
    return null;
  }
}
