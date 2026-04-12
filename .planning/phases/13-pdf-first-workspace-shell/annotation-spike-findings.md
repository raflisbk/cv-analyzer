# Annotation Coordinate Spike — Phase 13 Findings

**Date:** 2026-04-14
**Status:** Proof-of-concept implemented
**File:** `frontend/lib/annotation-utils.ts`

---

## Goal

Validasi apakah `pdfPage.getTextContent()` dari pdfjs-dist bisa digunakan untuk memetakan
text substring dari saran AI ke bounding rect pada canvas PDF, sebelum membangun annotation
overlay di Phase 14.

---

## Algorithm Implemented

### Input
- `page: PDFPageProxy` — dari react-pdf `<Page>` `onLoadSuccess` callback
- `searchText: string` — substring teks yang dicari (e.g., "Software Engineer")
- `pageIndex: number` — 0-indexed page number
- `section: string` — nama section CV (e.g., "experience")

### Process

```
1. page.getTextContent()
   → returns { items: TextItem[] }
   → setiap TextItem: { str, transform: [a,b,c,d,tx,ty], width, height }

2. Untuk setiap item:
   → filter item dengan 'str' property (TextItem, bukan TextMarkedContent)
   → cek item.str.includes(searchText)
   → jika match ditemukan:

3. Ekstrak koordinat PDF dari transform:
   → tx = transform[4]  (x position, left edge)
   → ty = transform[5]  (y position, BOTTOM-LEFT — PDF coordinate system)

4. Konversi ke viewport space:
   → viewport = page.getViewport({ scale: 1.0 })
   → [viewportX, viewportY] = viewport.convertToViewportPoint(tx, ty)
   → NOTE: viewportY sudah dalam top-down coordinate (viewport melakukan flip)
   → Adjust ke top-left: y = viewportY - item.height

5. Return SuggestionAnchor:
   → { section, searchText, pageIndex, rect: { x, y, w, h } }
```

### Output
```typescript
interface SuggestionAnchor {
  section: string;
  searchText: string;
  charOffset: number;
  length: number;
  pageIndex: number;
  rect: { x: number; y: number; w: number; h: number };
}
```

---

## Validasi dalam Browser

Untuk memvalidasi spike:
1. Buka `/workspace-v2/[valid_job_id]` di browser
2. Buka DevTools Console
3. Setelah PDF berhasil dimuat, lihat log:
   - `[Annotation Spike] ✅ Text rect found: { x: ..., y: ..., w: ..., h: ... }` — SUKSES
   - `[Annotation Spike] ℹ️ Text not found` — Normal jika "Engineer" tidak ada di halaman 1

### Interpretasi Hasil
- Jika rect ditemukan: algoritma valid, Phase 14 bisa proceed dengan confidence
- Jika text tidak ditemukan: bukan kegagalan — setiap CV berbeda. Ganti `searchText` dengan kata yang ada di CV yang ditest

---

## Known Challenges & Edge Cases

### 1. Multi-item text spans
**Problem:** Saran AI sering berupa kalimat panjang yang di-split pdfjs ke beberapa TextItem.
`item.str.includes(searchText)` hanya bekerja jika seluruh searchText ada dalam satu item.

**Phase 14 mitigation:** Concatenate adjacent items dan window-search. Atau gunakan fuzzy match
(Levenshtein distance) untuk menangani OCR artifacts.

**Phase 13 scope:** Spike hanya butuh membuktikan single-item match — tidak perlu solve multi-item.

### 2. Coordinate system
**Problem:** PDF coordinates adalah bottom-up (y=0 di bawah). Canvas/HTML adalah top-down.

**Solution (implemented):** `viewport.convertToViewportPoint(tx, ty)` menangani flip.
Setelah konversi, `viewportY` sudah dalam koordinat top-down.
Adjust ke top-left: `y = viewportY - item.height`.

### 3. Scale dependency
**Problem:** `getViewport({ scale: 1.0 })` digunakan untuk koordinat, tapi PDF page dirender
dengan `width={containerWidth}` yang auto-scale. Rect dari scale=1.0 dan render scale berbeda.

**Phase 14 mitigation:** Compute scale factor:
```typescript
const scale = containerWidth / viewport.width;
// Kemudian multiply semua rect values dengan scale
rect = { x: x * scale, y: y * scale, w: w * scale, h: h * scale };
```

**Phase 13 scope:** Spike menggunakan scale=1.0 untuk simplicity. Scale adjustment di Phase 14.

### 4. Case sensitivity
**Problem:** LLM suggestions mungkin menggunakan casing berbeda dari PDF text
(e.g., "SOFTWARE ENGINEER" vs "Software Engineer").

**Phase 14 mitigation:** `.toLowerCase()` comparison.

---

## Yjs Initialization (CRDT-01)

**Hook:** `frontend/hooks/use-workspace-doc.ts`

**Result:** Yjs Y.Doc + IndexeddbPersistence berhasil diinisialisasi.
Konfirmasi: `[Yjs] IndexedDB synced untuk job: {jobId}` muncul di console setelah halaman dimuat.

**SSR safety:** Hook menggunakan `useEffect` — tidak pernah berjalan di server.
y-indexeddb import aman karena hanya digunakan di dalam `useEffect`.

**Scope Phase 13:** Y.Doc tidak menyimpan data meaningful — hanya proof-of-concept
bahwa persistence bisa diinisialisasi. Data wiring di Phase 14+.

---

## Recommendation untuk Phase 14

1. **Coordinate mapping:** Implementasikan multi-TextItem concatenation + scale factor
2. **Overlay rendering:** Render `<div>` absolute-positioned di atas PDF canvas menggunakan
   `position: absolute`, `left: rect.x * scale`, `top: rect.y * scale`, dll.
3. **Anchor storage:** Simpan hasil `findTextRect` di `suggestion_anchors` JSONB column
   (yang sudah ditambahkan di Phase 13 migration)
4. **Yjs data model:** Gunakan `Y.Map` untuk menyimpan anchor data yang bisa di-sync real-time

---

## Files

| File | Tujuan |
|------|--------|
| `frontend/lib/annotation-utils.ts` | findTextRect implementation + SuggestionAnchor interface |
| `frontend/hooks/use-workspace-doc.ts` | Yjs + IndexeddbPersistence hook |
| `frontend/components/workspace-v2/pdf-viewer-inner.tsx` | Spike console.log di onLoadSuccess |
| `backend/alembic/versions/*_add_pdf_workspace_columns_to_jobs.py` | suggestion_anchors JSONB column |
