export type Insight = {
  key: string;
  eyebrow: string;
  title: string;
  chip: string;
  target: string;
  object: string;
  mode?: "ats" | "match" | "edit" | "gap";
  body:
    | { kind: "intro"; text: string; labels: string[] }
    | { kind: "checks"; items: string[] }
    | {
        kind: "match";
        percent: number;
        text: string;
        keywords: string[];
        missing: string[];
      }
    | { kind: "bars"; rows: { label: string; value: string; width: number }[] }
    | { kind: "edit"; before: string; after: string; actions: string[] };
};

export const laptopInsights: Insight[] = [
  {
    key: "intro",
    eyebrow: "landing.laptop.k0",
    title: "landing.laptop.k1",
    chip: "",
    target: "",
    object: "",
    body: {
      kind: "intro",
      text: "landing.laptop.k2",
      labels: [
        "landing.laptop.k3",
        "landing.laptop.k4",
        "landing.laptop.k5",
        "landing.laptop.k6",
        "landing.laptop.k7",
      ],
    },
  },
  {
    key: "contact",
    eyebrow: "landing.laptop.k3",
    title: "landing.laptop.k8",
    chip: "landing.laptop.k9",
    target: "[data-sc-section='contact']",
    object: "shield",
    mode: "ats",
    body: {
      kind: "checks",
      items: [
        "landing.laptop.k10",
        "landing.laptop.k11",
        "landing.laptop.k12",
        "landing.laptop.k13",
      ],
    },
  },
  {
    key: "summary",
    eyebrow: "landing.laptop.k4",
    title: "landing.laptop.k14",
    chip: "landing.laptop.k15",
    target: "[data-sc-section='summary']",
    object: "target",
    mode: "match",
    body: {
      kind: "match",
      percent: 78,
      text: "landing.laptop.k16",
      keywords: [
        "landing.laptop.k17",
        "landing.laptop.k18",
        "landing.laptop.k19",
      ],
      missing: ["landing.laptop.k20", "landing.laptop.k21"],
    },
  },
  {
    key: "payly",
    eyebrow: "landing.laptop.k22",
    title: "landing.laptop.k23",
    chip: "landing.laptop.k24",
    target: "[data-sc-section='payly']",
    object: "chart",
    body: {
      kind: "bars",
      rows: [
        {
          label: "landing.laptop.k25",
          value: "landing.laptop.k26",
          width: 100,
        },
        { label: "landing.laptop.k27", value: "landing.laptop.k28", width: 33 },
        {
          label: "landing.laptop.k29",
          value: "landing.laptop.k30",
          width: 100,
        },
      ],
    },
  },
  {
    key: "edit",
    eyebrow: "landing.laptop.k31",
    title: "landing.laptop.k32",
    chip: "landing.laptop.k33",
    target: "[data-sc-section='edit']",
    object: "pencil",
    mode: "edit",
    body: {
      kind: "edit",
      before: "landing.laptop.k34",
      after: "landing.laptop.k35",
      actions: [
        "landing.laptop.k36",
        "landing.laptop.k37",
        "landing.laptop.k38",
      ],
    },
  },
  {
    key: "brightly",
    eyebrow: "landing.laptop.k39",
    title: "landing.laptop.k40",
    chip: "landing.laptop.k41",
    target: "[data-sc-section='brightly']",
    object: "podium",
    body: {
      kind: "bars",
      rows: [
        {
          label: "landing.laptop.k25",
          value: "landing.laptop.k42",
          width: 100,
        },
        { label: "landing.laptop.k27", value: "landing.laptop.k43", width: 50 },
        {
          label: "landing.laptop.k44",
          value: "landing.laptop.k45",
          width: 100,
        },
      ],
    },
  },
  {
    key: "projects",
    eyebrow: "landing.laptop.k46",
    title: "landing.laptop.k47",
    chip: "landing.laptop.k48",
    target: "[data-sc-section='projects']",
    object: "rocket",
    body: {
      kind: "checks",
      items: ["landing.laptop.k49", "landing.laptop.k50", "landing.laptop.k51"],
    },
  },
  {
    key: "education",
    eyebrow: "landing.laptop.k52",
    title: "landing.laptop.k53",
    chip: "landing.laptop.k54",
    target: "[data-sc-section='education']",
    object: "star",
    body: {
      kind: "checks",
      items: ["landing.laptop.k55", "landing.laptop.k56", "landing.laptop.k57"],
    },
  },
  {
    key: "skills",
    eyebrow: "landing.laptop.k6",
    title: "landing.laptop.k58",
    chip: "landing.laptop.k59",
    target: "[data-sc-section='skills']",
    object: "magnifier",
    mode: "gap",
    body: {
      kind: "bars",
      rows: [
        { label: "landing.laptop.k20", value: "landing.laptop.k60", width: 86 },
        { label: "landing.laptop.k76", value: "landing.laptop.k61", width: 64 },
        { label: "landing.laptop.k62", value: "landing.laptop.k63", width: 34 },
      ],
    },
  },
  {
    key: "certs",
    eyebrow: "landing.laptop.k64",
    title: "landing.laptop.k65",
    chip: "landing.laptop.k66",
    target: "[data-sc-section='certs']",
    object: "trophy",
    body: {
      kind: "checks",
      items: ["landing.laptop.k67", "landing.laptop.k68", "landing.laptop.k69"],
    },
  },
  {
    key: "lang",
    eyebrow: "landing.laptop.k70",
    title: "landing.laptop.k71",
    chip: "landing.laptop.k72",
    target: "[data-sc-section='lang']",
    object: "speech-bubbles",
    body: {
      kind: "checks",
      items: ["landing.laptop.k73", "landing.laptop.k74", "landing.laptop.k75"],
    },
  },
];
