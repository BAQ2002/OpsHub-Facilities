import "server-only";

import type { RequestBoardData } from "@/src/domain/entities/request-board";

const requestBoardData: RequestBoardData = {
  statuses: [
    { id: 1, description: "Em aberto" },
    { id: 2, description: "Programada" },
    { id: 3, description: "Em andamento" },
    { id: 4, description: "Concluída" },
    { id: 5, description: "Cancelada" },
  ],
  requests: [
    {
      id: 116,
      requesterName: "Mariana Costa",
      locationName: "Bloco administrativo",
      serviceTypeName: "Manutenção elétrica",
      statusId: 3,
      details: [
        { id: "business", label: "Unidade de Negócio", value: "Operações" },
        { id: "region", label: "Região", value: "Sudeste" },
        { id: "location", label: "Localização", value: "Bloco administrativo" },
        { id: "description", label: "Descrição", value: "Substituição de luminária no corredor principal." },
        { id: "priority", label: "Prioridade", value: "Alta" },
      ],
      media: [],
      visits: [
        {
          id: 1,
          startDate: "10/08/2026",
          endDate: "10/08/2026",
          startDatetime: "2026-08-10T09:00",
          endDatetime: "2026-08-10T11:30",
          description: "Inspeção da instalação elétrica e substituição da luminária danificada.",
          executors: [{ id: 1, name: "Carlos Souza" }],
          photos: [{ id: 1, fileName: "inspecao-eletrica.jpg" }],
        },
        {
          id: 2,
          startDate: "12/08/2026",
          endDate: "dd/mm/yyyy",
          startDatetime: "2026-08-12T14:00",
          endDatetime: "2026-08-12T15:00",
          description: "Retorno para validação do funcionamento e encerramento do atendimento.",
          executors: [{ id: 2, name: "Ana Lima" }],
          photos: [{ id: 2, fileName: "validacao.jpg" }],
        },
      ],
    },
    {
      id: 566,
      requesterName: "Rafael Almeida",
      locationName: "Pátio operacional",
      serviceTypeName: "Inspeção de infraestrutura",
      statusId: 3,
      details: [
        { id: "business", label: "Unidade de Negócio", value: "Logística" },
        { id: "region", label: "Região", value: "Sul" },
        { id: "location", label: "Localização", value: "Pátio operacional" },
        { id: "description", label: "Descrição", value: "Avaliar avaria encontrada no piso." },
      ],
      media: [
        {
          id: 1,
          fieldLabel: "Foto da ocorrência",
          fileName: "avaria-piso.svg",
          mimeType: "image/svg+xml",
          fileSize: 536,
          url: "/api/request-media/1",
        },
      ],
      visits: [],
    },
  ],
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  return requestBoardData;
}
