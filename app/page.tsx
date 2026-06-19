import { getFacilitiesDashboard } from "@/features/facilities/dashboard/business-logic/get-facilities-dashboard";
import { FacilitiesDashboard } from "@/features/facilities/dashboard/components/FacilitiesDashboard";

export default async function Home() {
  const dashboard = await getFacilitiesDashboard();

  return <FacilitiesDashboard dashboard={dashboard} />;
}
