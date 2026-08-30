"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DateRange, { type DateRangeValue } from "@/shared/DateRange";
import { applyHomeDateRange } from "../../actions";

export default function HomeDateRange({ startDate, endDate, statuses, selectedBusiness }: DateRangeValue & { statuses: string[]; selectedBusiness: string }) {
  const [range, setRange] = useState<DateRangeValue>({ startDate, endDate });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function applyRange(nextRange: DateRangeValue) {
    setRange(nextRange);
    startTransition(async () => {
      await applyHomeDateRange(nextRange, statuses, selectedBusiness);
      router.refresh();
    });
  }

  return <DateRange {...range} disabled={isPending} onChange={applyRange} />;
}
