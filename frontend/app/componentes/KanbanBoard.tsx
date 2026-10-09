"use client";

import { Fragment, useRef, useState, type Key, type ReactNode } from "react";
import { kanbanWindowOffset } from "./kanban-window";

export type KanbanColumnPagination = {
  offset: number; total: number; pageSize: number; pending: boolean; error?: string;
  request: (offset: number) => void; retry: () => void;
};

export const KANBAN_ROW_HEIGHT = 176;

export type KanbanBoardColumn<T> = {
  id: Key;
  title: string;
  items: readonly T[];
  total?: number;
  pagination?: KanbanColumnPagination;
};

export type KanbanBoardProps<T> = {
  columns: readonly KanbanBoardColumn<T>[];
  visibleColumnIds?: readonly Key[];
  getItemKey: (item: T) => Key;
  renderCard: (item: T, onOpen: () => void) => ReactNode;
  renderDetails?: (item: T, column: KanbanBoardColumn<T>, onClose: () => void) => ReactNode;
  getCountLabel?: (column: KanbanBoardColumn<T>) => string;
  ariaLabel?: string;
  emptyMessage?: string;
  dataUi?: string;
  datasetVersion?: number;
};

/** Quadro reutilizável. As chaves dos itens devem ser únicas em todo o quadro.
 * A tela fornece dados, cartões e detalhes; o quadro controla colunas e seleção.
 */
export function KanbanBoard<T>({
  columns,
  visibleColumnIds,
  getItemKey,
  renderCard,
  renderDetails,
  getCountLabel,
  ariaLabel = "Quadro kanban",
  emptyMessage = "Nenhum resultado para os filtros informados.",
  dataUi = "kanban-board",
  datasetVersion = 0,
}: KanbanBoardProps<T>) {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const visibleColumns = visibleColumnIds === undefined
    ? columns
    : columns.filter((column) => visibleColumnIds.includes(column.id));
  // Resolve a seleção nos dados atuais, inclusive após atualização ou mudança de coluna.
  const selectedColumn = selectedKey === null ? undefined : columns.find(
    (column) => column.items.some((item) => getItemKey(item) === selectedKey),
  );
  const selectedItem = selectedColumn?.items.find((item) => getItemKey(item) === selectedKey);

  if (visibleColumns.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <>
      <section data-ui={dataUi} className="flex items-start gap-3 overflow-x-auto pb-6" aria-label={ariaLabel}>
        {visibleColumns.map((column) => (
          <KanbanColumn
            key={`${datasetVersion}:${String(column.id)}`}
            column={column}
            getItemKey={getItemKey}
            renderCard={renderCard}
            onOpen={setSelectedKey}
            countLabel={getCountLabel?.(column) ?? `${column.items.length} itens`}
            dataUi={`${dataUi}-column`}
          />
        ))}
      </section>
      {selectedColumn && selectedItem !== undefined && renderDetails
        ? renderDetails(selectedItem, selectedColumn, () => setSelectedKey(null))
        : null}
    </>
  );
}

function KanbanColumn<T>({ column, getItemKey, renderCard, onOpen, countLabel, dataUi }: {
  column: KanbanBoardColumn<T>;
  getItemKey: (item: T) => Key;
  renderCard: KanbanBoardProps<T>["renderCard"];
  onOpen: (key: Key) => void;
  countLabel: string;
  dataUi: string;
}) {
  const previousScroll = useRef(0);
  const pagination = column.pagination;
  function onScroll(element: HTMLDivElement) {
    if (!pagination || pagination.total <= pagination.pageSize) return;
    const first = Math.floor(element.scrollTop / KANBAN_ROW_HEIGHT);
    const down = element.scrollTop >= previousScroll.current;
    previousScroll.current = element.scrollTop;
    const target = kanbanWindowOffset(first, pagination.offset, pagination.total, pagination.pageSize, down);
    if (target !== pagination.offset || pagination.pending) pagination.request(target);
  }
  return (
    <section data-ui={dataUi} className="min-w-[280px] flex-1 rounded-xl border border-slate-300 bg-[#f1f2f4] p-2 shadow-sm">
      <header data-ui={`${dataUi}-header`} className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
        <h2 className="min-w-0 truncate text-sm font-semibold text-slate-800" title={column.title}>{column.title}</h2>
        <span className="text-sm tabular-nums text-slate-500" aria-label={countLabel}>{column.total ?? column.items.length}</span>
      </header>
      {pagination ? <>
        <div data-ui={`${dataUi}-list`} className="relative max-h-[620px] overflow-y-auto" style={{ height: Math.min(620, pagination.total * KANBAN_ROW_HEIGHT) }}
          tabIndex={0} role="region" aria-label={`Chamados: ${column.title}`} aria-busy={pagination.pending}
          onScroll={(event) => onScroll(event.currentTarget)}>
          <div style={{ height: pagination.total * KANBAN_ROW_HEIGHT, position: "relative", overflowAnchor: "none" }}>
            <div style={{ position: "absolute", top: pagination.offset * KANBAN_ROW_HEIGHT, width: "100%" }}>
              {column.items.map((item) => <div key={getItemKey(item)} style={{ height: KANBAN_ROW_HEIGHT, paddingBottom: 8 }}>
                {renderCard(item, () => onOpen(getItemKey(item)))}
              </div>)}
            </div>
          </div>
        </div>
        <div className="min-h-6 px-2 pt-2 text-xs text-slate-500" role="status" aria-live="polite">
          {pagination.pending ? "Carregando chamados..." : pagination.error ? <><span>{pagination.error}</span> <button type="button" className="text-blue-700 underline" onClick={pagination.retry}>Tentar novamente</button></> : null}
        </div>
      </> : <div data-ui={`${dataUi}-list`} className="max-h-[620px] space-y-2 overflow-y-auto">
        {column.items.map((item) => (
          <Fragment key={getItemKey(item)}>{renderCard(item, () => onOpen(getItemKey(item)))}</Fragment>
        ))}
      </div>}
    </section>
  );
}
