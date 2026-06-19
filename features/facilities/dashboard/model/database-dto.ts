export type SectorDTO = {
  id: number;
  name: string;
};

export type RequestTypeDTO = {
  id: number;
  name: string;
};

export type StatusDTO = {
  id: number;
  description: string;
};

export type BusinessDTO = {
  id: number;
  name: string;
};

export type ServiceCategoryDTO = {
  id: number;
  name: string;
};

export type RegionDTO = {
  id: number;
  idBusiness: number;
  name: string;
  description: string | null;
};

export type LocationDTO = {
  id: number;
  idRegion: number;
  name: string;
  description: string | null;
  locationX: number | null;
  locationY: number | null;
};

export type ServiceTypeDTO = {
  id: number;
  idServiceCategory: number;
  name: string;
  description: string | null;
};

export type RequestDTO = {
  id: number;
  idSectorRequester: number;
  idSectorResponsible: number;
  idLocation: number;
  idRequestType: number;
  idServiceType: number;
  idStatus: number;
  ocurrenceDatetime: string | null;
  plannedDatetime: string | null;
  imagesEndpoint: string | null;
  description: string | null;
};

export type RequestAproveDTO = {
  id: number;
  idRequest: number;
  idSectorResponsible: number;
  idBatch: number;
  idServiceType: number;
  plannedDatetime: string | null;
  description: string | null;
};

export type FacilitiesDashboardDataDTO = {
  businesses: BusinessDTO[];
  locations: LocationDTO[];
  regions: RegionDTO[];
  requests: RequestDTO[];
  requestTypes: RequestTypeDTO[];
  serviceCategories: ServiceCategoryDTO[];
  serviceTypes: ServiceTypeDTO[];
  statuses: StatusDTO[];
};
