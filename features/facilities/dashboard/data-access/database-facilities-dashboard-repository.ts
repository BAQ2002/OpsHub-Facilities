import type {
  ActivityRecord,
  CategoryColorMap,
  FacilitiesDashboardData,
  ServiceCategorySummary,
} from "../model/domain";
import type {
  FacilitiesDashboardDataDTO,
  LocationDTO,
  RegionDTO,
  RequestDTO,
  RequestTypeDTO,
  ServiceCategoryDTO,
  StatusDTO,
} from "../model/database-dto";
import type { FacilitiesDashboardRepository } from "./facilities-dashboard-repository";

export type FacilitiesDashboardDataLoader = () => Promise<FacilitiesDashboardDataDTO>;

const categoryStyles = [
  { accent: "text-cyan-600", iconBg: "bg-cyan-50", color: "#0891b2" },
  { accent: "text-violet-500", iconBg: "bg-violet-50", color: "#8b5cf6" },
  { accent: "text-red-500", iconBg: "bg-red-50", color: "#ef4444" },
  { accent: "text-yellow-500", iconBg: "bg-yellow-50", color: "#eab308" },
  { accent: "text-blue-500", iconBg: "bg-blue-50", color: "#3b82f6" },
  { accent: "text-green-500", iconBg: "bg-green-50", color: "#22c55e" },
  { accent: "text-orange-500", iconBg: "bg-orange-50", color: "#f97316" },
  { accent: "text-teal-500", iconBg: "bg-teal-50", color: "#14b8a6" },
  { accent: "text-pink-500", iconBg: "bg-pink-50", color: "#ec4899" },
] as const;

export class DatabaseFacilitiesDashboardRepository
  implements FacilitiesDashboardRepository
{
  constructor(private readonly loadDashboardData: FacilitiesDashboardDataLoader) {}

  async getDashboardData(): Promise<FacilitiesDashboardData> {
    const data = await this.loadDashboardData();
    const categoryColorMap = buildCategoryColorMap(data.serviceCategories);
    const activityRecords = buildActivityRecords(data);

    return {
      activityRecords,
      businessUnitFilters: data.businesses.map((business) => business.name),
      categoryColorMap,
      equipmentCards: buildServiceCategorySummaries(data),
      mapImage: {
        src: "/facilities-map.png",
        width: 1544,
        height: 908,
        alt: "Mapa AIS com posições atuais das atividades de facilities",
      },
      slaSamplesInMinutes: buildSlaSamplesInMinutes(data.requests),
    };
  }
}

function buildActivityRecords(data: FacilitiesDashboardDataDTO): ActivityRecord[] {
  const locationsById = indexById(data.locations);
  const regionsById = indexById(data.regions);
  const requestTypesById = indexById(data.requestTypes);
  const serviceTypesById = indexById(data.serviceTypes);
  const serviceCategoriesById = indexById(data.serviceCategories);

  return data.requests.map((request) => {
    const location = locationsById.get(request.idLocation);
    const region = location ? regionsById.get(location.idRegion) : undefined;
    const business = region
      ? data.businesses.find((item) => item.id === region.idBusiness)
      : undefined;
    const requestType = requestTypesById.get(request.idRequestType);
    const serviceType = serviceTypesById.get(request.idServiceType);
    const serviceCategory = serviceType
      ? serviceCategoriesById.get(serviceType.idServiceCategory)
      : undefined;

    return {
      id: formatActivityId(request.id),
      activityType: formatActivityType(requestType),
      businessUnit: business?.name ?? "Não informado",
      category: serviceCategory?.name ?? "Sem categoria",
      serviceType: serviceType?.name ?? "Sem tipo de serviço",
      location: formatLocation(location, region),
      plannedAt: formatPlannedAt(request.plannedDatetime),
      description: request.description ?? "Sem descrição",
      mapPosition: {
        x: location?.locationX ?? 50,
        y: location?.locationY ?? 50,
      },
    };
  });
}

function buildServiceCategorySummaries(
  data: FacilitiesDashboardDataDTO,
): ServiceCategorySummary[] {
  const statusesById = indexById(data.statuses);

  return data.serviceCategories.map((category, index) => {
    const style = categoryStyles[index % categoryStyles.length];
    const serviceTypeIds = data.serviceTypes
      .filter((serviceType) => serviceType.idServiceCategory === category.id)
      .map((serviceType) => serviceType.id);
    const requests = data.requests.filter((request) =>
      serviceTypeIds.includes(request.idServiceType),
    );

    return {
      title: category.name,
      accent: style.accent,
      iconBg: style.iconBg,
      Planned: countRequestsByStatus(requests, statusesById, "Programada"),
      InProgress: countRequestsByStatus(requests, statusesById, "Em andamento"),
      total: requests.length,
    };
  });
}

function buildCategoryColorMap(
  categories: ServiceCategoryDTO[],
): CategoryColorMap {
  return categories.reduce<CategoryColorMap>((acc, category, index) => {
    acc[category.name] = categoryStyles[index % categoryStyles.length].color;

    return acc;
  }, {});
}

function buildSlaSamplesInMinutes(requests: RequestDTO[]): number[] {
  return requests
    .map((request) => {
      if (!request.ocurrenceDatetime || !request.plannedDatetime) {
        return null;
      }

      const ocurrence = new Date(request.ocurrenceDatetime).getTime();
      const planned = new Date(request.plannedDatetime).getTime();

      if (Number.isNaN(ocurrence) || Number.isNaN(planned)) {
        return null;
      }

      return Math.max(0, Math.round((planned - ocurrence) / 60000));
    })
    .filter((minutes): minutes is number => minutes !== null);
}

function countRequestsByStatus(
  requests: RequestDTO[],
  statusesById: Map<number, StatusDTO>,
  statusDescription: string,
): number {
  return requests.filter(
    (request) => statusesById.get(request.idStatus)?.description === statusDescription,
  ).length;
}

function formatActivityId(id: number): string {
  return `ATV-${id.toString().padStart(3, "0")}`;
}

function formatActivityType(requestType?: RequestTypeDTO): string {
  if (!requestType) {
    return "Chamado";
  }

  return requestType.name === "Atividade de Pátio"
    ? "Atividade no Pátio"
    : requestType.name;
}

function formatLocation(location?: LocationDTO, region?: RegionDTO): string {
  if (!location) {
    return "Local não informado";
  }

  return region ? `${region.name}: ${location.name}` : location.name;
}

function formatPlannedAt(plannedDatetime: string | null): string {
  if (!plannedDatetime) {
    return "Não planejada";
  }

  return plannedDatetime.replace("T", " ").slice(0, 16);
}

function indexById<T extends { id: number }>(items: T[]): Map<number, T> {
  return new Map(items.map((item) => [item.id, item]));
}
