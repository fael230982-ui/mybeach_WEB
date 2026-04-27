type QueryValue = string | null | undefined;

export function buildPathWithQueryState(
  pathname: string,
  currentQuery: string,
  updates: Record<string, QueryValue>,
) {
  const params = new URLSearchParams(currentQuery);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export function hasQueryStateChanged(currentPath: string, nextPath: string) {
  return currentPath !== nextPath;
}
