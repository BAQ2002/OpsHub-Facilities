import { createActivityRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";

const chamadoFields = [
  {
    label: "Business",
    name: "business_id",
    type: "select" as const,
    options: ["TECON", "CLS"],
  },
  {
    label: "Service category",
    name: "service_category_id",
    type: "select" as const,
    options: ["Administrativo", "Predial", "Suporte", "Outro"],
  },
  {
    label: "Service type",
    name: "service_type_id",
    type: "select" as const,
    options: ["Manutenção", "Limpeza", "Copa e café", "Outro"],
  },
  {
    label: "Location",
    name: "location_id",
    type: "text" as const,
    placeholder: "Informe o local vinculado ao location_id",
  },
  {
    label: "Agreed date",
    name: "agreed_date",
    type: "datetime-local" as const,
  },
  {
    label: "Description",
    name: "description",
    type: "textarea" as const,
    placeholder: "Descreva a necessidade",
    fullWidth: true,
  },
  {
    label: "Request attachment",
    name: "request_attachment",
    type: "file" as const,
    fullWidth: true,
  },
];

export default function ChamadoRequestPage() {
  return (
    <ActivityRequestForm
      title="Nova request: Chamado"
      subtitle="request_type Chamado"
      sectionTitle="Dados da request"
      fields={chamadoFields}
      action={createActivityRequestAction}
    />
  );
}
