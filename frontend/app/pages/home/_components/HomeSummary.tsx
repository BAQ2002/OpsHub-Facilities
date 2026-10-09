import { HandlingTimeDisplay } from "@/app/componentes/HandlingTimeDisplay";
import type { HomePageViewModel } from "@/app/entities/navigation_entities/home_viewModels";

export function HomeSummary({ totals, averageHandlingTimeClock }: Pick<HomePageViewModel, "totals" | "averageHandlingTimeClock">) {
  return (
    <div data-ui="facilities-summary-cards" className="lg:col-span-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          value={String(totals.Completed)}
          label="Concluídas"
          bg="bg-emerald-50"
          color="text-emerald-600"
        />
        <SummaryCard
          value={String(totals.InProgress)}
          label="Em andamento"
          bg="bg-amber-50"
          color="text-yellow-500"
        />
        <SummaryCard
          value={String(totals.Planned)}
          label="Programadas"
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <HandlingTimeDisplay
          displayValue={averageHandlingTimeClock.display}
          caption={averageHandlingTimeClock.caption}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  value,
  label,
  bg,
  color,
  raised = false,
}: {
  value: string;
  label: string;
  bg: string;
  color: string;
  raised?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[76px] flex-col items-center justify-center rounded-xl ${bg} px-6 py-4 text-center ${
        raised ? "shadow-[0_2px_12px_rgba(225,29,72,0.16)]" : ""
      }`}
    >
      <p className={`text-[25px] font-bold leading-none ${color}`}>{value}</p>
      <p className="mt-2 text-[11px] leading-none text-slate-500">{label}</p>
    </div>
  );
}
