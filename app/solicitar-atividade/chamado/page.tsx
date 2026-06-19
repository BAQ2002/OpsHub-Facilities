import { createActivityRequestAction } from "../actions";
import ActivityRequestForm from "../_components/ActivityRequestForm";

const chamadoFields = [
  {
    label: "Unidade de Negócio",
    name: "unidade-negocio",
    type: "select" as const,
    options: ["TECON", "CLS"],
  },
  {
    label: "Categoria",
    name: "categoria",
    type: "select" as const,
    options: ["Administrativo", "Predial", "Suporte", "Outro"],
  },
  {
    label: "Tipo de Serviço",
    name: "tipo-servico",
    type: "select" as const,
    options: ["Manutenção", "Limpeza", "Copa e café", "Outro"],
  },
  {
    label: "Local",
    name: "local",
    type: "text" as const,
    placeholder: "Informe o local",
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

export default function ChamadoRequestPage() {
  return (
    <ActivityRequestForm
      title="Solicitar Atividade de Chamado"
      subtitle="Atividade no prédio administrativo"
      sectionTitle="Dados do chamado"
      fields={chamadoFields}
      action={createActivityRequestAction}
    />
  );
}
