"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { changeRequestStatus } from "../actions";

type Status = { id: number; title: string };

function statusColor(title: string) {
  switch (title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()) {
    case "programada": return "bg-blue-500";
    case "em andamento": return "bg-amber-400";
    case "concluida": return "bg-green-500";
    case "cancelada": return "bg-red-500";
    default: return "bg-gray-400";
  }
}

export function RequestStatusSelect({ requestId, statusId, statuses, onSaved }: {
  requestId: number; statusId: number; statuses: Status[]; onSaved: () => void;
}) {
  const id = useId();
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const saving = useRef(false);
  const [selectedId, setSelectedId] = useState(statusId);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const selected = statuses.find((status) => status.id === selectedId);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) {
        if (menu.current) menu.current.open = false;
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function close() {
    if (menu.current) menu.current.open = false;
  }

  function select(nextId: number) {
    close();
    trigger.current?.focus();
    if (saving.current || nextId === selectedId) return;
    saving.current = true;
    setMessage("");
    setFailed(false);
    startTransition(async () => {
      try {
        const result = await changeRequestStatus(requestId, nextId);
        setMessage(result.message);
        setFailed(result.status !== "success");
        if (result.status === "success") {
          setSelectedId(nextId);
          onSaved();
        }
      } catch {
        setFailed(true);
        setMessage("Não foi possível alterar o status. Tente novamente.");
      } finally {
        saving.current = false;
      }
    });
  }

  return (
    <div className="mr-auto w-full sm:w-72" data-ui="request-status-select" aria-busy={pending}>
      <p id={`${id}-label`} className="mb-1.5 text-xs font-semibold uppercase text-slate-500">Status da solicitação</p>
      <details ref={menu} className="group relative" onKeyDown={(event) => {
        if (event.key === "Escape" && menu.current?.open) {
          event.stopPropagation();
          close();
          trigger.current?.focus();
        }
      }}>
        <summary ref={trigger} aria-labelledby={`${id}-label ${id}-value`} aria-disabled={pending}
          onClick={(event) => { if (pending) event.preventDefault(); }}
          className={`flex list-none items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group-open:border-blue-500 group-open:ring-2 group-open:ring-blue-100 [&::-webkit-details-marker]:hidden ${pending ? "cursor-wait opacity-60" : "cursor-pointer"}`}>
          <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full ${statusColor(selected?.title ?? "")}`} />
          <span id={`${id}-value`}>{selected?.title ?? "Não informado"}</span>
          <svg aria-hidden="true" className="ml-auto h-4 w-4 text-slate-500" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </summary>
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="group" aria-labelledby={`${id}-label`}>
          {statuses.map((status) => (
            <button key={status.id} type="button" disabled={pending} aria-pressed={status.id === selectedId}
              onClick={() => select(status.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 ${status.id === selectedId ? "bg-blue-100 font-semibold text-blue-600" : "text-slate-900"}`}>
              <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full ${statusColor(status.title)}`} />
              <span>{status.title}</span><span className="ml-auto text-slate-400" aria-hidden="true">{status.id}</span>
            </button>
          ))}
        </div>
      </details>
      <p role={failed ? "alert" : "status"} className={`mt-1 text-xs ${failed ? "text-red-600" : "text-slate-500"}`}>
        {pending ? "Salvando status..." : message}
      </p>
    </div>
  );
}
