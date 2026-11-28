import type { ChatMessage } from "@/lib/app-api/conversations.types";

const SCORE_WORDS = /\b(skor|score|scoring|rating|nilai)\b/;
const FIX_WORDS =
  /\b(perbaik\w*|improv\w*|fix\w*|naik\w*|tingkat\w*|increas\w*|raise|boost|upgrade|revisi)\b/;
const WHY_LOW = /\b(kenapa|mengapa|why)\b.*\b(rendah|kecil|low|bad|jelek)\b/;

export function matchesArtifactIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    SCORE_WORDS.test(lower) || FIX_WORDS.test(lower) || WHY_LOW.test(lower)
  );
}

export function artifactMessageIds(messages: ChatMessage[]): Set<string> {
  const ids = new Set<string>();
  messages.forEach((message, index) => {
    const question = messages[index - 1];
    if (
      message.role === "assistant" &&
      message.text &&
      question?.role === "user" &&
      matchesArtifactIntent(question.text)
    ) {
      ids.add(message.id);
    }
  });
  return ids;
}
