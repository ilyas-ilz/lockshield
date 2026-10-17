import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Counter } from "../Counter";

// The server HTML is what crawlers and link previews read. The count-up used
// to start at 0, so Google saw "0+ Employees, 0+ Projects Completed".
describe("Counter", () => {
  it("server-renders the real figure, not 0", () => {
    const html = renderToString(createElement(Counter, { target: 250 }));
    expect(html).toContain("250");
    expect(html).not.toMatch(/>0<!-- -->\+/);
  });

  it("keeps the suffix", () => {
    expect(renderToString(createElement(Counter, { target: 15, suffix: " yrs" }))).toContain("15<!-- --> yrs");
  });
});
