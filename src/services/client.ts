/**
 * api-client: single-axis DummyJSON access. Pure functions only —
 * no Context, no components, no toasts, no caching, no localStorage.
 *
 * Single-axis rule (q wins, else category, else base). The listing owns
 * client-side combining within the returned page when the API cannot combine.
 */
import { ApiError } from "@/types/api-error";
import type {
  AddProductPayload,
  PaginatedProducts,
  Product,
} from "@/types/product";

export const API_BASE_URL = "https://dummyjson.com/products";
export const REQUEST_TIMEOUT_MS = 8000;

/** Static fallback when the categories endpoint fails. */
export const FALLBACK_CATEGORIES: readonly string[] = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
];

export interface PageParams {
  limit: number;
  skip: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface SearchParams extends PageParams {
  q: string;
}

export interface CategoryParams extends PageParams {
  category: string;
}

export interface FetchProductsParams extends PageParams {
  q?: string;
  category?: string;
}

function assertPage(limit: number, skip: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw ApiError.validation(
      `limit must be an integer 1-100, got ${String(limit)}`,
    );
  }
  if (!Number.isInteger(skip) || skip < 0) {
    throw ApiError.validation(
      `skip must be an integer >= 0, got ${String(skip)}`,
    );
  }
}

function buildPageParams(params: PageParams): URLSearchParams {
  assertPage(params.limit, params.skip);
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  search.set("skip", String(params.skip));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.order) search.set("order", params.order);
  return search;
}

interface RequestInit {
  params?: URLSearchParams;
  method?: string;
  body?: unknown;
}

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const query = init?.params ? `?${init.params.toString()}` : "";
  const url = `${API_BASE_URL}${path}${query}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: init?.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    throw ApiError.retryable(
      timedOut
        ? `Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`
        : `Network request failed: ${url}`,
    );
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw ApiError.fromStatus(
      response.status,
      url,
      response.headers.get("Retry-After"),
    );
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw ApiError.unknown(`Invalid JSON response: ${url}`, response.status);
  }
}

function isProductShape(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "number" && typeof record.title === "string";
}

function assertPaginated(data: unknown, url: string): PaginatedProducts {
  if (typeof data !== "object" || data === null) {
    throw ApiError.unknown(`Unexpected paginated shape: ${url}`);
  }
  const record = data as Record<string, unknown>;
  // skip>=total yields an empty array upstream; pass through, never error.
  if (!Array.isArray(record.products) || typeof record.total !== "number") {
    throw ApiError.unknown(`Unexpected paginated shape: ${url}`);
  }
  const products = record.products.filter(isProductShape);
  return {
    products,
    total: record.total,
    skip: typeof record.skip === "number" ? record.skip : 0,
    limit: typeof record.limit === "number" ? record.limit : products.length,
  };
}

function assertProduct(data: unknown, url: string): Product {
  if (!isProductShape(data))
    throw ApiError.unknown(`Unexpected product shape: ${url}`);
  return data;
}

/** Base list. Raw server page, no local merge. */
export async function listProducts(
  params: PageParams,
): Promise<PaginatedProducts> {
  const data = await fetchJson("", { params: buildPageParams(params) });
  return assertPaginated(data, API_BASE_URL);
}

/** Search by name. Empty q is a caller error — caller must use listProducts instead. */
export async function searchProducts(
  params: SearchParams,
): Promise<PaginatedProducts> {
  if (!params.q.trim()) {
    throw ApiError.validation(
      "searchProducts requires a non-empty q; use listProducts instead",
    );
  }
  const search = buildPageParams(params);
  search.set("q", params.q.trim());
  const data = await fetchJson("/search", { params: search });
  return assertPaginated(data, `${API_BASE_URL}/search`);
}

/** Category filter. Slug lowercased + encoded; unknown slug resolves as NOT_FOUND. */
export async function productsByCategory(
  params: CategoryParams,
): Promise<PaginatedProducts> {
  const slug = params.category.trim().toLowerCase();
  if (!slug)
    throw ApiError.validation(
      "productsByCategory requires a non-empty category slug",
    );
  const data = await fetchJson(`/category/${encodeURIComponent(slug)}`, {
    params: buildPageParams(params),
  });
  const page = assertPaginated(data, `${API_BASE_URL}/category/${slug}`);
  // Live API returns 200 + empty (not 404) for unknown slugs; map total 0 to
  // NOT_FOUND so callers can fall back (listing: all + toast).
  if (page.total === 0) {
    throw ApiError.notFound(`Unknown category: ${slug}`, 404);
  }
  return page;
}

/**
 * Category slugs. Accepts string[] as-is and {slug,name}[] mapped to slugs,
 * all lowercase. Never throws: failure resolves the static fallback.
 */
export function normalizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [...FALLBACK_CATEGORIES];
  const slugs: string[] = [];
  for (const item of input) {
    if (typeof item === "string") {
      if (item.trim()) slugs.push(item.trim().toLowerCase());
    } else if (typeof item === "object" && item !== null && "slug" in item) {
      const slug = (item as Record<string, unknown>).slug;
      if (typeof slug === "string" && slug.trim())
        slugs.push(slug.trim().toLowerCase());
    }
  }
  return slugs.length > 0 ? slugs : [...FALLBACK_CATEGORIES];
}

export async function listCategories(): Promise<string[]> {
  try {
    return normalizeCategories(await fetchJson("/categories"));
  } catch (error) {
    console.warn(
      "listCategories failed, using fallback:",
      error instanceof Error ? error.message : error,
    );
    return [...FALLBACK_CATEGORIES];
  }
}

/** Details by numeric server id. Temp (negative) ids never reach the network. */
export async function productById(id: number): Promise<Product> {
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
    throw ApiError.validation(
      `productById requires a positive integer id, got ${String(id)}`,
    );
  }
  const data = await fetchJson(`/${id}`);
  return assertProduct(data, `${API_BASE_URL}/${id}`);
}

/**
 * Mock POST. Returns the server product (mock id included); the caller ignores
 * the id and assigns a temp -Date.now(). Network failure throws RETRYABLE —
 * the caller preserves the form payload.
 */
export async function addProduct(payload: AddProductPayload): Promise<Product> {
  if (typeof payload !== "object" || payload === null) {
    throw ApiError.validation("addProduct requires a payload object");
  }
  const data = await fetchJson("/add", { method: "POST", body: payload });
  return assertProduct(data, `${API_BASE_URL}/add`);
}

/** Single-axis entry: q priority, else category (except "all"), else base list. */
export async function fetchProducts(
  params: FetchProductsParams,
): Promise<PaginatedProducts> {
  const q = params.q?.trim() ?? "";
  if (q) return searchProducts({ ...params, q });
  const category = params.category?.trim() ?? "";
  if (category && category.toLowerCase() !== "all") {
    return productsByCategory({ ...params, category });
  }
  return listProducts(params);
}
