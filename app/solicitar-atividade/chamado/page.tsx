import { createChamadoRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";
import { getChamadoRequestFormPageData } from "@/src/server/services/activity-request-form-service";
import { notFound } from "next/navigation";

type ChamadoRequestPageProps = {
  searchParams: Promise<{
    service_category?: string;
    service_type?: string;
    service_type_id?: string;
  }>;
};

/**
 * Acionada pelo Next.js durante a renderização da rota correspondente.
 *
 * Monta os dados e a interface da página de chamado request.
 * Durante o fluxo, aciona {@link getChamadoRequestFormPageData}, {@link isInteger}, {@link notFound}, {@link bind}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export default async function ChamadoRequestPage({ searchParams }: ChamadoRequestPageProps) {
  const params = await searchParams;
  const serviceTypeId = Number(params.service_type_id);
  const formData = await getChamadoRequestFormPageData({
    serviceCategory: params.service_category,
    serviceType: params.service_type,
    serviceTypeId: Number.isInteger(serviceTypeId) && serviceTypeId > 0 ? serviceTypeId : undefined,
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
