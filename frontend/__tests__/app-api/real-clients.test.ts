import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/lib/app-api/mode", () => ({ USE_APP_MOCKS: false }));

const envelope = (data: unknown) =>
  new Response(JSON.stringify({ data }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

it("creates a CV scoped conversation using the backend jobId body", async () => {
  const request = vi.fn().mockResolvedValue(envelope({ id: "conversation" }));
  vi.stubGlobal("fetch", request);
  const { createConversation } = await import("@/lib/app-api/conversations");
  await expect(createConversation("job")).resolves.toMatchObject({
    id: "conversation",
  });
  expect(request).toHaveBeenCalledWith(
    "/api/v1/conversations",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ jobId: "job" }),
    }),
  );
});

it("reads the plain messages array returned by the backend", async () => {
  const messages = [{ id: "one", role: "user", text: "Hi" }];
  const request = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(messages)));
  vi.stubGlobal("fetch", request);
  const { listMessages } = await import("@/lib/app-api/conversations");
  await expect(listMessages("a/b")).resolves.toEqual(messages);
  expect(request).toHaveBeenCalledWith(
    "/api/v1/conversations/a%2Fb/messages",
    expect.objectContaining({ credentials: "include" }),
  );
});

it("refreshes a session before retrying plain messages", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 401 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user" })))
    .mockResolvedValueOnce(new Response(JSON.stringify([])));
  vi.stubGlobal("fetch", request);
  const { listMessages } = await import("@/lib/app-api/conversations");
  await expect(listMessages("one")).resolves.toEqual([]);
  expect(request).toHaveBeenCalledTimes(3);
});

it("passes the jobId query to export templates", async () => {
  const request = vi.fn().mockResolvedValue(envelope([]));
  vi.stubGlobal("fetch", request);
  const { getExportTemplates } = await import("@/lib/app-api/export");
  await getExportTemplates("a/b");
  expect(request).toHaveBeenCalledWith(
    "/api/v1/export/templates?jobId=a%2Fb",
    expect.any(Object),
  );
});

it("returns export applied and skipped counts from response headers", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response("pdf", {
      headers: { "X-Export-Applied": "2", "X-Export-Skipped": "1" },
    }),
  );
  vi.stubGlobal("fetch", request);
  const { exportCv } = await import("@/lib/app-api/export");
  const result = await exportCv("job", {
    templateId: "plain",
    fixIds: ["a"],
    answers: { a: { count: "6" } },
  });
  expect(result.applied).toBe(2);
  expect(result.skipped).toBe(1);
  expect(request).toHaveBeenCalledWith(
    "/api/v1/jobs/job/export",
    expect.objectContaining({
      body: JSON.stringify({
        templateId: "plain",
        fixIds: ["a"],
        answers: { a: { count: "6" } },
      }),
    }),
  );
});

it("uses the server's DOCX filename for an original export", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("docx", {
        headers: {
          "Content-Disposition": 'attachment; filename="resume-original.docx"',
        },
      }),
    ),
  );
  const { exportCv } = await import("@/lib/app-api/export");
  const result = await exportCv("job", { templateId: "original" });
  expect(result.fileName).toBe("resume-original.docx");
});

it("normalizes backend suggestion fields for the workspace", async () => {
  const { normalizeSuggestions } = await import("@/lib/app-api/workspace");
  expect(
    normalizeSuggestions([
      {
        section: "Experience",
        suggestions: [
          {
            text: "Add scale",
            type: "impact_metric",
            priority: "high_impact",
            original_text: "Led team",
            after_text: "Led [team size] people",
            needsInput: [{ token: "[team size]", question: "How many?" }],
          },
        ],
      },
    ])?.[0].suggestions[0],
  ).toMatchObject({
    originalText: "Led team",
    afterText: "Led [team size] people",
    needsInput: [{ question: "How many?" }],
  });
});

it("shows the backend export error message", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "EXPORT_FAILED", message: "Template unavailable" },
        }),
        { status: 422 },
      ),
    ),
  );
  const { exportCv } = await import("@/lib/app-api/export");
  await expect(exportCv("job", { templateId: "plain" })).rejects.toThrow(
    "Template unavailable",
  );
});

it.each([
  [
    "cvs",
    () => import("@/lib/app-api/cvs").then((m) => m.listCvs()),
    "/api/v1/cvs",
    "GET",
  ],
  [
    "reports",
    () => import("@/lib/app-api/reports").then((m) => m.listReports()),
    "/api/v1/reports",
    "GET",
  ],
  [
    "conversations",
    () =>
      import("@/lib/app-api/conversations").then((m) => m.listConversations()),
    "/api/v1/conversations",
    "GET",
  ],
  [
    "report detail",
    () =>
      import("@/lib/app-api/report-detail").then((m) =>
        m.getReportDetail("job"),
      ),
    "/api/v1/jobs/job/report",
    "GET",
  ],
  [
    "versions",
    () => import("@/lib/app-api/history").then((m) => m.getVersions("job")),
    "/api/v1/jobs/job/versions",
    "GET",
  ],
  [
    "version diff",
    () =>
      import("@/lib/app-api/history").then((m) =>
        m.getVersionDiff("job", "v1"),
      ),
    "/api/v1/jobs/job/versions/v1/diff",
    "GET",
  ],
  [
    "ATS",
    () => import("@/lib/app-api/ats").then((m) => m.getAts("job")),
    "/api/v1/jobs/job/ats",
    "GET",
  ],
  [
    "grammar",
    () => import("@/lib/app-api/grammar").then((m) => m.getGrammar("job")),
    "/api/v1/jobs/job/grammar",
    "GET",
  ],
  [
    "grammar accept",
    () =>
      import("@/lib/app-api/grammar").then((m) =>
        m.resolveGrammar("job", "note", "accept"),
      ),
    "/api/v1/jobs/job/grammar/note/accept",
    "POST",
  ],
  [
    "grammar ignore",
    () =>
      import("@/lib/app-api/grammar").then((m) =>
        m.resolveGrammar("job", "note", "ignore"),
      ),
    "/api/v1/jobs/job/grammar/note/ignore",
    "POST",
  ],
  [
    "job match",
    () =>
      import("@/lib/app-api/jobmatch").then((m) =>
        m.matchJob("job", "A detailed job description"),
      ),
    "/api/v1/jobs/job/job-match",
    "POST",
  ],
  [
    "inline rewrite",
    () =>
      import("@/lib/app-api/workspace").then((m) =>
        m.requestInlineRewrite("job", "before", "improve"),
      ),
    "/api/v1/jobs/job/inline-edit",
    "POST",
  ],
] as const)("uses the backend %s route", async (_name, invoke, url, method) => {
  const request = vi
    .fn()
    .mockResolvedValue(envelope({ rewrittenText: "after" }));
  vi.stubGlobal("fetch", request);
  await invoke();
  expect(request).toHaveBeenCalledWith(
    url,
    expect.objectContaining(method === "POST" ? { method } : {}),
  );
});
