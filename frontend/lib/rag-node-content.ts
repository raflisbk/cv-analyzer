/* Single source of truth for the RAG personalization graph.
   Consumed by the WebGL graph (components/landing/rag-graph.tsx) for node
   labels, and by the explainer section for the per-node detail panels.
   Every entry maps to a real backend subsystem — keep descriptions honest. */

export interface RagSubNode {
  label: string;
  detail: string;
}

export interface RagNodeContent {
  /** Chip label rendered inside the WebGL graph */
  label: string;
  /** Panel headline when this node is selected */
  title: string;
  /** One-line kicker above the title */
  tagline: string;
  /** Panel body copy */
  description: string;
  /** Labeled children — also rendered as mini chips in the graph */
  subs: [RagSubNode, RagSubNode];
  /** What actually powers it (portfolio honesty) */
  tech: string;
}

export const RAG_NODES: RagNodeContent[] = [
  {
    label: "CV Sections",
    title: "Your CV, decomposed",
    tagline: "The raw material",
    description:
      "The moment your analysis finishes, every section of your CV — experience, education, summary, projects — is embedded into the graph as its own memory chunk. The AI never works from a blurry whole; it retrieves the exact section that matters for each question.",
    subs: [
      { label: "Experience", detail: "Each role becomes a retrievable chunk" },
      { label: "Education", detail: "Degrees and courses, indexed separately" },
    ],
    tech: "Section detector → per-section embeddings in job memory",
  },
  {
    label: "Job Memory",
    title: "It remembers what you do",
    tagline: "The living part",
    description:
      "Every inline edit you accept and every chat message you send is embedded back into this job's memory. Ask a follow-up question tomorrow and the AI already knows which bullet you rewrote and why — no repeating yourself.",
    subs: [
      { label: "Edits", detail: "Accepted rewrites, stored with context" },
      { label: "Chats", detail: "Both sides of every conversation" },
    ],
    tech: "pgvector job_memory_chunks, cosine retrieval per request",
  },
  {
    label: "Skills",
    title: "Extracted, not assumed",
    tagline: "What you can actually do",
    description:
      "An NLP pipeline reads your CV and pulls out the hard and soft skills you actually demonstrate — not just the ones you list. These become graph nodes that the JD matcher and the scorer both query.",
    subs: [
      { label: "Python", detail: "Hard skills, detected in context" },
      { label: "Figma", detail: "Tools and platforms you evidence" },
    ],
    tech: "spaCy skill extractor + entity recognition",
  },
  {
    label: "JD Match",
    title: "Measured against the real job",
    tagline: "Not generic advice",
    description:
      "Paste a job description and the graph gets a new neighborhood: the keywords the role demands, and the gaps between them and your CV. Every suggestion after that is tuned to this job — not to an imaginary average one.",
    subs: [
      { label: "Keywords", detail: "What the role explicitly asks for" },
      { label: "Gaps", detail: "What your CV is still missing" },
    ],
    tech: "JD keyword gap analysis, folded into scoring",
  },
  {
    label: "Knowledge",
    title: "Best practice, on tap",
    tagline: "The library",
    description:
      "A curated knowledge base of CV-writing guides and patterns lives in the same vector space. When the AI suggests a rewrite, it retrieves the most relevant guidance first — so advice comes from proven practice, not model vibes.",
    subs: [
      { label: "Guides", detail: "Curated CV-writing playbooks" },
      { label: "Patterns", detail: "Reusable phrasing that works" },
    ],
    tech: "RAG over pgvector knowledge_chunks, top-K retrieval",
  },
  {
    label: "AI Score",
    title: "Four dimensions, one verdict",
    tagline: "The output node",
    description:
      "Impact, clarity, relevance, completeness — scored by an LLM ensemble that runs multiple passes and takes the median, then gets nudged by deterministic rules (quantified bullets, action verbs, gaps). The score reads from every other node in this graph.",
    subs: [
      { label: "Impact", detail: "Do your bullets prove outcomes?" },
      { label: "Clarity", detail: "Can a recruiter skim it in 30s?" },
    ],
    tech: "LLM ensemble (median of N) + rule-based overlay",
  },
];

/** Panel copy when no node is selected */
export const RAG_OVERVIEW = {
  tagline: "Why it feels personal",
  title: "One graph, built around you",
  description:
    "Most CV tools run your file through the same static checklist as everyone else's. Path Karir builds a retrieval graph per job instead: your sections, your edits, your chats, your target role — all embedded and queried on every AI call. Click any node to see what it feeds into the answer.",
  tech: "Retrieval-Augmented Generation — context assembled per request",
};
