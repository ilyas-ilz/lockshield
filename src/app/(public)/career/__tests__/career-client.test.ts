import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CareerJobList } from "../career-client";

const job = {
  _id: "665f1c2e9b1e8a0012345678",
  title: "Fire Alarm Technician",
  department: "Field Operations",
  location: "Dubai, UAE",
  employmentType: "Full-time",
  requirements: ["3 years UAE experience"],
};

describe("CareerJobList", () => {
  it("renders a job description saved by the admin rich-text editor (Tiptap JSON)", () => {
    const description = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Commission addressable fire alarm panels." }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Quarterly AMC visits" }] }] }] },
      ],
    };

    const html = renderToStaticMarkup(createElement(CareerJobList, { jobs: [{ ...job, description }] }));

    expect(html).toContain("Commission addressable fire alarm panels.");
    expect(html).toContain("<li>");
    expect(html).not.toContain("available upon enquiry");
  });

  it("still renders a legacy plain-string description", () => {
    const html = renderToStaticMarkup(createElement(CareerJobList, { jobs: [{ ...job, description: "Plain text role." }] }));
    expect(html).toContain("Plain text role.");
  });
});
