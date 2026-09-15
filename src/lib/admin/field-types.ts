// WHY a config-driven form system: 9 CRUD-managed resources (Post,
// Category, Tag, Page, Service, Project, Job, Redirect, Media) would
// otherwise mean 9 bespoke form components. Each FieldConfig instead
// declares *what* a field is; one <ResourceForm> (components/admin) reads
// the array and renders it via <FieldInput>. Adding a field to a resource
// is a one-line config edit, not a new component.
export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "image"
  | "imageArray"
  | "stringArray"
  | "statsArray"
  | "objectArray"
  | "object"
  | "blocks";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[]; // for select/multiselect
  help?: string;
  defaultValue?: unknown;
  itemFields?: FieldConfig[]; // for type "objectArray" — shape of each row
}

export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (row: T) => string;
}

export interface ResourceConfig {
  key: string; // matches route segment, e.g. "posts"
  label: string; // e.g. "Blog Posts"
  description?: string; // one-line explanation shown under the page title
  apiPath: string; // e.g. "/api/posts"
  fields: FieldConfig[];
  columns: ColumnConfig[];
  searchable?: boolean;
}
