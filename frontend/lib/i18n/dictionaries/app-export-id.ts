import type appExportEn from "./app-export-en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const appExportId = {
  title: "Ekspor",
  heading: "Pilih template ATS",
  close: "Tutup ekspor",
  loading: "Lagi muat pratinjau ekspor",
  loadError: "Opsi ekspor belum bisa dimuat.",
  retry: "Coba lagi",
  noTemplates: "Belum ada template ekspor.",
  checkingOriginal: "Lagi ngecek file asli…",
  originalMissing:
    "Layout asli nggak tersedia karena file yang lu upload hilang. Pilih template lain buat ekspor.",
  templates: "Template ATS",
  atsBadge: "ATS {score}",
  yourUpload: "Upload lu",
  originalPreserved:
    "Layout dari file lu dipertahanin di hasil akhir. Cuma perbaikan yang diterapkan yang berubah.",
  format: "Format",
  pdfMeta: "A4 · teks bisa dipilih",
  docxMeta: "Dokumen bisa diedit",
  bannerOriginal:
    "Cuma perbaikan yang lu terapkan yang berubah; sisanya tetap kayak yang lu tulis.",
  bannerTemplate:
    "Template {name}: isi CV lu disusun ulang ke layout ini. Perbaikan yang diterapkan tetap disorot.",
  previewLabel: "Pratinjau {name} {format}",
  skippedFixes: "Perbaikan yang dilewati",
  fixFallback: "Perbaikan {id}",
  preparing: "Lagi nyiapin {format}…",
  retryDownload: "Coba unduh lagi",
  download: "Unduh {format}",
  cancel: "Batal",
  ready:
    "{format} lu udah siap! {applied} perbaikan diterapkan, {skipped} dilewati.",
  failed: "PDF belum bisa diekspor. Coba lagi, ya.",
  emptyExport: "PDF hasil ekspor kosong.",
  skipped: {
    no_room:
      "Nggak ada ruang di layout asli lu: baris ini tetap kayak yang lu tulis.",
    needs_input: "Perbaikan ini butuh jawaban lu dulu sebelum bisa diterapkan.",
    text_not_found: "Baris aslinya nggak ketemu di file ini.",
    missing_text: "Perbaikan ini nggak punya teks pengganti buat diekspor.",
    other: "Perbaikan ini nggak bisa diterapkan ke file hasil ekspor.",
  },
} as const satisfies Shape<typeof appExportEn>;
export default appExportId;
