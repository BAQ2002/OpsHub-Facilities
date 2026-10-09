import { AirVent, BrickWall, ClipboardCheck, Coffee, Droplets, Flower2, Hammer, PaintRoller, Wrench, Zap, type LucideIcon } from "lucide-react";
import type { HomePageViewModel } from "@/app/entities/navigation_entities/home_viewModels";

const categoryIcons: Readonly<Record<string, LucideIcon>> = {
  "ARTÍFICE": Hammer,
  "CLIMATIZAÇÃO E REFRIGERAÇÃO": AirVent,
  "COPA": Coffee,
  "INSTALAÇÕES ELÉTRICAS": Zap,
  "INSTALAÇÕES HIDRÁULICAS": Droplets,
  "JARDINAGEM": Flower2,
  "MANUTENÇÃO CIVIL": BrickWall,
  "PINTURA": PaintRoller,
  "PMOC": ClipboardCheck,
};

export function EquipmentSummary({ equipmentCards }: Pick<HomePageViewModel, "equipmentCards">) {
  return (
    <section data-ui="equipment-summary" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-2">
      {equipmentCards.map((card) => {
        const categoryName = card.title.trim().toLocaleUpperCase("pt-BR");
        const Icon = Object.hasOwn(categoryIcons, categoryName) ? categoryIcons[categoryName] : Wrench;

        return (
          <article
            data-ui="equipment-card"
            key={card.title}
            className="min-h-[132px] min-w-0 rounded-2xl border border-slate-200 bg-white px-2.5 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-center justify-start gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.categoryStyle.backgroundColor }}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" style={{ color: card.categoryStyle.color }} />
              </div>

              <h3 title={card.title} className="min-w-0 truncate text-[13px] font-bold leading-tight text-slate-950">
                {card.title}
              </h3>
            </div>

            <div className="mt-3">
              <dl className="space-y-2 text-sm">
                <Metric
                  label="Programadas"
                  value={card.Planned}
                  valueClass="text-blue-500"
                />
                <Metric
                  label="Em andamento"
                  value={card.InProgress}
                  valueClass="text-yellow-500"
                />
                <Metric
                  label="Concluídas"
                  value={card.Completed}
                  valueClass="text-emerald-600"
                />
              </dl>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function Metric({
  label,
  value,
  valueClass = "text-slate-950",
  bordered = false,
}: {
  label: string;
  value: number;
  valueClass?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bordered ? "border-t border-slate-100 pt-2" : ""
      }`}
    >
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-semibold ${valueClass}`}>{value}</dd>
    </div>
  );
}
