import { createChamadoRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";
import { getChamadoRequestFormPageData } from "@/src/server/services/activity-request-form-service";
import { notFound } from "next/navigation";

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

  if (!formData.serviceTypeId) notFound();

  const createRequest = createChamadoRequestAction.bind(null, formData.serviceTypeId);

  return (
    <ActivityRequestForm
      title={formData.title}
      subtitle={formData.subtitle}
      sectionTitle="Dados da request"
      fields={formData.fields}
      locationHierarchy={formData.locationHierarchy}
      action={createRequest}
    />
  );
}
