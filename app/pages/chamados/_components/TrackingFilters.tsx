"use client";

import { useEffect, useRef } from "react";

export function MultiSelectFilter({ label, placeholder, options, value, onChange }: {
  label: string; placeholder: string; options: { id: number; name: string }[];
  value: number[]; onChange: (ids: number[]) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) menu.current.open = false;
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return (
    <details ref={menu} className="relative w-full sm:w-[190px]" onKeyDown={(event) => {
      if (event.key === "Escape" && menu.current) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }}>
      <summary aria-label={`${label}: ${value.length ? `${value.length} selecionados` : placeholder}`} className="flex h-[30px] cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-sm focus-visible:outline-teal-500">
        <span className="truncate">{value.length ? `${label} (${value.length})` : placeholder}</span><span aria-hidden="true">▾</span>
      </summary>
      <fieldset className="absolute left-0 top-full z-30 mt-1 max-h-64 w-full min-w-60 overflow-auto rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <legend className="sr-only">{label}</legend>
        <button type="button" className="mb-2 text-xs font-semibold text-teal-700" onClick={() => onChange([])}>{placeholder}</button>
        {options.map((option) => <label key={option.id} className="flex items-center gap-2 py-1 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={value.includes(option.id)} onChange={() => onChange(value.includes(option.id) ? value.filter((id) => id !== option.id) : [...value, option.id])} />{option.name}</label>)}
        {!options.length && <p className="text-xs text-slate-500">Nenhuma opção disponível.</p>}
      </fieldset>
    </details>
  );
}

export function SelectField({ label, name, value, placeholder, options, onChange }: { label: string; name: string; value?: number; placeholder: string; options: { id: number; name: string }[]; onChange?: (value?: number) => void }) {
  return (
    <label className="block w-full min-w-0 sm:w-[190px]">
      <span className="sr-only">{label}</span>
      <select
        className="h-[30px] w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        name={name}
        value={value?.toString() ?? ""}
        onChange={(event) => onChange?.(event.target.value ? Number(event.target.value) : undefined)}
        aria-label={label}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>
  );
}
