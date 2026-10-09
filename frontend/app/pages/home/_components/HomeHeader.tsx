export function HomeHeader() {
  return (
    <header data-ui="facilities-home-header" className="mb-[18px] grid grid-cols-[1fr_auto] items-start gap-4 pt-2">
      <h1 className="mt-[57px] text-[26px] font-bold leading-none tracking-[-0.03em] text-slate-950">
        Facilities
      </h1>
    
      <div data-ui="facilities-home-controls" className="flex flex-col items-end gap-[22px]">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-base shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
          type="button"
          aria-label="Alternar tema"
        >
          🌙
        </button>
    
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <button
            className="flex h-8 w-8 items-center justify-center text-lg leading-none text-slate-500"
            type="button"
            aria-label="Atualizar"
          >
            ↻
          </button>
    
          <select
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
            aria-label="Intervalo de atualização"
            defaultValue="5 min"
          >
            <option value="5 min">5 min</option>
            <option value="10 min">10 min</option>
            <option value="30 min">30 min</option>
          </select>
        </div>
      </div>
    </header>
  );
}
