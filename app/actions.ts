"use server";

import { cookies } from "next/headers";
import { getHomePageData } from "@/src/server/services/home-service";
import { validateDateRange, type DateRange } from "@/src/server/validation/date-range";

export async function applyHomeDateRange(range: DateRange, statuses: string[], selectedBusiness: string) {
  const validRange = validateDateRange(range);
  await getHomePageData({ ...validRange, statuses }, selectedBusiness);
  const cookieStore = await cookies();
  cookieStore.set("facilities-start-date", validRange.startDate, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("facilities-end-date", validRange.endDate, { httpOnly: true, sameSite: "lax", path: "/" });
}
