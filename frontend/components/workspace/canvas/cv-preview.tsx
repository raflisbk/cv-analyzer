"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";

const PREVIEW_EXTENSIONS = [StarterKit];

interface PreviewSection {
  type: string;
  json: JSONContent;
}

interface CVPreviewProps {
  sections: PreviewSection[];
  fileName: string;
}

type SectionRole =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects"
  | "generic";

function getSectionRole(type: string): SectionRole {
  const t = type.toLowerCase();
  if (t.includes("header") || t.includes("contact") || t.includes("personal")) {
    return "header";
  }
  if (t.includes("summary") || t.includes("objective") || t.includes("profile") || t.includes("about")) {
    return "summary";
  }
  if (t.includes("experience") || t.includes("work") || t.includes("employment") || t.includes("career")) {
    return "experience";
  }
  if (t.includes("education") || t.includes("academic") || t.includes("study") || t.includes("degree")) {
    return "education";
  }
  if (t.includes("skill") || t.includes("technical") || t.includes("technology") || t.includes("competenc")) {
    return "skills";
  }
  if (t.includes("language") || t.includes("lingua")) {
    return "languages";
  }
  if (t.includes("certif") || t.includes("award") || t.includes("achievement") || t.includes("license")) {
    return "certifications";
  }
  if (t.includes("project") || t.includes("portfolio")) {
    return "projects";
  }
  return "generic";
}

