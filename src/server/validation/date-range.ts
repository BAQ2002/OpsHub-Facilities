export type DateRange = { startDate: string; endDate: string };

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateDateRange(range: DateRange): DateRange {
  if (!isValidDate(range.startDate) || !isValidDate(range.endDate)) {
    throw new Error("Informe um intervalo de datas válido.");
  }
  if (range.startDate > range.endDate) {
    throw new Error("A data inicial não pode ser posterior à data final.");
  }
  return range;
}

function isValidDate(value: string) {
  if (!isoDatePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
