"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Cached pages (Dashboard, Products, Categories, Suppliers, Customers,
// Reports, Settings, Invoice Details) read through this client. Pages that
// must always be fresh (Login, Users, Purchase Orders, Sales Orders,
// Payments) simply don't use useQuery and are unaffected by this cache.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
