import type { RegionEntity } from "./region";
import type { DecimalString } from "./database-types";

/** Entidade OHFC_LOCATION. Fonte: database/SqlScripts/CreateTables/LocationsTables/CREATE_LOCATION.sql */
export type LocationEntity = {
  id: number;
  idRegion: RegionEntity["id"] | null;
  name: string | null;
  locationX: DecimalString | null;
  locationY: DecimalString | null;
};
