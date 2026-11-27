const errorsId = {
  api: {
    fileTooLarge: "File itu lebih dari 5 MB. Kecilkan atau pecah CV kamu.",
    invalidFileType: "Hanya file PDF dan DOCX yang didukung.",
    invalidFile: "File itu belum bisa dibaca. Mungkin rusak.",
    uploadFailed: "Unggahannya belum berhasil.",
    unauthorized: "Sesi kamu sudah habis. Masuk lagi, ya.",
    network: "Jaringan belum tersambung. Cek koneksi kamu.",
    parse: "Respons dari server belum bisa dibaca.",
    emptyExport: "PDF hasil ekspornya kosong.",
    chatFailed: "Pesan kamu belum terkirim.",
    generic: "Ada yang belum beres. Coba lagi ya.",
  },
  boundary: {
    title: "Ada yang belum beres",
    body: "Halaman ini belum bisa dimuat.",
    globalBody: "Terjadi kesalahan yang tidak terduga. Maaf ya.",
    retry: "Coba lagi",
    home: "Ke beranda",
    notFound: "Halaman yang kamu cari tidak ada.",
    appBody: "Halaman ini belum bisa dibuka.",
  },
  stream: {
    complete: "Analisis selesai!",
    failed: "Analisisnya belum berhasil.",
  },
  draft: {
    saveFailed:
      "Perubahan belum tersimpan, tapi editanmu aman. Mencoba lagi...",
  },
  jobMatch: {
    tooShort: "Tempel deskripsi pekerjaan minimal 50 karakter.",
    failed: "Pencocokan pekerjaan belum bisa jalan. Coba lagi ya.",
  },
  chat: {
    sendFailed: "Pesan kamu belum terkirim. Coba lagi ya.",
  },
} as const;
export default errorsId;
