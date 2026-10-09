"use client";
import { useChamados } from "../_hooks/useChamados";

export function ChamadosSort() {
  const { filters, update } = useChamados();
  return <label className="flex items-center gap-6 text-sm text-slate-500">Ordenar por:
    <select className="min-w-48 border-b border-slate-300 bg-transparent px-2 py-2 outline-none"
      value={filters.sort ?? "recent"} onChange={() => update({ ...filters, sort: "recent" })}>
      <option value="recent">Últimos Chamados</option>
    </select>
  </label>;
}
