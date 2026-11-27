import type pathyEn from "./pathy-en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const pathyId = {
  help: {
    home: {
      title: "Tanya apa saja",
      text: "Tanya soal CV atau kariermu. Unggah CV dulu, jadi jawabanku pakai angka kamu sendiri.",
    },
    cvs: {
      title: "CV kamu",
      text: "Semua file yang kamu unggah. Laporan membuka skornya, Edit membuka editornya.",
    },
    reports: {
      title: "Laporan",
      text: "Satu laporan per versi CV. Bandingkan skornya dan lihat apa yang berubah.",
    },
    views: {
      title: "Tiga tampilan",
      text: "Editor untuk mengubah teks, PDF menampilkan file asli, Laporan lengkap menampilkan semua skor.",
    },
    editor: {
      title: "Edit langsung",
      text: "Pilih teks lalu minta AI menulis ulang. Garis kuning itu saran yang bisa kamu terima.",
    },
    paneReport: {
      title: "Tab Laporan",
      text: "Ringkasan skor kamu. Buka Laporan lengkap untuk melihat grafik dan buktinya.",
    },
    paneFixes: {
      title: "Saran perbaikan",
      text: "Tiap saran menunjukkan bagian mana yang kena. Terapkan akan menuliskannya ke CV kamu.",
    },
    ats: {
      title: "Cek ATS",
      text: "Lihat apa yang bisa dan tidak bisa dibaca software penyaring otomatis.",
    },
    match: {
      title: "Cocokkan lowongan",
      text: "Tempel lowongan untuk membandingkan skill, pengalaman, dan kata kunci dengan CV kamu.",
    },
    chat: {
      title: "Chat CV",
      text: "Tanya soal CV ini. Jawabannya bisa menunjuk ke bagian dokumennya.",
    },
    grammarTab: {
      title: "Tab Tata bahasa",
      text: "Terima atau abaikan tiap catatan. Kalau diterima, perbaikannya ditulis ke CV kamu.",
    },
    historyTab: {
      title: "Riwayat versi",
      text: "Bandingkan perubahan atau kembalikan ke versi lama.",
    },
    verdict: {
      title: "Hasil akhirnya",
      text: "Ringkasan yang mudah dicerna dan langkah terbaik berikutnya.",
    },
    overall: {
      title: "Skor total",
      text: "Dampak 35%, Kejelasan 30%, Relevansi 20%, Kelengkapan 15%.",
    },
    radar: {
      title: "Bentuk CV kamu",
      text: "Bandingkan empat skor kamu dengan versi sebelumnya atau rata-rata posisi.",
    },
    fixesCard: {
      title: "Kalau perbaikan diterapkan",
      text: "Lihat skor hari ini dan peningkatan yang mungkin dari perbaikan yang masih terbuka.",
    },
    dims: {
      title: "Empat skor",
      text: "Buka Bukti untuk melihat baris-baris di balik tiap skor.",
    },
    sections: {
      title: "Per bagian",
      text: "Klik satu baris untuk lompat ke bagian itu di editor.",
    },
    bullets: {
      title: "Semua poin",
      text: "Poin yang kuat punya kata kerja, angka, dan hasil.",
    },
    grammar: {
      title: "Tata bahasa dan gaya",
      text: "Ejaan dan tata bahasa layak diperbaiki. Catatan gaya sifatnya opsional.",
    },
    keywords: {
      title: "Kata kunci",
      text: "Kata yang sering diminta lowongan asli. Tambahkan hanya skill yang benar-benar kamu punya.",
    },
    atsCard: {
      title: "Kesiapan ATS",
      text: "Lihat seberapa baik sistem otomatis bisa membaca file kamu.",
    },
    history: {
      title: "Riwayat skor",
      text: "Tiap analisis menambah satu titik. Garis putus-putus menunjukkan potensi dari perbaikan yang masih terbuka.",
    },
    exportHelp: {
      title: "Ekspor",
      text: "Pertahankan layout asli atau pilih template ATS.",
    },
    exAts: {
      title: "Skor ATS sebuah template",
      text: "Peringatannya menjelaskan apa yang bisa salah saat sistem otomatis membaca layout ini.",
    },
  },
  tour: {
    full: {
      s0: {
        title: "Hai, aku Pathy",
        text: "Tanya soal CV atau kariermu di sini. Unggah CV supaya jawabannya personal.",
      },
      s1: {
        title: "Tiga tempat untuk dituju",
        text: "Chat untuk bertanya. CV kamu menampilkan file kamu. Laporan menampilkan semua skor.",
      },
      s2: {
        title: "Akun kamu",
        text: "Buka untuk ke CV kamu, Pengaturan, dan Keluar.",
      },
      s3: {
        title: "Semua CV ada di sini",
        text: "Laporan membuka skornya. Edit membuka editornya.",
      },
      s4: {
        title: "Satu laporan per versi",
        text: "Empat skor, perbaikan teratas, dan perkembanganmu.",
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
        title: "Arti skor kamu",
        text: "Dampak 35%, Kejelasan 30%, Relevansi 20%, Kelengkapan 15%.",
      },
    },
  },
  ui: {
    helpLabel: "Bantuan: {title}",
    gotIt: "Paham",
    showTour: "Tampilkan turnya",
    helperLabel: "Bantuan Pathy",
    greeting: "Hai, aku Pathy",
    tourFull: "Ikut tur 60 detik",
    tourExport: "Bagaimana cara ekspor?",
    tourScore: "Skor aku artinya apa?",
    askQuestion: "Tanya aku sesuatu",
    tourLabel: "Tur Pathy",
    step: "Langkah {index} dari {total}",
    missing: "Bagian ini belum siap. Lanjut ke langkah berikutnya.",
    back: "Kembali",
    next: "Lanjut",
    done: "Selesai",
    skip: "Lewati",
    progress: "Progres tur",
    intro: "Butuh bantuan?",
    quipIdea: "Coba fitur Cocokkan lowongan.",
    quipProud: "Aku baca CV buat sarapan.",
    quipDetective: "Kata kerja lemah kelihatan dari jauh.",
  },
} as const satisfies Shape<typeof pathyEn>;
export default pathyId;
