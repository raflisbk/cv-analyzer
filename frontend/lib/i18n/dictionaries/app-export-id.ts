import type appExportEn from "./app-export-en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const appExportId = {
  title: "Ekspor",
  heading: "Pilih template ATS",
  close: "Tutup ekspor",
  loading: "Memuat pratinjau ekspor",
  loadError: "Opsi ekspor belum bisa dimuat.",
  retry: "Coba lagi",
  noTemplates: "Belum ada template ekspor.",
  checkingOriginal: "Memeriksa file asli…",
  originalMissing:
    "Layout asli tidak tersedia karena file yang kamu unggah hilang. Pilih template lain untuk ekspor.",
  templates: "Template ATS",
  atsBadge: "ATS {score}",
  yourUpload: "Unggahan kamu",
  originalPreserved:
    "Layout dari file kamu dipertahankan di hasil akhir. Hanya perbaikan yang diterapkan yang berubah.",
  format: "Format",
  pdfMeta: "A4 · teks bisa dipilih",
  docxMeta: "Dokumen bisa diedit",
  bannerOriginal:
    "Hanya perbaikan yang kamu terapkan yang berubah; sisanya tetap seperti yang kamu tulis.",
  bannerTemplate:
    "Template {name}: isi CV kamu disusun ulang ke layout ini. Perbaikan yang diterapkan tetap disorot.",
  previewLabel: "Pratinjau {name} {format}",
  skippedFixes: "Perbaikan yang dilewati",
  fixFallback: "Perbaikan {id}",
  preparing: "Menyiapkan {format}…",
  retryDownload: "Coba unduh lagi",
  download: "Unduh {format}",
  cancel: "Batal",
  ready:
    "{format} kamu sudah siap! {applied} perbaikan diterapkan, {skipped} dilewati.",
  failed: "PDF belum bisa diekspor. Coba lagi, ya.",
  emptyExport: "PDF hasil ekspor kosong.",
  skipped: {
    no_room:
      "Tidak ada ruang di layout asli kamu: baris ini tetap seperti yang kamu tulis.",
    needs_input:
      "Perbaikan ini butuh jawaban kamu dulu sebelum bisa diterapkan.",
    text_not_found: "Baris aslinya tidak ketemu di file ini.",
    missing_text: "Perbaikan ini tidak punya teks pengganti untuk diekspor.",
    other: "Perbaikan ini tidak bisa diterapkan ke file hasil ekspor.",
  },
} as const satisfies Shape<typeof appExportEn>;
export default appExportId;
