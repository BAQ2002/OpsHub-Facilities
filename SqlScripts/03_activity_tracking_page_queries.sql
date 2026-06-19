-- ============================================================
-- OpsHub Facilities - Acompanhamento de atividades page queries
-- Base schema: SqlScritps/Create_Tables.sql
-- Objetivo: substituir categoryData, statusData, monthlyData e summaryCards.
-- ============================================================

-- Parâmetros esperados:
-- :period_start TIMESTAMP
-- :period_end TIMESTAMP
-- :business_id INTEGER          -- opcional; NULL para todas as unidades
-- :service_category_id INTEGER  -- opcional; NULL para todas as categorias

-- 1) Summary cards do período.
-- Pendentes críticos é aproximado pelo schema atual: solicitações abertas ou
-- em andamento com ocorrência há mais de 24 horas. Ajustar quando houver campo
-- de prioridade/SLA contratual.
SELECT
    COUNT(*) AS period_requests,
    COUNT(*) FILTER (WHERE s.description = 'Em andamento') AS in_progress,
    ROUND(AVG(EXTRACT(EPOCH FROM (r.planned_datetime - r.ocurrence_datetime)) / 60))::INTEGER AS average_sla_minutes,
    COUNT(*) FILTER (
        WHERE s.description IN ('Aberto', 'Programada', 'Em andamento')
          AND r.ocurrence_datetime < NOW() - INTERVAL '24 hours'
    ) AS critical_pending
FROM requests r
JOIN status s
    ON s.id = r.id_status
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
JOIN locations l
    ON l.id = r.id_location
JOIN regions rg
    ON rg.id = l.id_region
WHERE r.ocurrence_datetime >= :period_start
  AND r.ocurrence_datetime < :period_end
  AND (:business_id IS NULL OR rg.id_business = :business_id)
  AND (:service_category_id IS NULL OR sc.id = :service_category_id);

-- 2) Distribuição por categoria.
-- Mapeia para categoryData[].
SELECT
    sc.name AS label,
    COUNT(r.id) AS value
FROM service_category sc
LEFT JOIN service_type st
    ON st.id_service_category = sc.id
LEFT JOIN requests r
    ON r.id_service_type = st.id
    AND r.ocurrence_datetime >= :period_start
    AND r.ocurrence_datetime < :period_end
LEFT JOIN locations l
    ON l.id = r.id_location
LEFT JOIN regions rg
    ON rg.id = l.id_region
WHERE (:business_id IS NULL OR rg.id_business = :business_id OR r.id IS NULL)
  AND (:service_category_id IS NULL OR sc.id = :service_category_id)
GROUP BY sc.id, sc.name
ORDER BY sc.name;

-- 3) Distribuição por status.
-- Mapeia para statusData[].
SELECT
    s.description AS label,
    COUNT(r.id) AS value
FROM status s
LEFT JOIN requests r
    ON r.id_status = s.id
    AND r.ocurrence_datetime >= :period_start
    AND r.ocurrence_datetime < :period_end
LEFT JOIN service_type st
    ON st.id = r.id_service_type
LEFT JOIN locations l
    ON l.id = r.id_location
LEFT JOIN regions rg
    ON rg.id = l.id_region
WHERE (:business_id IS NULL OR rg.id_business = :business_id OR r.id IS NULL)
  AND (:service_category_id IS NULL OR st.id_service_category = :service_category_id OR r.id IS NULL)
GROUP BY s.id, s.description
ORDER BY s.id;

-- 4) Série mensal de chamados abertos e fechados/concluídos.
-- Mapeia para monthlyData[]. Use :year_start e :year_end quando a tela
-- passar a controlar o ano independentemente do período de filtros.
-- Parâmetros adicionais: :year_start TIMESTAMP, :year_end TIMESTAMP
SELECT
    TO_CHAR(months.month_start, 'Mon') AS month,
    COUNT(r.id) FILTER (WHERE s.description <> 'Concluída') AS open,
    COUNT(r.id) FILTER (WHERE s.description = 'Concluída') AS closed
FROM GENERATE_SERIES(
    DATE_TRUNC('month', :year_start::timestamp),
    DATE_TRUNC('month', :year_end::timestamp) - INTERVAL '1 month',
    INTERVAL '1 month'
) AS months(month_start)
LEFT JOIN requests r
    ON r.ocurrence_datetime >= months.month_start
    AND r.ocurrence_datetime < months.month_start + INTERVAL '1 month'
LEFT JOIN status s
    ON s.id = r.id_status
LEFT JOIN service_type st
    ON st.id = r.id_service_type
LEFT JOIN locations l
    ON l.id = r.id_location
LEFT JOIN regions rg
    ON rg.id = l.id_region
WHERE (:business_id IS NULL OR rg.id_business = :business_id OR r.id IS NULL)
  AND (:service_category_id IS NULL OR st.id_service_category = :service_category_id OR r.id IS NULL)
GROUP BY months.month_start
ORDER BY months.month_start;