function formatSectionLabel(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanPreviewHTML(html: string): string {
  return html
    .replace(/<p><\/p>/g, "")
    .replace(/<p><br\/?><\/p>/g, "")
    .trim();
}

function SectionDivider({ label, role }: { label: string; role: SectionRole }) {
  if (role === "header") {
    return null;
  }

  return (
    <div className="mb-2 mt-5 flex items-center gap-2">
      <span
        className="shrink-0 text-[9px] font-black uppercase tracking-[0.22em]"
        style={{ color: "#2d2d2d" }}
      >
        {label}
      </span>
      <div className="h-[1.5px] flex-1" style={{ backgroundColor: "#1a1a1a" }} />
    </div>
  );
}

function SectionContent({ html, role }: { html: string; role: SectionRole }) {
  const baseClass = "cv-preview-section";

  const roleClass: Record<SectionRole, string> = {
    header: "cv-section-header",
    summary: "cv-section-summary",
    experience: "cv-section-experience",
    education: "cv-section-education",
    skills: "cv-section-skills",
    languages: "cv-section-languages",
    certifications: "cv-section-certifications",
    projects: "cv-section-projects",
    generic: "cv-section-generic",
  };

  return (
    <div
      className={`${baseClass} ${roleClass[role]}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function SectionPreview({ type, json }: PreviewSection) {
  const role = getSectionRole(type);
  const label = formatSectionLabel(type);

  const html = useMemo(() => {
    try {
      const raw = generateHTML(json, PREVIEW_EXTENSIONS);
      return cleanPreviewHTML(raw);
    } catch {
      return "";
    }
  }, [json]);

  if (!html) {
    return null;
  }

  return (
    <>
      <SectionDivider label={label} role={role} />
      <SectionContent html={html} role={role} />
    </>
  );
}

export function CVPreview({ sections, fileName }: CVPreviewProps) {
  const displayName = fileName.replace(/\.[^.]+$/, "") || "Your CV";

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center">
        <p className="text-sm text-gray-400">
          Start editing sections to see the preview.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Container ── */
        .cv-document {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 10.5pt;
          color: #1a1a1a;
          line-height: 1.45;
          background: #fff;
        }

        /* ── Candidate name (h1 inside header section) ── */
        .cv-document .cv-section-header h1,
        .cv-document .cv-section-header h2 {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 20pt;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #0a0a0a;
          margin: 0 0 2px 0;
          line-height: 1.1;
        }
        .cv-document .cv-section-header h3 {
          font-size: 10pt;
          font-weight: 400;
          color: #555;
          margin: 2px 0;
        }
        .cv-document .cv-section-header p {
          font-size: 9pt;
          color: #555;
          margin: 1px 0;
          line-height: 1.4;
        }

        /* ── Summary / Objective ── */
        .cv-document .cv-section-summary p {
          font-size: 10pt;
          color: #333;
          line-height: 1.55;
          margin: 0 0 4px 0;
          font-style: italic;
        }

        /* ── Experience / Projects ── */
        .cv-document .cv-section-experience p,
        .cv-document .cv-section-projects p {
          font-size: 10pt;
          color: #222;
          margin: 0 0 2px 0;
          line-height: 1.45;
        }
        .cv-document .cv-section-experience strong,
        .cv-document .cv-section-projects strong {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 10.5pt;
          font-weight: 700;
          color: #0a0a0a;
        }
        .cv-document .cv-section-experience em,
        .cv-document .cv-section-projects em {
          font-style: normal;
          color: #555;
          font-size: 9.5pt;
        }
        .cv-document .cv-section-experience ul,
        .cv-document .cv-section-projects ul {
          margin: 3px 0 4px 14px;
          padding: 0;
          list-style-type: disc;
        }
        .cv-document .cv-section-experience li,
        .cv-document .cv-section-projects li {
          font-size: 10pt;
          color: #333;
          margin: 1px 0;
          line-height: 1.42;
        }

        /* ── Education ── */
        .cv-document .cv-section-education p {
          font-size: 10pt;
          color: #222;
          margin: 0 0 2px 0;
        }
        .cv-document .cv-section-education strong {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-weight: 700;
          color: #0a0a0a;
        }
        .cv-document .cv-section-education em {
          font-style: normal;
          color: #555;
          font-size: 9.5pt;
        }
        .cv-document .cv-section-education ul {
          margin: 2px 0 3px 14px;
          list-style-type: none;
          padding: 0;
        }
        .cv-document .cv-section-education li {
          font-size: 10pt;
          color: #333;
          margin: 1px 0;
        }

        /* ── Skills / Languages / Certifications ── */
        .cv-document .cv-section-skills p,
        .cv-document .cv-section-languages p,
        .cv-document .cv-section-certifications p {
          font-size: 10pt;
          color: #222;
          margin: 0 0 2px 0;
          line-height: 1.45;
        }
        .cv-document .cv-section-skills ul,
        .cv-document .cv-section-languages ul,
        .cv-document .cv-section-certifications ul {
          margin: 2px 0 3px 14px;
          list-style-type: disc;
          padding: 0;
          columns: 2;
          column-gap: 16px;
        }
        .cv-document .cv-section-skills li,
        .cv-document .cv-section-languages li,
        .cv-document .cv-section-certifications li {
          font-size: 10pt;
          color: #333;
          margin: 1px 0;
          break-inside: avoid;
        }

        /* ── Generic fallback ── */
        .cv-document .cv-section-generic p {
          font-size: 10pt;
          color: #333;
          margin: 0 0 3px 0;
          line-height: 1.45;
        }
        .cv-document .cv-section-generic ul {
          margin: 2px 0 4px 14px;
          list-style-type: disc;
          padding: 0;
        }
        .cv-document .cv-section-generic li {
          font-size: 10pt;
          color: #333;
          margin: 1px 0;
        }

        /* ── Strong / em global reset inside cv-document ── */
        .cv-document strong { font-weight: 700; }
        .cv-document em { font-style: italic; }

        /* ── Ordered lists ── */
        .cv-document ol {
          margin: 2px 0 4px 14px;
          list-style-type: decimal;
          padding: 0;
        }
        .cv-document ol li {
          font-size: 10pt;
          color: #333;
          margin: 1px 0;
          line-height: 1.42;
        }
      `}</style>

      <div
        className="cv-document rounded-xl px-8 py-9 shadow-sm"
        style={{
          background: "#fff",
          border: "1px solid #e2e2e2",
          minHeight: "320px",
        }}
      >
        {!sections.some((s) => getSectionRole(s.type) === "header") && (
          <h1
            style={{
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              fontSize: "20pt",
              fontWeight: 700,
              color: "#0a0a0a",
              marginBottom: "4px",
              lineHeight: 1.1,
            }}
          >
            {displayName}
          </h1>
        )}

        {sections.map((section) => (
          <SectionPreview key={section.type} type={section.type} json={section.json} />
        ))}
      </div>
    </>
  );
}
