-- ============================================================
-- OpsHub Facilities - Home page queries
-- Base schema: SqlScritps/Create_Tables.sql
-- Objetivo: substituir os mocks da Home por consultas PostgreSQL.
-- ============================================================

-- Parâmetros esperados:
-- :period_start TIMESTAMP  -- início do período selecionado na Home
-- :period_end   TIMESTAMP  -- fim do período selecionado na Home

-- 1) Cards por categoria/equipe: Programadas e Em andamento.
-- Mapeia para equipmentCards[].
SELECT
    sc.id AS service_category_id,
    sc.name AS title,
    COUNT(*) FILTER (WHERE s.description = 'Programada') AS planned,
    COUNT(*) FILTER (WHERE s.description = 'Em andamento') AS in_progress,
    COUNT(r.id) AS total
FROM service_category sc
LEFT JOIN service_type st
    ON st.id_service_category = sc.id
LEFT JOIN requests r
    ON r.id_service_type = st.id
    AND r.planned_datetime >= :period_start
    AND r.planned_datetime < :period_end
LEFT JOIN status s
    ON s.id = r.id_status
GROUP BY sc.id, sc.name
ORDER BY sc.name;

-- 2) Totais do resumo superior: Programadas e Em andamento.
-- Mapeia para totals.Planned e totals.InProgress.
SELECT
    COUNT(*) FILTER (WHERE s.description = 'Programada') AS planned,
    COUNT(*) FILTER (WHERE s.description = 'Em andamento') AS in_progress
FROM requests r
JOIN status s
    ON s.id = r.id_status
WHERE r.planned_datetime >= :period_start
  AND r.planned_datetime < :period_end;

-- 3) SLA médio em minutos.
-- Como o schema atual não possui tabela de eventos/atendimento, esta consulta usa
-- a diferença entre planned_datetime e ocurrence_datetime quando ambas existem.
-- Mapeia para averageSlaClock.
SELECT
    ROUND(AVG(EXTRACT(EPOCH FROM (r.planned_datetime - r.ocurrence_datetime)) / 60))::INTEGER AS average_sla_minutes
FROM requests r
WHERE r.ocurrence_datetime IS NOT NULL
  AND r.planned_datetime IS NOT NULL
  AND r.planned_datetime >= :period_start
  AND r.planned_datetime < :period_end;

-- 4) Atividades planejadas para tabela e mapa.
-- Mapeia para activityRecords[] e activityMarkers[].
SELECT
    r.id AS request_id,
    rt.name AS activity_type,
    b.name AS business_unit,
    sc.name AS category,
    st.name AS service_type,
    l.name AS location,
    rg.name AS region,
    r.planned_datetime,
    r.description,
    l.location_x AS map_x,
    l.location_y AS map_y,
    s.description AS status
FROM requests r
JOIN requests_types rt
    ON rt.id = r.id_request_type
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
JOIN locations l
    ON l.id = r.id_location
JOIN regions rg
    ON rg.id = l.id_region
JOIN business b
    ON b.id = rg.id_business
JOIN status s
    ON s.id = r.id_status
WHERE r.planned_datetime >= :period_start
  AND r.planned_datetime < :period_end
ORDER BY r.planned_datetime, r.id;

-- 5) Filtros/contadores por unidade de negócio.
-- Mapeia para plannedRequestFilterOptions[].
SELECT
    b.id AS business_id,
    b.name AS label,
    COUNT(r.id) AS count
FROM business b
LEFT JOIN regions rg
    ON rg.id_business = b.id
LEFT JOIN locations l
    ON l.id_region = rg.id
LEFT JOIN requests r
    ON r.id_location = l.id
    AND r.planned_datetime >= :period_start
    AND r.planned_datetime < :period_end
GROUP BY b.id, b.name
ORDER BY b.name;
