-- ============================================================
-- OpsHub Facilities - Minhas solicitações page queries
-- Base schema: SqlScritps/Create_Tables.sql
-- Objetivo: substituir requests[] e agrupamentos em memória.
-- ============================================================

-- Parâmetros esperados:
-- :requester_sector_id INTEGER -- setor do usuário logado/solicitante
-- :search TEXT                 -- termo opcional de busca; enviar NULL quando não houver
-- :status_description TEXT     -- filtro opcional; enviar NULL para todos
-- :limit INTEGER
-- :offset INTEGER

-- 1) Lista paginada das minhas solicitações.
-- Mapeia para RequestViewModel[]. O schema atual não possui mensagens,
-- portanto has_unread_message é retornado como FALSE até existir tabela própria.
SELECT
    r.id,
    COALESCE(st.name, rt.name, 'Solicitação') AS title,
    r.ocurrence_datetime AS created_at,
    s.description AS status,
    FALSE AS has_unread_message,
    rt.name AS request_type,
    sc.name AS category,
    st.name AS service_type,
    l.name AS location,
    r.description
FROM requests r
JOIN status s
    ON s.id = r.id_status
JOIN requests_types rt
    ON rt.id = r.id_request_type
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
JOIN locations l
    ON l.id = r.id_location
WHERE r.id_sector_requester = :requester_sector_id
  AND (:status_description IS NULL OR s.description = :status_description)
  AND (
      :search IS NULL
      OR CAST(r.id AS TEXT) ILIKE '%' || :search || '%'
      OR st.name ILIKE '%' || :search || '%'
      OR rt.name ILIKE '%' || :search || '%'
      OR r.description ILIKE '%' || :search || '%'
  )
ORDER BY r.ocurrence_datetime DESC NULLS LAST, r.id DESC
LIMIT :limit
OFFSET :offset;

-- 2) Contadores por agrupamento Aberto/Fechado para os headers da tela.
-- A UI atual trabalha com Aberto e Fechado. No schema atual, 'Concluída'
-- é tratada como Fechado; demais status ficam no grupo Aberto.
SELECT
    CASE
        WHEN s.description = 'Concluída' THEN 'Fechado'
        ELSE 'Aberto'
    END AS request_group,
    COUNT(*) AS total
FROM requests r
JOIN status s
    ON s.id = r.id_status
WHERE r.id_sector_requester = :requester_sector_id
GROUP BY 1
ORDER BY request_group;

-- 3) Detalhe de uma solicitação do usuário, para futura tela/modal de ações.
-- Parâmetros adicionais: :request_id INTEGER
SELECT
    r.id,
    r.ocurrence_datetime AS created_at,
    r.planned_datetime,
    r.images_endpoint,
    r.description,
    requester.name AS requester_sector,
    responsible.name AS responsible_sector,
    rt.name AS request_type,
    s.description AS status,
    sc.name AS category,
    st.name AS service_type,
    b.name AS business_unit,
    rg.name AS region,
    l.name AS location
FROM requests r
JOIN sector requester
    ON requester.id = r.id_sector_requester
JOIN sector responsible
    ON responsible.id = r.id_sector_responsible
JOIN requests_types rt
    ON rt.id = r.id_request_type
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
JOIN business b
    ON b.id = rg.id_business
WHERE r.id = :request_id
  AND r.id_sector_requester = :requester_sector_id;
