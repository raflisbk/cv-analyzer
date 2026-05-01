

export interface SuggestionAnchor {
  section: string;
  searchText: string;
  charOffset: number;
  length: number;
  pageIndex: number;
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

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
      if (!("str" in item) || !item.str) { continue; }

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
          charOffset: 0,
          length: searchText.length,
          pageIndex,
          rect: {
            x: viewportX,
            y: viewportY - textItem.height,
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
