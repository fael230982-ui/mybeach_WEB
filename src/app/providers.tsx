"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { FeedbackProvider } from "@/components/ui/FeedbackProvider";
import { AUTH_EXPIRED_EVENT } from "@/lib/apiClient";
import { shouldRetryQueryError } from "@/lib/errors";
import { logClientError } from "@/lib/logger";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            logClientError("react-query:error", error, { queryKey: query.queryKey });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: shouldRetryQueryError,
          },
        },
      }),
  );

  useEffect(() => {
    function handleAuthExpired() {
      const next = `${window.location.pathname}${window.location.search}`;
      const loginUrl = new URL("/login", window.location.origin);

      if (next.startsWith("/admin")) {
        loginUrl.searchParams.set("next", next);
      }

      window.location.replace(loginUrl.toString());
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>{children}</FeedbackProvider>
    </QueryClientProvider>
  );
}
