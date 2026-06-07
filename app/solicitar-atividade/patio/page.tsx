import ActivityRequestForm from "../_components/ActivityRequestForm";

const patioFields = [
  {
    label: "Unidade de Negócio",
    name: "unidade-negocio",
    type: "select" as const,
    options: ["TECON", "CLS"],
  },
  {
    label: "Local",
    name: "local",
    type: "text" as const,
    placeholder: "Informe o local",
  },
  {
    label: "Fila",
    name: "fila",
    type: "text" as const,
    placeholder: "Informe a fila",
  },
  {
    label: "Lote",
    name: "lote",
    type: "text" as const,
    placeholder: "Informe o lote",
  },
  {
    label: "Tipo de Serviço",
    name: "tipo-servico",
    type: "select" as const,
    options: ["Manutenção", "Limpeza", "Apoio operacional", "Outro"],
  },
  {
    label: "Data e hora planejada",
    name: "data-hora-planejada",
    type: "datetime-local" as const,
  },
  {
    label: "Descrição",
    name: "descricao",
    type: "textarea" as const,
    placeholder: "Descreva a necessidade",
    fullWidth: true,
  },
  {
    label: "Registro fotográfico da necessidade",
    name: "registro-fotografico",
    type: "file" as const,
    fullWidth: true,
  },
];

export default function PatioRequestPage() {
  return (
    <ActivityRequestForm
      title="Solicitar Atividade no Pátio"
      subtitle="Atividade no pátio operacional"
      sectionTitle="Dados da atividade no pátio"
      fields={patioFields}
    />
  );
}
