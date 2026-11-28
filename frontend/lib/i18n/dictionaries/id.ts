import errorsId from "./errors-id";
import uploadId from "./upload-id";
import appId from "./app-id";
import appExportId from "./app-export-id";
import appReportId from "./app-report-id";
import appWorkspaceId from "./app-workspace-id";
import appWorkspacePanelId from "./app-workspace-panel-id";
import pathyId from "./pathy-id";
import landingId from "./landing-id";
import type en from "./en";

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };
const id = {
  nav: {
    main: "Navigasi utama",
    home: "Beranda pathkr",
    products: "Produk",
    how: "Cara kerja",
    features: "Fitur",
    login: "Masuk",
    menu: "Menu navigasi",
    mobile: "Navigasi mobile",
    openMenu: "Buka menu navigasi",
    closeMenu: "Tutup menu",
    language: "Bahasa",
    switchLanguage: "Ganti ke English",
    analyzer: "Analisis CV",
    builder: "Buat CV",
    connect: "Cari kerja",
    comingSoon: "Segera hadir",
  },
  toggles: {
    theme: "Ganti tema",
    language: "Ganti bahasa",
  },
  auth: {
    title: "Masuk dulu, yuk",
    body: "Supaya kamu bisa menganalisis CV dan membuka hasilnya kapan saja.",
    button: "Masuk pakai Google",
    loading: "Sedang masuk...",
    failed: "Gagal masuk",
    failedDescription: "Belum bisa masuk lewat Google. Coba lagi, ya.",
    close: "Tutup",
    footnote: "CV kamu tetap milik kamu.",
    tagline: "Kariermu menunggu",
  },
  account: {
    menu: "Menu akun",
    workspace: "Workspace",
    cvs: "CV kamu",
    sessions: "Sesi aktif",
    logout: "Keluar",
    logoutAll: "Keluar dari semua perangkat",
    confirmAll: "Keluar dari semua perangkat?",
    confirmAllLabel: "Konfirmasi keluar dari semua perangkat",
    confirm: "Ya",
    cancel: "Batal",
    settings: "Pengaturan",
    soon: "Segera",
    lastUsed: "Terakhir aktif {date}",
    current: "Sesi ini",
    sessionDescription: "Perangkat yang masuk ke akun kamu.",
    sessionsError: "Sesi kamu belum bisa dimuat.",
    signOutError: "Sesi ini belum bisa dikeluarkan.",
    signOut: "Keluar",
    mobileLogin: "Masuk untuk mulai",
  },
  app: appId,
  landing: landingId,
  pathy: pathyId,
  appExport: appExportId,
  appReport: appReportId,
  appWorkspace: appWorkspaceId,
  appWorkspacePanel: appWorkspacePanelId,
  errors: errorsId,
  upload: uploadId,
  common: { language: "Bahasa" },
} as const satisfies Shape<typeof en>;
export default id;
