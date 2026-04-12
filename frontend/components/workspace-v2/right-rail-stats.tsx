"use client";
/**
 * RightRailStats — right summary rail for workspace-v2.
 * Matches mockup/rightDock: accordion sections + live chat stub.
 * Accordion entries link to left-panel detail tabs via setActiveDetailTab.
 * Chat panel is visual-only Phase 13 stub (live wiring Phase 16).
 */
import { useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface RightRailStatsProps {
  className?: string;
}

// ── Accordion section ────────────────────────────────────────────────────────
interface AccordionSectionProps {
  title: string;
  subtitle: string;
  tabId: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function AccordionSection({
  title,
  subtitle,
  tabId,
  defaultOpen = false,
  children,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { setActiveDetailTab } = useWorkspaceV2Store();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[--ws-border]",
        "bg-[rgba(255,255,255,0.03)]"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[--ws-surface-hover]"
      >
        <div className="min-w-0 flex-1">
          <p className="font-display text-[14px] font-bold text-[--ws-ink]">{title}</p>
          <p className="mt-0.5 text-[11px] text-[--ws-ink-ghost]">{subtitle}</p>
        </div>
        <div
          className={cn(
            "grid h-6 w-6 flex-none place-items-center rounded-full bg-[rgba(255,255,255,0.06)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        >
          <ChevronDown className="h-3 w-3 text-[--ws-ink-ghost]" aria-hidden="true" />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {children}
          <button
            type="button"
            onClick={() => setActiveDetailTab(tabId)}
            className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[--ws-accent] transition-colors hover:opacity-70"
          >
            Lihat detail →
          </button>
        </div>
      )}
    </section>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function RightRailStats({ className }: RightRailStatsProps) {
  const { hydration } = useWorkspaceV2Store();
  const [chatInput, setChatInput] = useState("");

  const analysis = hydration?.analysis;
  const overallScore = analysis?.scores?.overall ?? null;
  const clarityScore = analysis?.scores?.clarity ?? null;
  const impactScore = analysis?.scores?.impact ?? null;
  const suggestionCount = analysis?.suggestions
    ? analysis.suggestions.flatMap((c) => c.suggestions).length
    : 0;

  return (
    <div className={cn("flex h-full flex-col overflow-hidden bg-[--ws-surface]", className)}>
      {/* Panel title */}
      <div className="flex-none border-b border-[--ws-border] px-4 py-3">
        <h2 className="font-display text-[15px] font-bold text-[--ws-ink]">
          Ringkasan
        </h2>
        <p className="mt-0.5 text-[11px] text-[--ws-ink-ghost]">
          Versi singkat dari setiap panel analisa
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Summary accordion stack ────────────────────────────── */}
        <div className="flex flex-col gap-2 p-3">

          {/* Overview */}
          <AccordionSection
            title="Overview"
            subtitle={
              overallScore !== null
                ? `${overallScore} health score`
                : "Skor keseluruhan"
            }
            tabId="ringkasan"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-bold leading-none text-[--ws-accent]">
                {overallScore ?? "—"}
              </span>
              <span className="text-xs text-[--ws-ink-ghost]">/ 100</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Struktur section sudah dapat dibaca. Fokus perbaikan ada pada
              phrasing dan ownership language.
            </p>
          </AccordionSection>

          {/* Scores */}
          <AccordionSection
            title="Skor"
            subtitle={
              clarityScore !== null && impactScore !== null
                ? `Clarity ${clarityScore} / Impact ${impactScore}`
                : "Skor detail per dimensi"
            }
            tabId="skor"
            defaultOpen
          >
            <div className="mt-1 flex flex-col gap-2">
              {[
                { label: "Clarity", score: clarityScore, color: "#CAFF43" },
                { label: "Impact", score: impactScore, color: "#FF8C42" },
              ].map(({ label, score, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[--ws-ink-ghost]">
                      {label}
                    </span>
                    <span className="text-[12px] font-bold text-[--ws-ink-secondary]">
                      {score ?? "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score ?? 0}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* AI Suggestions */}
          <AccordionSection
            title="Saran AI"
            subtitle={
              suggestionCount > 0
                ? `${suggestionCount} saran aktif`
                : "Belum ada saran"
            }
            tabId="saran"
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              {suggestionCount > 0
                ? `Ada ${suggestionCount} kandidat rewrite yang sudah siap untuk di-apply ke dokumen.`
                : "Saran AI akan muncul setelah analisa selesai."}
            </p>
          </AccordionSection>

          {/* Grammar */}
          <AccordionSection
            title="Tata Bahasa"
            subtitle="Tidak ada error kritis"
            tabId="tatabahasa"
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Grammar secara umum sudah baik. Fokus utama adalah presisi gaya dan authority tone.
            </p>
          </AccordionSection>

          {/* Skills */}
          <AccordionSection
            title="Keahlian"
            subtitle="Analisa distribusi skill"
            tabId="keahlian"
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Profil skill akan ditampilkan di sini setelah data terhubung.
            </p>
          </AccordionSection>
        </div>

        {/* ── Live Chat stub ─────────────────────────────────────── */}
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[--ws-border] bg-[rgba(255,255,255,0.03)]">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[--ws-border]">
            <div>
              <h3 className="font-display text-[13px] font-bold text-[--ws-ink]">Live Chat</h3>
              <p className="mt-0.5 text-[10px] text-[--ws-ink-ghost]">Copilot kontekstual untuk CV ini</p>
            </div>
            <span className="rounded-full bg-[--ws-accent-muted] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[--ws-accent]">
              Soon
            </span>
          </div>

          {/* Initial AI message */}
          <div className="px-4 py-3">
            <div className="rounded-xl bg-[rgba(255,255,255,0.06)] px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
                Saya sudah menemukan beberapa area prioritas. Coba klik
                suggestion atau tanyakan saya untuk rewrite bagian tertentu.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {["Rewrite summary", "Improve bullets", "Explain score"].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled
                className="rounded-full border border-[--ws-border] px-2.5 py-1 text-[11px] font-semibold text-[--ws-ink-ghost] opacity-50 cursor-not-allowed"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="flex items-center gap-2 border-t border-[--ws-border] px-3 py-2.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tanya AI untuk refine atau rewrite..."
              disabled
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[--ws-ink-secondary] placeholder:text-[--ws-ink-ghost] outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled
              className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[--ws-accent] text-black opacity-40 cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
