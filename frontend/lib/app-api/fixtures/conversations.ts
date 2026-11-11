import type { ChatMessage, ConversationSummary } from "../conversations.types";

export const conversationFixtures: ConversationSummary[] = [
  {
    id: "sample-score",
    title: "How can I raise my CV score?",
    scope: { type: "cv", jobId: "samuel-2026", fileName: "Samuel_CV_2026.pdf" },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-career",
    title: "Product designer interview tips",
    scope: { type: "general" },
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const messageFixtures: Record<string, ChatMessage[]> = {
  "sample-score": [
    { id: "u1", role: "user", text: "How can I raise my CV score?" },
    {
      id: "a1",
      role: "assistant",
      text: "Start with your impact bullets. Add a measurable result from your own records to show what changed after the checkout rebuild.",
      actions: [
        { type: "open_workspace", jobId: "samuel-2026", view: "editor" },
      ],
    },
  ],
  "sample-career": [
    {
      id: "u2",
      role: "user",
      text: "How should I prepare for a product designer interview?",
    },
    {
      id: "a2",
      role: "assistant",
      text: "Choose two projects and explain the problem, your decisions, and the outcome. Keep any numbers tied to evidence you can discuss.",
    },
  ],
};

export function mockReply(text: string): ChatMessage {
  const lower = text.toLowerCase();
  let reply =
    "I can help with your CV and career. Try asking me to review a bullet, explain a score, or prepare for an interview.";
  if (/score|impact|improv|fix/.test(lower)) {
    reply =
      "Your clearest next step is to add outcomes to your experience bullets. Tell me the real result and I can help phrase it without inventing a number.";
  } else if (/job|match|role/.test(lower)) {
    reply =
      "Paste a job description or open Job match in a CV workspace. I can help compare the role with your experience.";
  } else if (/interview|career|resume|cv|bullet|skill/.test(lower)) {
    reply =
      "Focus on the work you actually did, the decisions you made, and results you can support. Upload your CV for specific feedback.";
  }
  return { id: crypto.randomUUID(), role: "assistant", text: reply };
}
