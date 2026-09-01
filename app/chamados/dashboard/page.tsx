import { getActivityTrackingPageData } from "@/src/server/services/activity-tracking-service";
import { ActivityTrackingDashboard } from "./_components/ActivityTrackingDashboard";

export const dynamic = "force-dynamic";

export default async function ActivityTrackingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const initialFilters = { startDate: `${today.slice(0, 4)}-01-01`, endDate: today };
  const initialData = await getActivityTrackingPageData(initialFilters);
  return <ActivityTrackingDashboard initialData={initialData} initialFilters={initialFilters} />;
}
