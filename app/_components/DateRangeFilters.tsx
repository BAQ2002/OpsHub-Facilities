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
        defaultValue={value}
        name={name}
        form="activity-filters"
        type="date"
        onChange={(event) => onChange(name, event.currentTarget.value)}
      />
    </label>
  );
}
