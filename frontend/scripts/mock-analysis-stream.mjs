import http from "node:http";

const PORT = Number(process.env.MOCK_PORT ?? 3113);
const HEARTBEAT = process.env.MOCK_HEARTBEAT === "1";
const LEGACY = process.env.MOCK_LEGACY === "1";
const STREAM_DEAD_AT_MS = Number(process.env.MOCK_STREAM_DEAD_AT_MS ?? 0);
const HEARTBEAT_MS = 10000;
const COMPLETE_AT_MS = 51200;
const CHUNKS = 15;

const event = (at, stage, percentage, message, step, extra = {}) => ({
  at,
  stage,
  percentage,
  message,
  step,
  ...extra,
});

const legacyTimeline = [
  event(1700, "validating", 70, "Validating extraction quality..."),
  event(2000, "parsing", 100, "Document parsed successfully!"),
  event(2000, "analyzing_sections", 30, "Detecting CV sections..."),
  event(
    2100,
    "extracting_skills",
    60,
    "Extracting skills, entities and role...",
  ),
  event(2100, "detecting_archetype", 88, "Detecting AI role archetype..."),
  event(6900, "scoring", 75, "Scoring CV with AI..."),
  event(
    12600,
    "grammar_check",
    90,
    "Checking grammar and ATS compatibility...",
  ),
  event(
    16500,
    "generating_suggestions",
    90,
    "Generating AI improvement suggestions...",
  ),
  event(COMPLETE_AT_MS, "complete", 100, "Analysis complete!"),
];

const indexing = Array.from({ length: CHUNKS + 1 }, (_, done) =>
  event(
    16600 + done * 1200,
    "indexing_cv",
    80 + Math.floor((9 * done) / CHUNKS),
    `Indexing your CV (${done}/${CHUNKS})`,
    4,
    { done, total: CHUNKS },
  ),
);

const currentTimeline = [
  event(1700, "validating", 12, "Validating extraction quality...", 0),
  event(2000, "parsing", 18, "Document parsed successfully!", 0),
  event(2000, "analyzing_sections", 25, "Detecting CV sections...", 1),
  event(
    2100,
    "extracting_skills",
    40,
    "Extracting skills, entities and role...",
    1,
  ),
  event(2100, "detecting_archetype", 52, "Detecting AI role archetype...", 1),
  event(6900, "scoring", 62, "Scoring CV with AI...", 2),
  event(
    12600,
    "grammar_check",
    76,
    "Checking grammar and ATS compatibility...",
    3,
  ),
  ...indexing,
  event(
    35000,
    "generating_suggestions",
    90,
    "Generating AI improvement suggestions...",
    4,
  ),
  event(49000, "preparing_results", 96, "Preparing your results...", 4),
  event(COMPLETE_AT_MS, "complete", 100, "Analysis complete!", 5),
];

const timeline = LEGACY ? legacyTimeline : currentTimeline;
const startedAt = new Map();

const elapsed = (jobId) => {
  if (!startedAt.has(jobId)) startedAt.set(jobId, Date.now());
  return Date.now() - startedAt.get(jobId);
};

const payload = (jobId, { at, ...rest }) => {
  const body = { ...rest, job_id: jobId };
  if (LEGACY) {
    delete body.step;
    delete body.done;
    delete body.total;
  } else {
    body.steps = 5;
  }
  return body;
};

const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const stream = (req, res, jobId) => {
  const now = elapsed(jobId);
  if (STREAM_DEAD_AT_MS && now >= STREAM_DEAD_AT_MS) {
    res.writeHead(503);
    res.end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": LEGACY ? "no-cache" : "no-cache, no-transform",
    Connection: "keep-alive",
  });
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  send({ type: "connected", job_id: jobId });
  const timers = [];
  if (STREAM_DEAD_AT_MS) {
    timers.push(setTimeout(() => res.destroy(), STREAM_DEAD_AT_MS - now));
  }
  const terminal = timeline.at(-1);
  if (now >= COMPLETE_AT_MS) {
    send(payload(jobId, terminal));
    res.end();
    return;
  }
  for (const item of timeline.filter((entry) => entry.at > now)) {
    timers.push(
      setTimeout(() => {
        send(payload(jobId, item));
        if (item === terminal) res.end();
      }, item.at - now),
    );
  }
  if (HEARTBEAT) {
    timers.push(
      setInterval(
        () => res.write('data: {"type":"heartbeat"}\n\n'),
        HEARTBEAT_MS,
      ),
    );
  }
  req.on("close", () =>
    timers.forEach((timer) => (clearTimeout(timer), clearInterval(timer))),
  );
};

const route = (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  const streamMatch = pathname.match(/^\/api\/v1\/stream\/([^/]+)$/);
  const jobMatch = pathname.match(/^\/api\/v1\/jobs\/([^/]+)$/);
  const workspaceMatch = pathname.match(
    /^\/api\/v1\/jobs\/([^/]+)\/workspace$/,
  );
  if (streamMatch) return stream(req, res, streamMatch[1]);
  if (jobMatch) {
    const done = elapsed(jobMatch[1]) >= COMPLETE_AT_MS;
    return json(res, 200, {
      data: { id: jobMatch[1], status: done ? "complete" : "analyzing" },
    });
  }
  if (workspaceMatch) {
    return json(res, 200, {
      data: {
        job_id: workspaceMatch[1],
        status: "preparing",
        file: { filename: "mock-cv.pdf", mime_type: "application/pdf" },
        document: { source_text: "" },
        analysis: { suggestions: [] },
      },
    });
  }
  if (pathname === "/api/v1/auth/me") {
    return json(res, 200, {
      id: "mock-user",
      email: "mock@example.com",
      name: "Mock",
    });
  }
  return json(res, 404, { detail: "not mocked" });
};

http.createServer(route).listen(PORT, "127.0.0.1", () => {
  console.log(
    `mock analysis stream on ${PORT} legacy=${LEGACY} heartbeat=${HEARTBEAT}`,
  );
});
