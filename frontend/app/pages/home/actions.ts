"use server";

import { apiResult } from "@/app/entities/api/api-result";
import { cookies } from "next/headers";
import { validateDateRange, type DateRange } from "@/app/validation/date-range";

export async function applyHomeDateRange(range: DateRange) {
  return apiResult(async () => {
  const validRange = validateDateRange(range);
  const cookieStore = await cookies();
  cookieStore.set("facilities-start-date", validRange.startDate, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("facilities-end-date", validRange.endDate, { httpOnly: true, sameSite: "lax", path: "/" });
  });
}
