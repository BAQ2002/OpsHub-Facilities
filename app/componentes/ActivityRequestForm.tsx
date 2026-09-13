"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  ActivityRequestField as Field,
  LocationHierarchy,
} from "@/src/domain/entities/activity-request-form";

type ActivityRequestFormProps = {
  title: string;
  subtitle: string;
  sectionTitle: string;
  fields: Field[];
  locationHierarchy?: LocationHierarchy;
  action?: (formData: FormData) => Promise<void>;
};

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente ActivityRequestForm com os dados recebidos.
 * Durante o fluxo, aciona {@link map}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
export default function ActivityRequestForm({
  title,
  subtitle,
  sectionTitle,
  fields,
  locationHierarchy,
  action,
}: ActivityRequestFormProps) {
  return (
    <section data-ui="activity-request-page" className="min-h-screen bg-[#fbfcfe] px-5 pb-8 pt-8 text-slate-950 md:px-8 lg:px-9">
      <div data-ui="activity-request-content" className="mx-auto max-w-[1620px]">
        <div data-ui="activity-request-toolbar" className="mb-4 flex justify-end">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-white text-base shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
            type="button"
            aria-label="Alternar tema"
          >
            🌙
          </button>
        </div>

        <header data-ui="activity-request-header" className="mb-4 flex items-center gap-4 rounded-[20px] border border-slate-100 bg-white px-5 py-5 shadow-[0_1px_5px_rgba(15,23,42,0.10)]">
          <Link
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl leading-none text-slate-950 shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
            href="/solicitar-atividade"
            aria-label="Voltar para nova request"
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
          data-ui="activity-request-form"
          action={action}
          className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_5px_rgba(15,23,42,0.10)]"
        >
          <h2 className="mb-6 text-base font-bold leading-tight text-slate-950">
            {sectionTitle}
          </h2>

          <div data-ui="activity-request-fields" className="grid gap-x-4 gap-y-5 md:grid-cols-2">
            {locationHierarchy ? <LocationFields hierarchy={locationHierarchy} /> : null}
            {fields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </div>

          <div data-ui="activity-request-actions" className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              Salvar request
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente LocationFields com os dados recebidos.
 * Durante o fluxo, aciona {@link useState}, {@link useMemo}, {@link filter}, {@link map} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function LocationFields({ hierarchy }: { hierarchy: LocationHierarchy }) {
  const [businessId, setBusinessId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [locationId, setLocationId] = useState("");

  const regions = useMemo(
    () => hierarchy.regions.filter((region) => region.businessId === Number(businessId)),
    [businessId, hierarchy.regions],
  );
  const locations = useMemo(
    () => hierarchy.locations.filter((location) => location.regionId === Number(regionId)),
    [hierarchy.locations, regionId],
  );

  return (
    <div className="grid gap-x-4 gap-y-5 md:col-span-2 md:grid-cols-3">
      <SelectField
        label="Unidade de Negócio"
        name="business_id"
        value={businessId}
        options={hierarchy.businesses.map((business) => ({
          label: business.name,
          value: business.id.toString(),
        }))}
        onChange={(value) => {
          setBusinessId(value);
          setRegionId("");
          setLocationId("");
        }}
      />
      <SelectField
        label="Região"
        name="region_id"
        value={regionId}
        options={regions.map((region) => ({ label: region.name, value: region.id.toString() }))}
        disabled={!businessId}
        onChange={(value) => {
          setRegionId(value);
          setLocationId("");
        }}
      />
      <SelectField
        label="Localização"
        name="location_id"
        options={locations.map((location) => ({ label: location.name, value: location.id.toString() }))}
        disabled={!regionId}
        value={locationId}
        onChange={setLocationId}
      />
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente SelectField com os dados recebidos.
 * Durante o fluxo, aciona {@link onChange}, {@link map}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function SelectField({
  label,
  name,
  options,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const fieldId = `activity-${name}`;
  const inputClass =
    "h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <label htmlFor={fieldId}>
      <span className="mb-2 block text-sm font-medium text-slate-600">
        {label} <span className="text-rose-500">*</span>
      </span>
      <select
        className={inputClass}
        disabled={disabled}
        id={fieldId}
        name={name}
        required
        value={value ?? ""}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      >
        <option value="" disabled>
          {disabled ? "Selecione o campo anterior..." : "Selecione o registro..."}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente FormField com os dados recebidos.
 * Durante o fluxo, aciona {@link renderField}.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function FormField({ field }: { field: Field }) {
  const fieldId = `activity-${field.name}`;
  const wrapperClass = field.fullWidth ? "md:col-span-2" : undefined;

  if (field.type === "hidden") {
    return <input name={field.name} type="hidden" value={field.placeholder ?? ""} />;
  }

  if (field.type === "multi-select") {
    return (
      <div className={wrapperClass}>
        <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor={fieldId}>
          {field.label} {field.required !== false ? <span className="text-rose-500">*</span> : null}
        </label>
        <MultiSelectDropdown field={field} fieldId={fieldId} />
        {field.helpText ? <span className="mt-2 block text-xs text-slate-500">{field.helpText}</span> : null}
      </div>
    );
  }

  return (
    <label className={wrapperClass} htmlFor={fieldId}>
      <span className="mb-2 block text-sm font-medium text-slate-600">
        {field.label} {field.required !== false ? <span className="text-rose-500">*</span> : null}
      </span>
      {renderField(field, fieldId)}
      {field.helpText ? <span className="mt-2 block text-xs text-slate-500">{field.helpText}</span> : null}
    </label>
  );
}

/**
 * Acionada pelos módulos que importam esta função ou pelo fluxo interno deste arquivo.
 *
 * Executa render field no fluxo atual.
 * Durante o fluxo, aciona {@link map}, {@link join}.
 *
 * @param field Dados necessários para executar esta função.
 * @param fieldId Dados necessários para executar esta função.
 * @returns O resultado produzido para continuidade do fluxo chamador.
 */
function renderField(field: Field, fieldId: string) {
  const inputClass =
    "h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  if (field.type === "select") {
    return (
      <select
        className={inputClass}
        id={fieldId}
        name={field.name}
        defaultValue={field.defaultValue ?? ""}
        required={field.required !== false}
      >
        <option value="" disabled>
          Selecione o registro...
        </option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <>
        <input name={field.name} type="hidden" value="false" />
        <input
          className="h-5 w-5 rounded border-slate-300 text-teal-600 outline-none transition focus:ring-2 focus:ring-teal-100"
          id={fieldId}
          name={field.name}
          type="checkbox"
          value="true"
        />
      </>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        className={`${inputClass} min-h-[116px] resize-y py-3`}
        id={fieldId}
        name={field.name}
        placeholder={field.placeholder}
        required={field.required !== false}
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
          accept={field.mediaOptions?.accept.join(",") || undefined}
          multiple={field.mediaOptions?.multiple ?? false}
          required={field.required !== false}
        />
        <span className="mt-3 block text-xs text-slate-500">
          {field.mediaOptions?.multiple
            ? "Selecione um ou mais arquivos para anexar à solicitação."
            : "Selecione um arquivo para anexar à solicitação."}
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
      required={field.required !== false}
    />
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o componente MultiSelectDropdown com os dados recebidos.
 * Durante o fluxo, aciona {@link useState}, {@link useRef}, {@link useEffect}, {@link contains} e outras rotinas auxiliares.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function MultiSelectDropdown({ field, fieldId }: { field: Field; fieldId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const options = field.options ?? [];
  const optionsId = `${fieldId}-options`;
  const errorId = `${fieldId}-error`;
  const isRequired = field.required !== false;

  useEffect(() => {
    if (!isOpen) return;

    /**
     * Acionada internamente pela função ou pelo componente que a declara.
     *
     * Atualiza o estado da interface para close on outside click.
     * Durante o fluxo, aciona {@link contains}, {@link setIsOpen}.
     *
     * @param event Dados necessários para executar esta função.
     * @returns Não retorna valor.
     */
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    /**
     * Acionada internamente pela função ou pelo componente que a declara.
     *
     * Atualiza o estado da interface para close on escape.
     * Durante o fluxo, aciona {@link setIsOpen}, {@link focus}.
     *
     * @param event Dados necessários para executar esta função.
     * @returns Não retorna valor.
     */
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  /**
   * Acionada internamente pela função ou pelo componente que a declara.
   *
   * Toggle option para o formato esperado pelo fluxo.
   * Durante o fluxo, aciona {@link setSelectedValues}, {@link includes}, {@link filter}, {@link setShowRequiredError}.
   *
   * @param value Dados necessários para executar esta função.
   * @returns Não retorna valor.
   */
  function toggleOption(value: string) {
    setSelectedValues((currentValues) => {
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value];

      if (nextValues.length > 0) setShowRequiredError(false);
      return nextValues;
    });
  }

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const summary =
    selectedLabels.length === 0
      ? "Selecione o registro..."
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} opções selecionadas`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-describedby={showRequiredError ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={optionsId}
        className={`flex h-[46px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${
          showRequiredError ? "border-rose-500" : "border-slate-200"
        }`}
        id={fieldId}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        ref={buttonRef}
        type="button"
      >
        <span className={selectedLabels.length === 0 ? "truncate text-slate-400" : "truncate text-slate-950"}>
          {summary}
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      <input
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
        onInvalid={(event) => {
          event.preventDefault();
          setShowRequiredError(true);
          setIsOpen(true);
          buttonRef.current?.focus();
        }}
        readOnly
        required={isRequired}
        tabIndex={-1}
        value={selectedValues.length > 0 ? "selected" : ""}
      />

      {isOpen ? (
        <div
          aria-multiselectable="true"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
          id={optionsId}
          role="listbox"
        >
          {options.length > 0 ? (
            options.map((option) => {
              const optionId = `${fieldId}-${option.value}`;
              const isSelected = selectedValues.includes(option.value);

              return (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-teal-50"
                  htmlFor={optionId}
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                >
                  <input
                    checked={isSelected}
                    className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                    id={optionId}
                    name={field.name}
                    onChange={() => toggleOption(option.value)}
                    type="checkbox"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">Nenhuma opção disponível.</p>
          )}
        </div>
      ) : null}

      {showRequiredError ? (
        <span className="mt-2 block text-xs text-rose-600" id={errorId} role="alert">
          Selecione pelo menos uma opção.
        </span>
      ) : null}
    </div>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de chevron down.
 *
 * @param props Dados necessários para executar esta função.
 * @returns O elemento React que representa esta interface.
 */
function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de clipboard.
 *
 * @returns O elemento React que representa esta interface.
 */
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

/**
 * Acionada pelo React quando o componente é incluído na árvore de renderização do componente pai.
 *
 * Renderiza o ícone visual de save.
 *
 * @returns O elemento React que representa esta interface.
 */
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
