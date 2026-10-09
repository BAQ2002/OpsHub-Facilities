import { DataUnavailable } from "@/app/componentes/DataUnavailable";
import type { ApiFailure } from "@/app/entities/api/api-result";

/** Loading and retry stay inside the dialog, leaving the board available. */
export function ResourceDialog({ label, error, pending, retry, onClose }: {
  label: string; error: ApiFailure | null; pending: boolean; retry: () => void; onClose: () => void;
}) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
    <section role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
      <button autoFocus type="button" onClick={onClose} className="float-right rounded border px-3 py-1" aria-label="Fechar">×</button>
      <h2 className="mb-4 font-semibold">{label}</h2>
      {error ? <DataUnavailable error={error} retry={retry} pending={pending} /> : <p role="status">Carregando...</p>}
    </section>
  </div>;
}
