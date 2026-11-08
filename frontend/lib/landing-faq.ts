export const faqItems = [
  { question: "What is pathkr?", answer: "pathkr is a set of tools for your job search. CV Analyzer is available now. CV Builder and Job Connect are planned next." },
  { question: "Is my CV stored?", answer: "Your file stays private to your account and is deleted automatically after it expires." },
  { question: "What formats work?", answer: "PDF and DOCX, including scanned PDFs. Text is read with OCR when needed." },
  { question: "How is the score calculated?", answer: "Four dimensions are scored several times and combined, then adjusted by simple rule checks such as numbers per bullet and action verbs." },
  { question: "Can I match it to a job?", answer: "Yes. Paste the job description and get a match percentage with the keywords you are missing." },
] as const;
export function nextFaqOpen(current: number | null, clicked: number) { return current === clicked ? null : clicked; }
