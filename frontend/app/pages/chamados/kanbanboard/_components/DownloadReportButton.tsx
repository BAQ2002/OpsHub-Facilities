"use client";
import { useRef, useState } from "react";
import { useChamados } from "../_hooks/useChamados";

export function DownloadReportButton() {
  const { appliedFilters, filters, isPending, error, data, selectedStatusIds } = useChamados();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const downloadLock = useRef(false);
  async function downloadReport() {
    if (downloadLock.current) return;
    downloadLock.current = true;
    setIsDownloading(true);
    setDownloadError("");
    const params = new URLSearchParams({ start_date: appliedFilters.startDate, end_date: appliedFilters.endDate });
    if (appliedFilters.businessId) params.set("business_id", String(appliedFilters.businessId));
    if (appliedFilters.search?.trim()) params.set("search", appliedFilters.search.trim());
    appliedFilters.serviceCategoryIds?.forEach((id) => params.append("service_category_ids", String(id)));
    selectedStatusIds.forEach((id) => params.append("status_ids", String(id)));
    try {
      const response = await fetch(`/api/requests/report?${params}`, { cache: "no-store" });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(typeof error?.error === "string" ? error.error : "Não foi possível gerar o relatório. Tente novamente.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_chamados_${appliedFilters.startDate}_a_${appliedFilters.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Não foi possível baixar o relatório.");
    } finally {
      downloadLock.current = false;
      setIsDownloading(false);
    }
  }

  return (
    <div className="text-right">
            <button type="button" onClick={downloadReport} disabled={!data || !!error || isDownloading || isPending || JSON.stringify(filters) !== JSON.stringify(appliedFilters)} aria-busy={isDownloading} className="flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-medium disabled:cursor-wait disabled:opacity-50"><DownloadIcon /><span>{isDownloading ? "Gerando relatório..." : "Baixar relatório"}</span></button>
      {downloadError && <p role="alert" className="mt-3 text-sm text-red-600">{downloadError}</p>}
      <span role="status" className="sr-only">{isDownloading ? "Gerando relatório PDF. Aguarde o download." : ""}</span>
    </div>
  );
}

const icon = "h-[18px] w-[18px]";

function DownloadIcon() { return <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 18v3h14v-3" /></svg>; }

