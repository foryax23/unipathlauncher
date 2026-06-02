// Persist TanStack Query cache into localStorage so repeat visits feel instant.
// Only call this once consent for the "preferences" category is granted.

import type { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const KEY = "bgc-rq-cache-v1";
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h

let started = false;
let unsubscribe: (() => void) | undefined;

export function startQueryPersistence(queryClient: QueryClient) {
  if (started || typeof window === "undefined") return;
  started = true;
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: KEY,
    throttleTime: 1000,
  });
  const [unsub] = persistQueryClient({
    queryClient,
    persister,
    maxAge: MAX_AGE,
    buster: "v1",
  });
  unsubscribe = unsub;
}

export function stopQueryPersistence() {
  if (!started) return;
  unsubscribe?.();
  unsubscribe = undefined;
  started = false;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
