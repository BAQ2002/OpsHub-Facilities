/** Paleta da referência visual. IDs conforme os scripts de carga de SERVICE_CATEGORY.
 * Uso e tabela de cores: docs/category-colors.md.
 */
export type ServiceCategoryStyle = Readonly<{
  color: string;
  backgroundColor: string;
}>;

export const defaultServiceCategoryStyle: ServiceCategoryStyle = {
  color: "#64748B",
  backgroundColor: "#F1F5F9",
};

export const serviceCategoryStylesById: Readonly<Record<number, ServiceCategoryStyle>> = {
  1: { color: "#B97842", backgroundColor: "#F6E7D9" }, // Artífice
  2: { color: "#1CA2C1", backgroundColor: "#E6F7FB" }, // Climatização e refrigeração
  3: { color: "#D94E2B", backgroundColor: "#FBE7E2" }, // Copa
  4: { color: "#FFD21A", backgroundColor: "#FFF8D9" }, // Instalações elétricas
  5: { color: "#2864C7", backgroundColor: "#E6F0FB" }, // Instalações hidráulicas
  6: { color: "#31A354", backgroundColor: "#E7F6EA" }, // Jardinagem
  7: { color: "#78899B", backgroundColor: "#E8ECF1" }, // Manutenção civil
  9: { color: "#E63286", backgroundColor: "#FDE7F1" }, // Pintura
  10: { color: "#6540A4", backgroundColor: "#EFE7F8" }, // PMOC
};

export function getServiceCategoryStyle(categoryId: number | null | undefined): ServiceCategoryStyle {
  return categoryId == null
    ? defaultServiceCategoryStyle
    : serviceCategoryStylesById[categoryId] ?? defaultServiceCategoryStyle;
}
