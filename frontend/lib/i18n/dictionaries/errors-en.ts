const errorsEn = {
  api: {
    fileTooLarge: "That file is over 5 MB. Compress or split your CV.",
    invalidFileType: "Only PDF and DOCX files are supported.",
    invalidFile: "That file could not be read. It may be corrupted.",
    uploadFailed: "The upload did not go through.",
    unauthorized: "Your session expired. Log in again.",
    network: "Network unavailable. Check your connection.",
    parse: "Unexpected response from the server.",
    emptyExport: "The exported PDF is empty.",
    chatFailed: "Could not send your message.",
    generic: "Something went wrong. Try again.",
  },
  boundary: {
    title: "Something went wrong",
    body: "An unexpected error occurred while loading this page.",
    globalBody:
      "An unexpected error occurred. We apologize for the inconvenience.",
    retry: "Try again",
    home: "Go home",
    notFound: "The page you are looking for does not exist.",
    appBody: "We could not open this page.",
  },
  stream: {
    complete: "Analysis complete!",
    failed: "Analysis failed.",
  },
  draft: {
    saveFailed: "Failed to save changes. Your edits are not lost. Retrying...",
  },
  jobMatch: {
    tooShort: "Paste a job description of at least 50 characters.",
    failed: "Job match could not run. Try again.",
  },
  chat: {
    sendFailed: "Could not send your message. Try again.",
  },
} as const;
export default errorsEn;
