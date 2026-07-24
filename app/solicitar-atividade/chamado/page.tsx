import { createActivityRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";
import { getChamadoRequestFormPageData } from "@/src/server/services/activity-request-form-service";

type ChamadoRequestPageProps = {
  searchParams: Promise<{
    service_category?: string;
    service_type?: string;
  }>;
};

export default async function ChamadoRequestPage({ searchParams }: ChamadoRequestPageProps) {
  const params = await searchParams;
  const formData = await getChamadoRequestFormPageData({
    serviceCategory: params.service_category,
    serviceType: params.service_type,
  });

  return (
    <ActivityRequestForm
      title={formData.title}
      subtitle={formData.subtitle}
      sectionTitle="Dados da request"
      fields={formData.fields}
      action={createActivityRequestAction}
    />
  );
}
