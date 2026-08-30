"use client";

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

type DateRangeProps = DateRangeValue & {
  onChange: (range: DateRangeValue) => void;
  disabled?: boolean;
};

/** Seletor de intervalo de datas controlado e independente da fonte dos dados. */
export default function DateRange({ startDate, endDate, onChange, disabled = false }: DateRangeProps) {
  function updateDate(name: keyof DateRangeValue, value: string) {
    if (!value) return;
    if (name === "startDate" && value > endDate) {
      onChange({ startDate: value, endDate: value });
      return;
    }
    if (name === "endDate" && value < startDate) {
      onChange({ startDate: value, endDate: value });
      return;
    }
    onChange({ startDate, endDate, [name]: value });
  }

  function selectToday() {
    const today = formatLocalDate(new Date());
    onChange({ startDate: today, endDate: today });
  }

  function shiftDateRange(days: number) {
    onChange({ startDate: addDays(startDate, days), endDate: addDays(endDate, days) });
  }

  return (
    <>
      <button className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] disabled:opacity-50" type="button" aria-label="Dia anterior" disabled={disabled} onClick={() => shiftDateRange(-1)}>
        <ChevronLeftIcon />
      </button>
      <DateInput label="De" ariaLabel="Data inicial" name="startDate" value={startDate} disabled={disabled} onChange={updateDate} />
      <DateInput label="Até" ariaLabel="Data final" name="endDate" value={endDate} min={startDate} disabled={disabled} onChange={updateDate} />
      <button className="h-[30px] rounded-lg border border-slate-200 bg-white px-4 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] disabled:opacity-50" type="button" disabled={disabled} onClick={selectToday}>Hoje</button>
      <button className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] disabled:opacity-50" type="button" aria-label="Próximo dia" disabled={disabled} onClick={() => shiftDateRange(1)}>
        <ChevronRightIcon />
      </button>
    </>
  );
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function formatLocalDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function ChevronLeftIcon() {
  return <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16"><path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function ChevronRightIcon() {
  return <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function DateInput({ label, ariaLabel, name, value, min, disabled, onChange }: { label: string; ariaLabel: string; name: keyof DateRangeValue; value: string; min?: string; disabled: boolean; onChange: (name: keyof DateRangeValue, value: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span>{label}</span>
      <input aria-label={ariaLabel} className="h-[30px] w-[124px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] [color-scheme:light] disabled:opacity-50" value={value} min={min} name={name} type="date" disabled={disabled} onChange={(event) => onChange(name, event.currentTarget.value)} />
    </label>
  );
}
