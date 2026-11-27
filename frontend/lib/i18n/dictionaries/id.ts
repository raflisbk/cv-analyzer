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
    analyzer: "Analisis CV",
    builder: "Buat CV",
    connect: "Cari kerja",
    comingSoon: "Segera hadir",
  },
  dock: {
    label: "Pengaturan cepat",
    open: "Buka pengaturan cepat",
    close: "Tutup pengaturan cepat",
    theme: "Mode gelap",
    themeLight: "Ganti ke mode gelap",
    themeDark: "Ganti ke mode terang",
    language: "Bahasa",
  },
  auth: {
    title: "Masuk dulu, yuk",
    body: "Biar lu bisa analisis CV dan cek lagi hasilnya kapan aja.",
    button: "Masuk pakai Google",
    loading: "Lagi masuk...",
    failed: "Gagal masuk",
    failedDescription: "Lu belum bisa masuk lewat Google. Coba lagi, ya.",
    close: "Tutup",
    footnote: "CV lu tetap milik lu.",
    tagline: "Karier lu nungguin",
  },
  account: {
    menu: "Menu akun",
    workspace: "Workspace",
    cvs: "CV gua",
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
    sessionDescription: "Perangkat yang masuk ke akun lu.",
    sessionsError: "Sesi lu belum bisa dimuat.",
    signOutError: "Sesi ini belum bisa dikeluarkan.",
    signOut: "Keluar",
    mobileLogin: "Masuk buat mulai",
  },
  app: appId,
  landing: landingId,
  pathy: pathyId,
  appExport: appExportId,
  appReport: appReportId,
  appWorkspace: appWorkspaceId,
  appWorkspacePanel: appWorkspacePanelId,
  common: { language: "Bahasa" },
} as const satisfies Shape<typeof en>;
export default id;
