import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// Returns false on the server and during the first client render, then true once
// hydrated. Use to gate client-only (e.g. localStorage-derived) UI so the initial
// client render matches the server HTML — avoiding hydration mismatches without
// calling setState inside an effect.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
