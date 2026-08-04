-- ============================================================
-- OpsHub Facilities - Minhas solicitações page queries
-- Base schema: SqlScripts/CreateTables/CREATE_ALL_TABLES.sql
-- Objetivo: substituir requests[] e agrupamentos em memória.
-- ============================================================

-- Parâmetros esperados:
-- :requester_member_id INTEGER  -- membershipUserId do usuário logado/solicitante
-- :search TEXT                  -- termo opcional de busca; enviar NULL quando não houver
-- :status_description TEXT      -- filtro opcional; enviar NULL para todos
-- :limit INTEGER
-- :offset INTEGER

-- 1) Lista paginada das minhas solicitações.
-- Mapeia para RequestViewModel[]. O schema atual não possui mensagens,
-- portanto has_unread_message é retornado como FALSE até existir tabela própria.
SELECT
    r.id,
    COALESCE(st.name, rt.name, 'Solicitação') AS title,
    r.created_date AS created_at,
    CASE
        WHEN rs.description IN ('Concluída', 'Cancelada') THEN 'Fechado'
        ELSE 'Aberto'
    END AS status,
    FALSE AS has_unread_message,
    rt.name AS request_type,
    sc.name AS category,
    st.name AS service_type,
    l.name AS location,
    r.description
FROM request r
JOIN request_status rs
    ON rs.id = r.id_request_status
JOIN request_type rt
    ON rt.id = r.id_request_type
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
LEFT JOIN location l
    ON l.id = r.id_location
WHERE r.id_member_requester = :requester_member_id
  AND (:status_description IS NULL OR rs.description = :status_description)
  AND (
      :search IS NULL
      OR CAST(r.id AS TEXT) ILIKE '%' || :search || '%'
      OR st.name ILIKE '%' || :search || '%'
      OR rt.name ILIKE '%' || :search || '%'
      OR r.description ILIKE '%' || :search || '%'
  )
ORDER BY r.created_date DESC NULLS LAST, r.id DESC
LIMIT :limit
OFFSET :offset;

-- 2) Contadores por agrupamento Aberto/Fechado para os headers da tela.
-- A UI atual trabalha com Aberto e Fechado. No schema atual, 'Concluída'
-- e 'Cancelada' são tratadas como Fechado; demais status ficam no grupo Aberto.
SELECT
    CASE
        WHEN rs.description IN ('Concluída', 'Cancelada') THEN 'Fechado'
        ELSE 'Aberto'
    END AS request_group,
    COUNT(*) AS total
FROM request r
JOIN request_status rs
    ON rs.id = r.id_request_status
WHERE r.id_member_requester = :requester_member_id
GROUP BY 1
ORDER BY request_group;

-- 3) Detalhe de uma solicitação do usuário, para futura tela/modal de ações.
-- Parâmetros adicionais: :request_id INTEGER
SELECT
    r.id,
    r.created_date AS created_at,
    r.agreed_date AS planned_datetime,
    r.started_date,
    r.finished_date,
    r.canceled_date,
    r.description,
    r.id_member_requester AS requester_member_id,
    r.id_member_responder AS responder_member_id,
    rt.name AS request_type,
    rs.description AS status,
    sc.name AS category,
    st.name AS service_type,
    b.name AS business_unit,
    rg.name AS region,
    l.name AS location
FROM request r
JOIN request_type rt
    ON rt.id = r.id_request_type
JOIN request_status rs
    ON rs.id = r.id_request_status
JOIN service_type st
    ON st.id = r.id_service_type
JOIN service_category sc
    ON sc.id = st.id_service_category
LEFT JOIN location l
    ON l.id = r.id_location
LEFT JOIN region rg
    ON rg.id = l.id_region
LEFT JOIN business b
    ON b.id = rg.id_business
WHERE r.id = :request_id
  AND r.id_member_requester = :requester_member_id;
