"use client";

import { useEffect, useRef, useTransition, type ComponentProps } from "react";
import { useRouter } from "next/navigation";

export default function AutomaticSearchForm({ children, action, ...props }: Omit<ComponentProps<"form">, "action"> & { action: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastQuery = useRef<string | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(form: HTMLFormElement) {
    clearTimeout(timer.current);
    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of new FormData(form)) {
      if (typeof value !== "string") continue;
      if (value.trim()) params.set(name, value.trim());
      else params.delete(name);
    }
    const query = params.toString();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    startTransition(() => router.replace(query ? `${action}?${query}` : action, { scroll: false }));
  }

  return <form {...props} action={action} aria-busy={isPending}
    onSubmit={(event) => { event.preventDefault(); apply(event.currentTarget); }}
    onBlur={(event) => { if (event.target instanceof HTMLInputElement) apply(event.currentTarget); }}
    onChange={(event) => {
      clearTimeout(timer.current);
      const form = event.currentTarget;
      if (event.target instanceof HTMLInputElement && event.target.value) timer.current = setTimeout(() => apply(form), 400);
      else apply(form);
    }}>
    {children}
    <span role="status" className={isPending ? "text-xs text-slate-500 md:col-span-full" : "sr-only"}>{isPending ? "Atualizando..." : ""}</span>
  </form>;
}
