const sevenSegmentPaths = [
  { id: "a", x: 5, y: 0, width: 18, height: 4 },
  { id: "b", x: 24, y: 4, width: 4, height: 19 },
  { id: "c", x: 24, y: 27, width: 4, height: 19 },
  { id: "d", x: 5, y: 46, width: 18, height: 4 },
  { id: "e", x: 0, y: 27, width: 4, height: 19 },
  { id: "f", x: 0, y: 4, width: 4, height: 19 },
  { id: "g", x: 5, y: 23, width: 18, height: 4 },
] as const;

const sevenSegmentMap: Record<
  string,
  (typeof sevenSegmentPaths)[number]["id"][]
> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

export function HandlingTimeDisplay({
  displayValue,
  caption,
  title = "Tempo médio de atendimento",
}: {
  displayValue: string;
  caption: string;
  title?: string;
}) {
  const [hours, minutes] = displayValue.split(":");

  return (
    <section
      className="flex min-h-[118px] flex-col items-center justify-center rounded-xl bg-white px-3 py-2 text-center"
      aria-label={title}
    >
      <h2
        className="mb-2 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-[#45628a]"
      >
        {title}
      </h2>

      <div
        className="flex h-[70px] min-w-[178px] px-4 items-center justify-center rounded-[15px] bg-[#070d14] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
        aria-label={`${title}: ${caption}`}
        role="img"
      >
        <div className="flex items-center gap-[4.5px]">
          {Array.from(hours).map((digit, index) => <SevenSegmentDigit key={index} value={digit} />)}
        </div>
        <BlinkingColon />
        <div className="flex items-center gap-[4.5px]">
          <SevenSegmentDigit value={minutes[0]} />
          <SevenSegmentDigit value={minutes[1]} />
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold leading-none text-[#45628a]">
        {caption}
      </p>
    </section>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente BlinkingColon com os dados recebidos.
 *
 * @returns O elemento React que representa esta interface.
 */
function BlinkingColon() {
  return (
    <svg
      aria-hidden="true"
      className="mx-[9px] h-[45px] w-[9px] shrink-0 animate-[handling-time-caret-blink_1s_steps(1,end)_infinite] text-[#08c6e8]"
      fill="currentColor"
      viewBox="0 0 10 50"
    >
      <circle cx="5" cy="16" r="3" />
      <circle cx="5" cy="30" r="3" />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente SevenSegmentDigit com os dados recebidos.
 * Durante o fluxo, aciona {@link map}, {@link includes}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function SevenSegmentDigit({ value }: { value: string }) {
  const activeSegments = sevenSegmentMap[value] ?? sevenSegmentMap["0"];

  return (
    <svg
      aria-hidden="true"
      className="h-[45px] w-[25.5px] shrink-0"
      viewBox="0 0 28 50"
    >
      {sevenSegmentPaths.map((segment) => (
        <rect
          key={segment.id}
          x={segment.x}
          y={segment.y}
          width={segment.width}
          height={segment.height}
          rx="1"
          className={
            activeSegments.includes(segment.id)
              ? "fill-[#08c6e8]"
              : "fill-[#0b2938] opacity-80"
          }
        />
      ))}
    </svg>
  );
}

