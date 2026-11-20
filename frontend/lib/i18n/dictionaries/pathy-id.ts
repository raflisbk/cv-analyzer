import type pathyEn from "./pathy-en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const pathyId = {
  help: {
    home: {
      title: "Tanya apa aja",
      text: "Tanya soal CV atau karier lu. Upload CV dulu, jadi jawaban gua pakai angka lu sendiri.",
    },
    cvs: {
      title: "CV gua",
      text: "Semua file yang lu upload. Laporan buka skornya, Edit buka editornya.",
    },
    reports: {
      title: "Laporan",
      text: "Satu laporan per versi CV. Bandingin skornya dan lihat apa yang berubah.",
    },
    views: {
      title: "Tiga tampilan",
      text: "Editor buat ngubah teks, PDF nampilin file asli, Laporan lengkap nampilin semua skor.",
    },
    editor: {
      title: "Edit langsung",
      text: "Pilih teks lalu minta AI nulis ulang. Garis kuning itu saran yang bisa lu terima.",
    },
    paneReport: {
      title: "Tab Laporan",
      text: "Ringkasan skor lu. Buka Laporan lengkap buat lihat grafik dan buktinya.",
    },
    paneFixes: {
      title: "Saran perbaikan",
      text: "Tiap saran nunjukin bagian mana yang kena. Terapkan bakal nulisnya ke CV lu.",
    },
    ats: {
      title: "Cek ATS",
      text: "Lihat apa yang bisa dan nggak bisa dibaca software penyaring otomatis.",
    },
    match: {
      title: "Cocokin lowongan",
      text: "Tempel lowongan buat bandingin skill, pengalaman, dan kata kunci sama CV lu.",
    },
    chat: {
      title: "Chat CV",
      text: "Tanya soal CV ini. Jawabannya bisa nunjuk ke bagian dokumennya.",
    },
    grammarTab: {
      title: "Tab Tata bahasa",
      text: "Terima atau abaikan tiap catatan. Kalau diterima, perbaikannya ditulis ke CV lu.",
    },
    historyTab: {
      title: "Riwayat versi",
      text: "Bandingin perubahan atau balikin ke versi lama.",
    },
    verdict: {
      title: "Hasil akhirnya",
      text: "Ringkasan yang gampang dicerna dan langkah terbaik berikutnya.",
    },
    overall: {
      title: "Skor total",
      text: "Dampak 35%, Kejelasan 30%, Relevansi 20%, Kelengkapan 15%.",
    },
    radar: {
      title: "Bentuk CV lu",
      text: "Bandingin empat skor lu dengan versi sebelumnya atau rata-rata posisi.",
    },
    fixesCard: {
      title: "Kalau perbaikan diterapkan",
      text: "Lihat skor hari ini dan peningkatan yang mungkin dari perbaikan yang masih terbuka.",
    },
    dims: {
      title: "Empat skor",
      text: "Buka Bukti buat lihat baris-baris di balik tiap skor.",
    },
    sections: {
      title: "Per bagian",
      text: "Klik satu baris buat loncat ke bagian itu di editor.",
    },
    bullets: {
      title: "Semua poin",
      text: "Poin yang kuat punya kata kerja, angka, dan hasil.",
    },
    grammar: {
      title: "Tata bahasa dan gaya",
      text: "Ejaan dan tata bahasa layak dibenerin. Catatan gaya sifatnya opsional.",
    },
    keywords: {
      title: "Kata kunci",
      text: "Kata yang sering diminta lowongan asli. Tambahin cuma skill yang lu punya beneran.",
    },
    atsCard: {
      title: "Kesiapan ATS",
      text: "Lihat seberapa bagus sistem otomatis bisa baca file lu.",
    },
    history: {
      title: "Riwayat skor",
      text: "Tiap analisis nambah satu titik. Garis putus-putus nunjukin potensi dari perbaikan yang masih terbuka.",
    },
    exportHelp: {
      title: "Ekspor",
      text: "Pertahanin layout asli atau pilih template ATS.",
    },
    exAts: {
      title: "Skor ATS sebuah template",
      text: "Peringatannya jelasin apa yang bisa salah waktu sistem otomatis baca layout ini.",
    },
  },
  tour: {
    full: {
      s0: {
        title: "Hai, gua Pathy",
        text: "Tanya soal CV atau karier lu di sini. Upload CV biar jawabannya personal.",
      },
      s1: {
        title: "Tiga tempat buat dituju",
        text: "Chat buat nanya. CV gua nampilin file lu. Laporan nampilin semua skor.",
      },
      s2: {
        title: "Akun lu",
        text: "Buka buat ke CV gua, Pengaturan, dan Keluar.",
      },
      s3: {
        title: "Semua CV ada di sini",
        text: "Laporan buka skornya. Edit buka editornya.",
      },
      s4: {
        title: "Satu laporan per versi",
        text: "Empat skor, perbaikan teratas, dan perkembangan lu.",
      },
      s5: {
        title: "Laporan lengkap",
        text: "Pindah antar bagian dan buka bukti di skor mana pun.",
      },
      s6: {
        title: "Edit langsung di teksnya",
        text: "Pilih teks lalu tanya AI. Sorotan kuning itu saran.",
      },
      s7: {
        title: "Ekspor pakai template ATS",
        text: "Pilih template dan cek pratinjau sebelum ekspor.",
      },
    },
    export: {
      s0: {
        title: "Ekspor ada di sini",
        text: "Pilih template ATS dan cek pratinjaunya.",
      },
    },
    score: {
      s0: {
        title: "Arti skor lu",
        text: "Dampak 35%, Kejelasan 30%, Relevansi 20%, Kelengkapan 15%.",
      },
    },
  },
  ui: {
    helpLabel: "Bantuan: {title}",
    gotIt: "Paham",
    showTour: "Tunjukin tur-nya",
    helperLabel: "Bantuan Pathy",
    greeting: "Hai, gua Pathy",
    tourFull: "Ikut tur 60 detik",
    tourExport: "Gimana cara ekspor?",
    tourScore: "Skor gua artinya apa?",
    askQuestion: "Tanya gua sesuatu",
    tourLabel: "Tur Pathy",
    step: "Langkah {index} dari {total}",
    missing: "Bagian ini belum siap. Lanjut ke langkah berikutnya.",
    back: "Kembali",
    next: "Lanjut",
    done: "Selesai",
    skip: "Lewati",
    progress: "Progres tur",
    intro: "Butuh bantuan?",
    quipIdea: "Coba fitur Cocokin lowongan.",
    quipProud: "Gua baca CV buat sarapan.",
    quipDetective: "Kata kerja lemah kelihatan dari jauh.",
  },
} as const satisfies Shape<typeof pathyEn>;
export default pathyId;
