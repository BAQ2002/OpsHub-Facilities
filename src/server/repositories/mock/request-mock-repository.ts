import "server-only";

import type { RequestEntity } from "@/src/domain/entities/request";

const requests: RequestEntity[] = [
  {
    id: 212,
    title: "Teste10",
    createdAt: "29/04/2026 10:38",
    status: "Aberto" as const,
  },
  {
    id: 213,
    title: "Reparos em móveis",
    createdAt: "29/04/2026 11:35",
    status: "Aberto" as const,
  },
  {
    id: 214,
    title: "Pintura de segurança/operacional/predial/metálica",
    createdAt: "29/04/2026 11:38",
    status: "Aberto" as const,
  },
  {
    id: 215,
    title: "Reparos em móveis",
    createdAt: "29/04/2026 11:39",
    status: "Aberto" as const,
  },
  {
    id: 218,
    title: "Outros",
    createdAt: "29/04/2026 13:25",
    status: "Aberto" as const,
    hasUnreadMessage: true,
  },
  {
    id: 219,
    title: "Pintura de segurança/operacional/predial/metálica",
    createdAt: "29/04/2026 13:28",
    status: "Aberto" as const,
  },
  {
    id: 17,
    title: "Interruptor ou Tomada com defeito/quebrado",
    createdAt: "12/03/2026 10:28",
    status: "Fechado" as const,
  },
  {
    id: 217,
    title: "Outros",
    createdAt: "29/04/2026 13:15",
    status: "Fechado" as const,
  },
];


export async function findRequestsByCurrentUser(): Promise<RequestEntity[]> {
  return requests;
}
