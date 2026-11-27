import { afterEach, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { withLocale } from "../i18n/with-locale";
import { useConversationSend } from "@/hooks/use-conversation-send";
import { sendMessage } from "@/lib/app-api/conversations";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("@/lib/app-api/conversations", () => ({ sendMessage: vi.fn() }));

afterEach(() => vi.clearAllMocks());

it.each([
  ["id", "Pesan kamu belum terkirim. Coba lagi ya."],
  ["en", "Could not send your message. Try again."],
] as [Locale, string][])(
  "reports a translated send error in %s",
  async (locale, expected) => {
    vi.mocked(sendMessage).mockRejectedValue(new Error("offline"));
    const client = new QueryClient();
    const { result } = renderHook(
      () => useConversationSend(async () => "chat"),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          withLocale(
            <QueryClientProvider client={client}>
              {children}
            </QueryClientProvider>,
            locale,
          ),
      },
    );
    act(() => {
      void result.current.send("Hi");
    });
    await waitFor(() => expect(result.current.error).toBe(expected));
  },
);
