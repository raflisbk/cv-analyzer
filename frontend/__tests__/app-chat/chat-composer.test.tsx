import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withLocale } from "../i18n/with-locale";
import ChatComposer from "@/components/app-chat/chat-composer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/app",
}));

function show(props: Partial<Parameters<typeof ChatComposer>[0]> = {}) {
  const onSend = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      {withLocale(
        <ChatComposer
          onSend={onSend}
          busy={false}
          placeholder="Ask"
          {...props}
        />,
      )}
    </QueryClientProvider>,
  );
  return { onSend, field: screen.getByPlaceholderText("Ask") };
}

it("sends on Enter and clears the field", () => {
  const { onSend, field } = show();
  fireEvent.change(field, { target: { value: "  hello  " } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(onSend).toHaveBeenCalledWith("hello");
  expect(field).toHaveValue("");
});

it("keeps Shift+Enter as a new line", () => {
  const { onSend, field } = show();
  fireEvent.change(field, { target: { value: "hello" } });
  fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
  expect(onSend).not.toHaveBeenCalled();
});

it("ignores blank text and a busy conversation", () => {
  const blank = show();
  fireEvent.keyDown(blank.field, { key: "Enter" });
  expect(blank.onSend).not.toHaveBeenCalled();
});

it("does not send while busy", () => {
  const { onSend, field } = show({ busy: true });
  fireEvent.change(field, { target: { value: "hello" } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(onSend).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
});
