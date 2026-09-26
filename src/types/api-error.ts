/** Typed API failure. Created by api-client, consumed by UI (toasts live in callers). */

export type ApiErrorKind = "VALIDATION" | "NOT_FOUND" | "RETRYABLE" | "UNKNOWN";

export interface ApiErrorOptions {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  /** Backoff hint parsed from Retry-After on 429. */
  retryAfterMs?: number;
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
  return undefined;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.kind = options.kind;
    this.status = options.status;
    this.retryable = options.kind === "RETRYABLE";
    this.retryAfterMs = options.retryAfterMs;
  }

  static validation(message: string): ApiError {
    return new ApiError({ kind: "VALIDATION", message });
  }

  static notFound(message: string, status = 404): ApiError {
    return new ApiError({ kind: "NOT_FOUND", message, status });
  }

  static retryable(
    message: string,
    status?: number,
    retryAfterMs?: number,
  ): ApiError {
    return new ApiError({ kind: "RETRYABLE", message, status, retryAfterMs });
  }

  static unknown(message: string, status?: number): ApiError {
    return new ApiError({ kind: "UNKNOWN", message, status });
  }

  static fromStatus(
    status: number,
    url: string,
    retryAfterHeader: string | null,
  ): ApiError {
    if (status === 404) return ApiError.notFound(`Not found: ${url}`, status);
    if (status === 429) {
      return ApiError.retryable(
        `Rate limited, retry after backoff: ${url}`,
        status,
        parseRetryAfter(retryAfterHeader),
      );
    }
    return ApiError.retryable(
      `Request failed (status ${status}): ${url}`,
      status,
    );
  }
}
