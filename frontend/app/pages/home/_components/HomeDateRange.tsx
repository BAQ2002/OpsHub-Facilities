"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DateRange, { type DateRangeValue } from "@/app/componentes/DateRange";
import { applyHomeDateRange } from "../actions";

export default function HomeDateRange({ startDate, endDate }: DateRangeValue & { statuses: string[]; selectedBusiness: string }) {
  const [range, setRange] = useState<DateRangeValue>({ startDate, endDate });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState("");

  function applyRange(nextRange: DateRangeValue) {
    setRange(nextRange);
    startTransition(async () => {
      setError("");
      try {
        const result = await applyHomeDateRange(nextRange);
        if (result.ok) router.refresh();
        else setError(result.error.message);
      } catch { setError("Não foi possível atualizar o período. Tente novamente."); }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRange {...range} disabled={isPending} onChange={applyRange} />
      {error && <p role="alert" className="w-full text-xs text-red-700">{error}</p>}
    </div>
  );
}
