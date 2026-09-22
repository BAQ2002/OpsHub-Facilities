import { createChamadoRequestAction } from "../actions";
import ActivityRequestForm from "@/app/componentes/ActivityRequestForm";
import { getChamadoRequestFormPageData } from "@/app/services/activity-request-form-service";
import { notFound } from "next/navigation";

type ChamadoRequestPageProps = {
  searchParams: Promise<{
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
  if (!Number.isInteger(serviceTypeId) || serviceTypeId <= 0) notFound();

  const formData = await getChamadoRequestFormPageData({ serviceTypeId });

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
