"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { connectionFailure, type ApiFailure, type ApiResult } from "@/app/entities/api/api-result";

/** Ignores responses after unmount or superseded refreshes. Errors can be retried. */
export function useAsyncResource<T>(load: () => Promise<ApiResult<T>>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [pending, setPending] = useState(enabled);
  const revision = useRef(0);
  const execute = useCallback(async (request: number) => {
    try {
      const result = await load();
      if (request !== revision.current) return;
      if (result.ok) { setData(result.data); setError(null); }
      else setError(result.error);
    } catch {
      if (request === revision.current) setError(connectionFailure);
    } finally {
      if (request === revision.current) setPending(false);
    }
  }, [load]);

  const refresh = useCallback(() => {
    setPending(true);
    setError(null);
    return execute(++revision.current);
  }, [execute]);

  const invalidate = useCallback(() => { revision.current++; }, []);

  useEffect(() => {
    if (enabled) void execute(++revision.current);
    return invalidate;
  }, [enabled, execute, invalidate]);

  return { data, error, pending: pending || (enabled && !data && !error), refresh };
}
