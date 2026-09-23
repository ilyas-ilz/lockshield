import { connectDB } from "@/lib/db";
import {
  Post,
  Category,
  Tag,
  Page,
  Service,
  Project,
  Job,
  Redirect,
  Media,
  User,
  Lead,
  LEAD_SOURCES,
} from "@/models";
import { paginate, resolveSort, type PageResult } from "@/lib/pagination";
import { SORTABLE_FIELDS, type SortableResource } from "@/lib/sortable-fields";
import type { Model } from "mongoose";

type ResourceModelMap = Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: Model<any>;
    searchFields: string[];
    defaultSort: Record<string, 1 | -1>;
    statusField?: "status" | "publishStatus";
  }
>;

const RESOURCE_MODELS: ResourceModelMap = {
  posts: {
    model: Post,
    searchFields: ["title", "excerpt"],
    defaultSort: { createdAt: -1 },
    statusField: "status",
  },
  categories: {
    model: Category,
    searchFields: ["name", "slug"],
    defaultSort: { name: 1 },
  },
  tags: {
    model: Tag,
    searchFields: ["name", "slug"],
    defaultSort: { name: 1 },
  },
  pages: {
    model: Page,
    searchFields: ["title", "slug"],
    defaultSort: { title: 1 },
    statusField: "status",
  },
  services: {
    model: Service,
    searchFields: ["title", "summary"],
    defaultSort: { order: 1, createdAt: -1 },
    statusField: "status",
  },
  projects: {
    model: Project,
    searchFields: ["title", "client", "summary"],
    defaultSort: { order: 1, year: -1 },
    statusField: "publishStatus",
  },
  jobs: {
    model: Job,
    searchFields: ["title", "department"],
    defaultSort: { createdAt: -1 },
    statusField: "status",
  },
  redirects: {
    model: Redirect,
    searchFields: ["from", "to"],
    defaultSort: { hits: -1, createdAt: -1 },
  },
  media: {
    model: Media,
    searchFields: ["alt", "url"],
    defaultSort: { createdAt: -1 },
  },
  users: {
    model: User,
    searchFields: ["name", "email"],
    defaultSort: { createdAt: -1 },
  },
};

export interface QueryParams {
  page?: string;
  pageSize?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  source?: string;
}

export async function fetchResourceSSR(
  resource: string,
  params: QueryParams
): Promise<PageResult<Record<string, unknown>> | null> {
  const meta = RESOURCE_MODELS[resource];
  if (!meta) return null;

  try {
    await connectDB();

    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 20)));
    const search = (params.search ?? "").trim();
    const sortField = (params.sort ?? "").trim();
    const order = params.order === "asc" ? "asc" : "desc";
    const status = (params.status ?? "").trim();

    const filter: Record<string, unknown> = {};

    if (search && meta.searchFields.length > 0) {
      const escaped = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (char) => "\\" + char);
      const regex = new RegExp(escaped, "i");
      filter.$or = meta.searchFields.map((f) => ({ [f]: regex }));
    }

    if (status && status !== "all" && meta.statusField) {
      filter[meta.statusField] = status;
    }

    const sortable = (SORTABLE_FIELDS[resource as SortableResource] ?? []) as readonly string[];
    const sort = resolveSort(sortField, order, sortable, meta.defaultSort);

    const result = await paginate(meta.model, filter, {
      page,
      pageSize,
      sort,
    });

    // Cleanly serialize ObjectIds & Dates so Next.js Server Components pass POJOs
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error(`fetchResourceSSR failed for "${resource}":`, error);
    return null;
  }
}

export async function fetchLeadsSSR<T = Record<string, unknown>>(
  params: QueryParams
): Promise<PageResult<T> | null> {
  try {
    await connectDB();

    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 20)));
    const search = (params.search ?? "").trim();
    const status = (params.status ?? "").trim();

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    // WHY whitelist: an unknown ?source= should show everything, not an empty list.
    const source = (params.source ?? "").trim();
    if ((LEAD_SOURCES as readonly string[]).includes(source)) {
      filter.source = source;
    }

    if (search) {
      const escaped = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (char) => "\\" + char);
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { email: regex }, { message: regex }];
    }

    const result = await paginate(Lead, filter, {
      page,
      pageSize,
      sort: { createdAt: -1 },
    });

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("fetchLeadsSSR failed:", error);
    return null;
  }
}
