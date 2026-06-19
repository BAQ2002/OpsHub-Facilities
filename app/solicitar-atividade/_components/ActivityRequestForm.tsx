import Link from "next/link";

type FieldType = "select" | "text" | "datetime-local" | "textarea" | "file";

type Field = {
  label: string;
  name: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  fullWidth?: boolean;
};

type ActivityRequestFormProps = {
  title: string;
  subtitle: string;
  sectionTitle: string;
  fields: Field[];
  action?: (formData: FormData) => Promise<void>;
};

export default function ActivityRequestForm({
  title,
  subtitle,
  sectionTitle,
  fields,
  action,
}: ActivityRequestFormProps) {
  return (
    <section className="min-h-screen bg-[#fbfcfe] px-5 pb-8 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div className="mx-auto max-w-[1620px]">
        <div className="mb-4 flex justify-end">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-white text-base shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
            type="button"
            aria-label="Alternar tema"
          >
            🌙
          </button>
        </div>

        <header className="mb-4 flex items-center gap-4 rounded-[20px] border border-slate-100 bg-white px-5 py-5 shadow-[0_1px_5px_rgba(15,23,42,0.10)]">
          <Link
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl leading-none text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
            href="/solicitar-atividade"
            aria-label="Voltar para solicitar atividade"
          >
            ‹
          </Link>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600"
            aria-hidden="true"
          >
            <ClipboardIcon />
          </div>

          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-tight text-slate-500">{subtitle}</p>
          </div>
        </header>

        <form
          action={action}
          className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_5px_rgba(15,23,42,0.10)]"
        >
          <h2 className="mb-6 text-base font-bold leading-tight text-slate-950">
            {sectionTitle}
          </h2>

          <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
            {fields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
              href="/solicitar-atividade"
            >
              Cancelar
            </Link>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-bold text-white shadow-[0_2px_4px_rgba(15,23,42,0.18)] transition hover:bg-teal-700"
              type="submit"
            >
              <SaveIcon />
              Salvar Solicitação
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FormField({ field }: { field: Field }) {
  const fieldId = `activity-${field.name}`;
  const wrapperClass = field.fullWidth ? "md:col-span-2" : undefined;

  return (
    <label className={wrapperClass} htmlFor={fieldId}>
      <span className="mb-2 block text-sm font-medium text-slate-600">
        {field.label} <span className="text-rose-500">*</span>
      </span>
      {renderField(field, fieldId)}
    </label>
  );
}

function renderField(field: Field, fieldId: string) {
  const inputClass =
    "h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  if (field.type === "select") {
    return (
      <select
        className={inputClass}
        id={fieldId}
        name={field.name}
        defaultValue=""
        required
      >
        <option value="" disabled>
          Selecione...
        </option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        className={`${inputClass} min-h-[116px] resize-y py-3`}
        id={fieldId}
        name={field.name}
        placeholder={field.placeholder}
        required
      />
    );
  }

  if (field.type === "file") {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
        <input
          className="w-full cursor-pointer rounded-lg bg-white text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
          id={fieldId}
          name={field.name}
          type="file"
          accept="image/*"
          multiple
          required
        />
        <span className="mt-3 block text-xs text-slate-500">
          Anexe uma ou mais fotos que registrem a necessidade.
        </span>
      </div>
    );
  }

  return (
    <input
      className={inputClass}
      id={fieldId}
      name={field.name}
      type={field.type}
      placeholder={field.placeholder}
      required
    />
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5h6" />
      <path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1Z" />
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}
