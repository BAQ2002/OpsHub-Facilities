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
      ...(serviceCategoryName
        ? [{ label: "Service category", name: "service_category", type: "hidden" as const, required: false, placeholder: serviceCategoryName }]
        : []),
      ...(serviceTypeName
        ? [{ label: "Service type", name: "service_type", type: "hidden" as const, required: false, placeholder: serviceTypeName }]
        : []),
      {
        label: "Location",
        name: "location_id",
        type: "text",
        placeholder: "Informe o local vinculado ao location_id",
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
    ],
  };
}
