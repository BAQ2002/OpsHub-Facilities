import "server-only";

import type { ActivityRequestField } from "@/src/domain/entities/activity-request-form";
import type { ActivityRequestFormData, ActivityRequestFormFilters } from "@/src/server/repositories/activity-request-form-repository";

const serviceTypesByCategory: Record<string, string[]> = {
  "ARTÍFICE": [
    "Fixação de Placas/Quadros",
    "Outros",
    "Regulagem de porta",
    "Reparos em móveis",
  ],
};

const fieldsByServiceType: Record<string, ActivityRequestField[]> = {
  "Fixação de Placas/Quadros": [
    { label: "Referência", name: "service_field_1", type: "text", required: true },
  ],
  "Regulagem de porta": [
    { label: "Anexo da ocorrência", name: "service_field_3", type: "text", required: true },
    {
      label: "Problema identificado",
      name: "service_field_4",
      type: "multi-select",
      options: ["Não fecha", "Desalinhada", "outro", "Não abre bem"].map((value) => ({ label: value, value })),
      required: true,
    },
    {
      label: "Tipo da porta",
      name: "service_field_5",
      type: "select",
      options: ["Madeira", "Corta-fogo", "Vidro", "Metálica"].map((value) => ({ label: value, value })),
      required: true,
    },
  ],
  "Reparos em móveis": [
    { label: "Anexo da ocorrência", name: "service_field_6", type: "text", required: true },
  ],
  Outros: [{ label: "Foto da necessidade", name: "service_field_2", type: "text", required: true }],
};

export async function getActivityRequestFormData({
  serviceCategory,
  serviceType,
}: ActivityRequestFormFilters): Promise<ActivityRequestFormData> {
  const serviceTypeNames = serviceCategory ? serviceTypesByCategory[serviceCategory] ?? [] : [];
  const effectiveServiceType = serviceType ?? serviceTypeNames[0];

  return {
    serviceCategoryName: serviceCategory,
    serviceTypeName: effectiveServiceType,
    serviceTypeOptions: serviceTypeNames.map((value) => ({ label: value, value })),
    fields: effectiveServiceType ? fieldsByServiceType[effectiveServiceType] ?? [] : [],
  };
}
