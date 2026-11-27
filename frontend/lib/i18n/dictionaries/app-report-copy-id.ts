import type appReportCopyEn from "./app-report-copy-en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

const appReportCopyId = {
  verdict: {
    strong: {
      title: "CV yang kuat",
      body: "Hasil analisis menunjukkan bukti yang kuat di semua dimensi skor.",
    },
    good: {
      title: "Fondasi yang bagus",
      body: "Beberapa perbaikan terarah bisa bikin CV ini makin kuat.",
    },
    room: {
      title: "Masih bisa lebih baik",
      body: "Mulai dari dimensi dengan skor paling rendah.",
    },
    needs: {
      title: "Perlu dibenahi",
      body: "Tambahkan bukti yang konkret dan lengkapi bagian yang masih kosong.",
    },
  },
  facts: {
    page: "1 halaman",
    pages: "{count} halaman",
    bullets: "{count} poin",
    words: "{count} kata",
    projectedNote:
      "Perkiraan kenaikan skor dihitung dari saran yang masih terbuka.",
    keywordNote:
      "Jumlah lowongan untuk kata kunci yang hilang belum diketahui kalau tertulis 0.",
    size: "{count} KB",
  },
  fixTitle: "{section}: {action}",
  fixTitles: {
    summary_action_verb: "Ringkasan: buat lebih spesifik",
    summary_impact_metric: "Ringkasan: tunjukkan hasilnya",
    experience_action_verb: "Pengalaman: pakai kata kerja aksi",
    experience_impact_metric: "Pengalaman: tunjukkan dampaknya dengan angka",
    skills_missing_section: "Keahlian: kelompokkan per bidang",
    education_missing_section: "Pendidikan: tambahkan kredensial",
  },
  fixActions: {
    action_verb: "pakai kata kerja aksi",
    impact_metric: "tunjukkan dampaknya dengan angka",
    missing_section: "lengkapi detail yang kurang",
    other: "perbaiki bagian ini",
  },
  sectionNames: {
    header: "Header",
    summary: "Ringkasan",
    experience: "Pengalaman",
    education: "Pendidikan",
    skills: "Keahlian",
    projects: "Proyek",
    certifications: "Sertifikasi",
    other: "Lainnya",
  },
  sectionNotes: {
    strong: "Bukti di bagian ini sudah kuat.",
    more: "Tambahkan satu detail konkret lagi di bagian ini.",
    missing: "Lengkapi detail yang kurang di bagian ini.",
    empty: "Bagian ini masih kosong.",
  },
  tags: {
    actionVerb: "Kata kerja aksi",
    number: "Ada angka",
    scannableLength: "Panjang pas dibaca sekilas",
  },
  metrics: {
    bulletsWithNumber: "Poin yang ada angkanya",
    strongActionVerbs: "Kata kerja aksi yang kuat",
    activeVoice: "Kalimat aktif",
    keywordsFound: "Kata kunci yang ketemu",
    sectionsPresent: "Bagian yang ada",
    value: "{count} dari {total}",
  },
  hints: {
    impact: "Tambahkan hasil yang bisa diverifikasi di poin pengalaman.",
    clarity: "Pakai kalimat yang langsung dan ringkas.",
    relevance: "Tunjukkan keahlian yang relevan lewat konteksnya.",
    completeness: "Lengkapi bagian CV yang masih kurang.",
  },
  evidence: {
    suggested: "Perubahan yang disarankan",
    strongBullet: "Poin yang kuat",
  },
} satisfies Shape<typeof appReportCopyEn>;

export default appReportCopyId;
