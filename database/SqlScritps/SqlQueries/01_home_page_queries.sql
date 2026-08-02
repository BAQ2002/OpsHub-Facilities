-- ============================================================
-- OpsHub Facilities - Home page queries
-- Base schema: SqlScritps/CreateTables/CREATE_ALL_TABLES.sql
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
    COUNT(*) FILTER (WHERE rs.description = 'Programada') AS planned,
    COUNT(*) FILTER (WHERE rs.description = 'Em andamento') AS in_progress,
    COUNT(r.id) AS total
FROM service_category sc
LEFT JOIN service_type st
    ON st.id_service_category = sc.id
LEFT JOIN request r
    ON r.id_service_type = st.id
    AND r.agreed_date >= :period_start
    AND r.agreed_date < :period_end
LEFT JOIN request_status rs
    ON rs.id = r.id_request_status
GROUP BY sc.id, sc.name
ORDER BY sc.name;

-- 2) Totais do resumo superior: Programadas e Em andamento.
-- Mapeia para totals.Planned e totals.InProgress.
SELECT
    COUNT(*) FILTER (WHERE rs.description = 'Programada') AS planned,
    COUNT(*) FILTER (WHERE rs.description = 'Em andamento') AS in_progress
FROM request r
JOIN request_status rs
    ON rs.id = r.id_request_status
WHERE r.agreed_date >= :period_start
  AND r.agreed_date < :period_end;

-- 3) SLA médio em minutos.
-- No schema atual, usa a diferença entre AGREED_DATE e CREATED_DATE.
-- Mapeia para averageSlaClock.
SELECT
    ROUND(AVG(EXTRACT(EPOCH FROM (r.agreed_date - r.created_date)) / 60))::INTEGER AS average_sla_minutes
FROM request r
WHERE r.created_date IS NOT NULL
  AND r.agreed_date IS NOT NULL
  AND r.agreed_date >= :period_start
  AND r.agreed_date < :period_end;

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
    r.agreed_date AS planned_datetime,
    l.location_x AS map_x,
    l.location_y AS map_y,
    rs.description AS status
FROM request r
JOIN request_type rt
    ON rt.id = r.id_request_type
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
JOIN location l
    ON l.id = r.id_location
JOIN region rg
    ON rg.id = l.id_region
JOIN business b
    ON b.id = rg.id_business
JOIN request_status rs
    ON rs.id = r.id_request_status
WHERE r.agreed_date >= :period_start
  AND r.agreed_date < :period_end
ORDER BY r.agreed_date, r.id;

-- 5) Filtros/contadores por unidade de negócio.
-- Mapeia para plannedRequestFilterOptions[].
SELECT
    b.id AS business_id,
    b.name AS label,
    COUNT(r.id) AS count
FROM business b
LEFT JOIN region rg
    ON rg.id_business = b.id
LEFT JOIN location l
    ON l.id_region = rg.id
LEFT JOIN request r
    ON r.id_location = l.id
    AND r.agreed_date >= :period_start
    AND r.agreed_date < :period_end
GROUP BY b.id, b.name
ORDER BY b.name;
