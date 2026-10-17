import { describe, it, expect } from "vitest";
import type { ZodTypeAny } from "zod";
import type { FieldConfig } from "../field-types";
import { fieldDefault, selectValue, withFieldDefaults } from "../field-defaults";
import { RESOURCE_CONFIGS } from "../resource-configs";
import { BLOCK_FIELD_CONFIGS } from "../block-field-configs";
import { blockSchema, type BlockType } from "@/lib/blocks/schemas";
import { postCreateSchema } from "@/lib/validation/post";
import { pageCreateSchema, serviceCreateSchema } from "@/lib/validation/page";
import { projectCreateSchema } from "@/lib/validation/project";
import { jobCreateSchema } from "@/lib/validation/job";
import { redirectCreateSchema } from "@/lib/validation/redirect";

const sector: FieldConfig = { name: "sector", label: "Sector", type: "select", options: ["Retail", "F&B"], required: true };
const statusCode: FieldConfig = { name: "statusCode", label: "Status Code", type: "select", options: ["301", "302"], valueType: "number" };

describe("fieldDefault", () => {
  it("starts a select on its first option, which is what the dropdown shows", () => {
    expect(fieldDefault(sector)).toBe("Retail");
  });

  it("prefers an explicit defaultValue", () => {
    expect(fieldDefault({ ...sector, defaultValue: "F&B" })).toBe("F&B");
  });

  it("gives a numeric select a number, not the option string", () => {
    expect(fieldDefault(statusCode)).toBe(301);
  });

  it("has no default for plain fields without a defaultValue", () => {
    expect(fieldDefault({ name: "title", label: "Title", type: "text" })).toBeUndefined();
  });
});

describe("selectValue", () => {
  it("passes string options through", () => {
    expect(selectValue(sector, "F&B")).toBe("F&B");
  });

  it("converts a numeric select's option to a number", () => {
    expect(selectValue(statusCode, "302")).toBe(302);
  });
});

describe("withFieldDefaults", () => {
  const fields: FieldConfig[] = [
    sector,
    statusCode,
    { name: "order", label: "Order", type: "number", defaultValue: 0 },
    { name: "seo.noindex", label: "noindex", type: "boolean", defaultValue: false },
    { name: "title", label: "Title", type: "text" },
  ];

  it("fills every missing field, including dotted paths", () => {
    expect(withFieldDefaults(fields, {})).toEqual({
      sector: "Retail",
      statusCode: 301,
      order: 0,
      seo: { noindex: false },
    });
  });

  it("keeps values the record already has, even falsy ones", () => {
    const record = { sector: "F&B", statusCode: 302, order: 5, seo: { noindex: true, title: "T" }, title: "" };
    expect(withFieldDefaults(fields, record)).toEqual(record);
  });

  it("does not mutate the input", () => {
    const record = { seo: { title: "T" } };
    withFieldDefaults(fields, record);
    expect(record).toEqual({ seo: { title: "T" } });
  });
});

// Guardrail: a dropdown must only ever produce values the server accepts.
// Before this, Project sector/emirate showed an option the form never sent
// (every new project failed "Required"), and the redirect status code and
// the grid "columns" block sent "302"/"3" strings to number-only schemas.
const RESOURCE_SCHEMAS: Record<string, { shape: Record<string, ZodTypeAny> }> = {
  posts: postCreateSchema,
  pages: pageCreateSchema,
  services: serviceCreateSchema,
  projects: projectCreateSchema,
  jobs: jobCreateSchema,
  redirects: redirectCreateSchema,
};

function selectFields(fields: FieldConfig[]): FieldConfig[] {
  return fields.filter((f) => f.type === "select");
}

describe("every admin dropdown matches the server schema", () => {
  for (const [key, schema] of Object.entries(RESOURCE_SCHEMAS)) {
    for (const field of selectFields(RESOURCE_CONFIGS[key]!.fields)) {
      it(`${key}.${field.name}: default and every option are accepted`, () => {
        const fieldSchema = schema.shape[field.name];
        expect(fieldSchema, `${key} schema has no "${field.name}"`).toBeDefined();
        expect(fieldSchema!.safeParse(fieldDefault(field)).success).toBe(true);
        for (const opt of field.options ?? []) {
          expect(fieldSchema!.safeParse(selectValue(field, opt)).success, `option "${opt}"`).toBe(true);
        }
      });
    }
  }

  for (const [type, fields] of Object.entries(BLOCK_FIELD_CONFIGS) as [BlockType, FieldConfig[]][]) {
    for (const field of selectFields(fields)) {
      it(`block ${type}.${field.name}: default and every option are accepted`, () => {
        const blockShape = blockSchema.optionsMap.get(type)!.shape as Record<string, ZodTypeAny>;
        const fieldSchema = blockShape[field.name]!;
        expect(fieldSchema.safeParse(fieldDefault(field)).success).toBe(true);
        for (const opt of field.options ?? []) {
          expect(fieldSchema.safeParse(selectValue(field, opt)).success, `option "${opt}"`).toBe(true);
        }
      });
    }
  }

  it("a new project form starts with the sector and emirate it displays", () => {
    const seeded = withFieldDefaults(RESOURCE_CONFIGS.projects!.fields, {});
    expect(projectCreateSchema.shape.sector.safeParse(seeded.sector).success).toBe(true);
    expect(projectCreateSchema.shape.emirate.safeParse(seeded.emirate).success).toBe(true);
  });
});
