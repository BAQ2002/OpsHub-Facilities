"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DateRangeFiltersProps = {
  startDate: string;
  endDate: string;
};

export default function DateRangeFilters({
  startDate,
  endDate,
}: DateRangeFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateDate(name: "startDate" | "endDate", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function selectToday() {
    const today = new Date();
    const formattedToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const params = new URLSearchParams(searchParams.toString());

    params.set("startDate", formattedToday);
    params.set("endDate", formattedToday);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <DateInput
        label="De"
        ariaLabel="Data inicial"
        name="startDate"
        value={startDate}
        onChange={updateDate}
      />
      <DateInput
        label="Até"
        ariaLabel="Data final"
        name="endDate"
        value={endDate}
        onChange={updateDate}
      />
      <button
        className="h-[30px] rounded-lg border border-slate-200 bg-white px-4 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
        type="button"
        onClick={selectToday}
      >
        Hoje
      </button>
    </>
  );
}

function DateInput({
  label,
  ariaLabel,
  name,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  name: "startDate" | "endDate";
  value: string;
  onChange: (name: "startDate" | "endDate", value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span>{label}</span>
      <input
        aria-label={ariaLabel}
        className="h-[30px] w-[124px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] [color-scheme:light]"
        value={value}
        name={name}
        form="activity-filters"
        type="date"
        onChange={(event) => onChange(name, event.currentTarget.value)}
      />
    </label>
  );
}
