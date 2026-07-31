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
    { id: 116, serviceTypeName: "Higienização dos bebedouros", statusId: 3 },
    { id: 566, serviceTypeName: "Equipamento com avaria evidente", statusId: 3 },
  ],
};

export async function findRequestBoardData(): Promise<RequestBoardData> {
  return requestBoardData;
}
