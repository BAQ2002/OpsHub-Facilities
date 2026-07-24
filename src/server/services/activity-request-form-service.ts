import "server-only";

import type { ActivityRequestField } from "@/src/domain/entities/activity-request-form";
import { getActivityRequestFormData as getRepositoryActivityRequestFormData } from "@/src/server/repositories/activity-request-form-repository";

export type ActivityRequestFormPageData = {
  title: string;
  subtitle: string;
  fields: ActivityRequestField[];
};

export async function getChamadoRequestFormPageData(params: {
  serviceCategory?: string;
  serviceType?: string;
}): Promise<ActivityRequestFormPageData> {
  const dynamicData = await getRepositoryActivityRequestFormData(params);
  const serviceTypeName = dynamicData.serviceTypeName ?? params.serviceType;
  const serviceCategoryName = dynamicData.serviceCategoryName ?? params.serviceCategory;

  return {
    title: serviceTypeName ? `Nova request: ${serviceTypeName}` : "Nova request: Chamado",
    subtitle: ["request_type Chamado", serviceCategoryName, serviceTypeName].filter(Boolean).join(" · "),
    fields: [
      {
        label: "Business",
        name: "business_id",
        type: "text",
        placeholder: "Informe a unidade de negócio",
        required: true,
      },
      ...(serviceCategoryName
        ? [{ label: "Service category", name: "service_category", type: "hidden" as const, required: false, placeholder: serviceCategoryName }]
        : []),
      {
        label: "Service type",
        name: "service_type",
        type: dynamicData.serviceTypeOptions.length > 0 ? "select" : "text",
        options: dynamicData.serviceTypeOptions,
        defaultValue: serviceTypeName,
        placeholder: "Informe o tipo de serviço",
        required: true,
      },
      {
        label: "Location",
        name: "location_id",
        type: "text",
        placeholder: "Informe o local vinculado ao location_id",
        required: true,
      },
      {
        label: "Agreed date",
        name: "agreed_date",
        type: "datetime-local",
        required: true,
      },
      {
        label: "Description",
        name: "description",
        type: "textarea",
        placeholder: "Descreva a necessidade",
        fullWidth: true,
        required: true,
      },
      ...dynamicData.fields,
      {
        label: "Request attachment",
        name: "request_attachment",
        type: "file",
        fullWidth: true,
        required: false,
      },
    ],
  };
}
