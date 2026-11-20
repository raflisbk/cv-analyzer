import appEn from "./app-en";
import appExportEn from "./app-export-en";
import appReportEn from "./app-report-en";
import appWorkspaceEn from "./app-workspace-en";
import appWorkspacePanelEn from "./app-workspace-panel-en";
import pathyEn from "./pathy-en";
import landingEn from "./landing-en";
const en = {
  nav: {
    main: "Main navigation",
    home: "pathkr home",
    products: "Products",
    how: "How it works",
    features: "Features",
    login: "Log in",
    menu: "Navigation menu",
    mobile: "Mobile navigation",
    openMenu: "Open navigation menu",
    closeMenu: "Close menu",
    language: "Language",
    analyzer: "CV Analyzer",
    builder: "CV Builder",
    connect: "Job Connect",
    comingSoon: "Coming soon",
  },
  auth: {
    title: "Sign in to continue",
    body: "You need an account to analyze your CV and come back to your results anytime.",
    button: "Sign in with Google",
    loading: "Signing in...",
    failed: "Sign in failed",
    failedDescription: "Could not sign in with Google. Please try again.",
    close: "Close",
    footnote: "Your CV stays yours.",
    tagline: "Your career path is waiting",
  },
  account: {
    menu: "Account menu",
    workspace: "Workspace",
    cvs: "My CVs",
    sessions: "Active sessions",
    logout: "Log out",
    logoutAll: "Log out of all devices",
    confirmAll: "Sign out everywhere?",
    confirmAllLabel: "Confirm log out of all devices",
    confirm: "Yes",
    cancel: "Cancel",
    settings: "Settings",
    soon: "Soon",
    lastUsed: "Last used {date}",
    current: "Current session",
    sessionDescription: "Devices signed in to your account.",
    sessionsError: "Could not load sessions.",
    signOutError: "Could not sign out this session.",
    signOut: "Sign out",
    mobileLogin: "Log in to start",
  },
  app: appEn,
  landing: landingEn,
  pathy: pathyEn,
  appExport: appExportEn,
  appReport: appReportEn,
  appWorkspace: appWorkspaceEn,
  appWorkspacePanel: appWorkspacePanelEn,
  common: { language: "Language" },
} as const;
export default en;
