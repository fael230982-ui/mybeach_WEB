import type { ApiErrorLike } from "@/lib/types";

export function extractApiErrorMessage(error: ApiErrorLike, fallback: string) {
  const detail = (
    error.body as { detail?: Array<{ loc?: string[]; msg: string }> | string } | undefined
  )?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => `${item.loc?.[item.loc.length - 1]}: ${item.msg}`)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return error.message || fallback;
}

export function shouldRetryQueryError(failureCount: number, error: unknown) {
  const typedError = error as ApiErrorLike | undefined;
  const status = typedError?.status;

  if (status === 401 || status === 403 || status === 404) {
    return false;
  }

  if (status && status < 500) {
    return false;
  }

  return failureCount < 2;
}
