import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderChatMarkdown } from "@/lib/chat-markdown";

const html = (text: string) =>
  renderToStaticMarkup(<>{renderChatMarkdown(text)}</>);

describe("chat markdown", () => {
  it("renders bold, italic, code and marker", () => {
    expect(html("a **b** *c* `d` ==e==")).toBe(
      "<p>a <strong>b</strong> <em>c</em> <code>d</code> <mark>e</mark></p>",
    );
  });

  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    expect(html("one\ntwo\n\nthree")).toBe("<p>one<br/>two</p><p>three</p>");
  });

  it("renders bullet and numbered lists", () => {
    expect(html("- a\n- b\n\n1. x\n2) y")).toBe(
      "<ul><li>a</li><li>b</li></ul><ol><li>x</li><li>y</li></ol>",
    );
  });

  it("renders inline formatting inside list items", () => {
    expect(html("* **a** done")).toBe(
      "<ul><li><strong>a</strong> done</li></ul>",
    );
  });

  it("renders headings as bold text", () => {
    expect(html("## Title")).toBe("<p><strong>Title</strong></p>");
  });

  it("opens http links in a new tab safely", () => {
    expect(html("[site](https://example.com/a?b=1)")).toBe(
      '<p><a href="https://example.com/a?b=1" target="_blank" rel="noopener noreferrer">site</a></p>',
    );
  });

  it("keeps unclosed markers literal while streaming", () => {
    expect(html("Skor **informasi pen")).toBe("<p>Skor **informasi pen</p>");
    expect(html("a `code and *half")).toBe("<p>a `code and *half</p>");
  });

  it("formats the marker once it closes", () => {
    expect(html("**tebal")).toBe("<p>**tebal</p>");
    expect(html("**tebal**")).toBe("<p><strong>tebal</strong></p>");
  });

  it("never emits raw html from the model", () => {
    const output = html("<script>alert(1)</script> <b>x</b>");
    expect(output).not.toContain("<script>");
    expect(output).toContain("&lt;script&gt;");
  });

  it("keeps javascript links as inert text", () => {
    const output = html("[x](javascript:alert(1)) [y](data:text/html,hi)");
    expect(output).not.toContain("<a");
    expect(output).toContain("[x](javascript:alert(1))");
  });

  it("does not treat snake_case file names as emphasis", () => {
    expect(html("Resume_Mohamad_Rafli.pdf")).toBe(
      "<p>Resume_Mohamad_Rafli.pdf</p>",
    );
  });

  it("returns nothing for empty text", () => {
    expect(renderChatMarkdown("")).toEqual([]);
  });
});
