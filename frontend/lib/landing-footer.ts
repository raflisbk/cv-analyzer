export const footerColumns = [
  {
    key: "products",
    links: [
      { key: "analyzer", href: "/app" },
      { key: "builder", href: null },
      { key: "connect", href: null },
    ],
  },
  {
    key: "resources",
    links: [
      { key: "report", href: "#report" },
      { key: "faq", href: "#faq" },
      { key: "how", href: "#how" },
    ],
  },
  { key: "legal", links: [{ key: "privacy", href: null }] },
] as const;
