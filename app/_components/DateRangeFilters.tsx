"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DateRangeFiltersProps = {
  startDate: string;
  endDate: string;
};

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente DateRangeFilters com os dados recebidos.
 * Durante o fluxo, aciona `usePathname`, `useRouter`, `useSearchParams`, `toString` e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export default function DateRangeFilters({
  startDate,
  endDate,
}: DateRangeFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Executa a operação de update date e preserva as validações do domínio.
   * Durante o fluxo, aciona `toString`, `set`, `replace`.
   *
   * @param name Dados necessários para executar esta função.
   * @param value Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  function updateDate(name: "startDate" | "endDate", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Atualiza o estado da interface para select today.
   * Durante o fluxo, aciona `formatLocalDate`, `toString`, `set`, `replace`.
   *
   * @returns Não retorna valor.
   */
  function selectToday() {
    const formattedToday = formatLocalDate(new Date());
    const params = new URLSearchParams(searchParams.toString());

    params.set("startDate", formattedToday);
    params.set("endDate", formattedToday);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Atualiza o estado da interface para shift date range.
   * Durante o fluxo, aciona `toString`, `set`, `addDays`, `replace`.
   *
   * @param days Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  function shiftDateRange(days: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("startDate", addDays(startDate, days));
    params.set("endDate", addDays(endDate, days));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <button
        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
        type="button"
        aria-label="Dia anterior"
        onClick={() => shiftDateRange(-1)}
      >
        <ChevronLeftIcon />
      </button>
      <DateInput
        label="De"
        ariaLabel="Data inicial"
        name="startDate"
        value={startDate}
        onChange={updateDate}
      />
      <DateInput
        label="Até"
        ariaLabel="Data final"
        name="endDate"
        value={endDate}
        onChange={updateDate}
      />
      <button
        className="h-[30px] rounded-lg border border-slate-200 bg-white px-4 text-xs text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
        type="button"
        onClick={selectToday}
      >
        Hoje
      </button>
      <button
        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
        type="button"
        aria-label="Próximo dia"
        onClick={() => shiftDateRange(1)}
      >
        <ChevronRightIcon />
      </button>
    </>
  );
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Executa add days no fluxo atual.
 * Durante o fluxo, aciona `map`, `split`, `setDate`, `getDate` e outras rotinas auxiliares.
 *
 * @param value Dados necessários para executar esta função.
 * @param days Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Format local date para o formato esperado pelo fluxo.
 * Durante o fluxo, aciona `join`, `getFullYear`, `padStart`, `getMonth` e outras rotinas auxiliares.
 *
 * @param date Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function formatLocalDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de chevron left.
 *
 * @returns O elemento React que representa esta interface.
 */
function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de chevron right.
 *
 * @returns O elemento React que representa esta interface.
 */
function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente DateInput com os dados recebidos.
 * Durante o fluxo, aciona `onChange`.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function DateInput({
  label,
  ariaLabel,
  name,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  name: "startDate" | "endDate";
  value: string;
  onChange: (name: "startDate" | "endDate", value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span>{label}</span>
      <input
        aria-label={ariaLabel}
        className="h-[30px] w-[124px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)] [color-scheme:light]"
        value={value}
        name={name}
        form="activity-filters"
        type="date"
        onChange={(event) => onChange(name, event.currentTarget.value)}
      />
    </label>
  );
}
