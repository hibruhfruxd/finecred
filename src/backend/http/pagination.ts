import { paginationSchema } from "@/models/validation/production";
import { parseWithSchema } from "./errors";

export function readListQuery(request: Request): {
  limit: number;
  offset: number;
  status?: string;
  role?: string;
  q?: string;
  raw: URLSearchParams;
} {
  const url = new URL(request.url);
  const values: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    values[key] = value;
  });
  const parsed = parseWithSchema(paginationSchema, values, "The list filters are invalid.");
  return {
    limit: parsed.limit,
    offset: parsed.offset,
    status: parsed.status,
    role: parsed.role,
    q: parsed.q,
    raw: url.searchParams,
  };
}
