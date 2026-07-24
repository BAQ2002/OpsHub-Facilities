import { createActivityRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";

const patioFields = [
  {
    label: "Business",
    name: "business_id",
    type: "select" as const,
    options: ["Unidade 1", "Unidade 2", "Unidade 3"].map((value) => ({ label: value, value })),
  },
  {
    label: "Location",
    name: "location_id",
    type: "text" as const,
    placeholder: "Informe o local vinculado ao location_id",
  },
  {
    label: "Service field: Fila",
    name: "service_field_fila",
    type: "text" as const,
    placeholder: "Informe a fila para service_field_value",
  },
  {
    label: "Service field: Lote",
    name: "service_field_lote",
    type: "text" as const,
    placeholder: "Informe o lote para service_field_value",
  },
  {
    label: "Service type",
    name: "service_type_id",
    type: "select" as const,
    options: ["Manutenção", "Limpeza", "Apoio operacional", "Outro"].map((value) => ({ label: value, value })),
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

export default function PatioRequestPage() {
  return (
    <ActivityRequestForm
      title="Nova request: Atividade de Pátio"
      subtitle="request_type Atividade de Pátio"
      sectionTitle="Dados da request"
      fields={patioFields}
      action={createActivityRequestAction}
    />
  );
}
