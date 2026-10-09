export function ModalDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function ModalDetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4">
      <ModalDetail label={label} value={value} />
    </div>
  );
}
