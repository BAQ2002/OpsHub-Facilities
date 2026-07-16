-- ============================================================
-- OpsHub Facilities - Solicitar atividade form queries/mutations
-- Base schema: SqlScritps/CreateTables/CREATE_ALL_TABLES.sql
-- Objetivo: alimentar combos e persistir novas solicitações.
-- ============================================================

-- 1) Unidades de negócio para selects.
SELECT
    id,
    name
FROM business
ORDER BY name;

-- 2) Categorias de serviço para selects/filtros.
SELECT
    id,
    name
FROM service_category
ORDER BY name;

-- 3) Tipos de serviço por categoria opcional.
-- Parâmetro: :service_category_id INTEGER -- opcional; NULL para todos
SELECT
    st.id,
    st.name,
    st.description,
    sc.id AS service_category_id,
    sc.name AS service_category_name
FROM service_type st
JOIN service_category sc
    ON sc.id = st.id_service_category
WHERE (:service_category_id IS NULL OR sc.id = :service_category_id)
ORDER BY sc.name, st.name;

-- 4) Locais por unidade de negócio opcional.
-- Parâmetro: :business_id INTEGER -- opcional; NULL para todos
SELECT
    l.id,
    l.name,
    l.location_x,
    l.location_y,
    rg.id AS region_id,
    rg.name AS region_name,
    b.id AS business_id,
    b.name AS business_name
FROM location l
JOIN region rg
    ON rg.id = l.id_region
JOIN business b
    ON b.id = rg.id_business
WHERE (:business_id IS NULL OR b.id = :business_id)
ORDER BY b.name, rg.name, l.name;

-- 5) Setores para identificar perfis/áreas vinculadas ao usuário.
SELECT
    id,
    name,
    access_levels
FROM sector
ORDER BY name;

-- 6) Inserção de solicitação do tipo Chamado.
-- Parâmetros esperados:
-- :requester_member_id INTEGER
-- :responder_member_id INTEGER       -- opcional; NULL quando ainda não houver responsável
-- :location_id INTEGER               -- opcional
-- :service_type_id INTEGER
-- :status_id INTEGER                 -- normalmente status 'Aberto'
-- :planned_datetime TIMESTAMP        -- gravado em agreed_date conforme schema atual
-- :description VARCHAR(200)
INSERT INTO request (
    id_member_requester,
    id_member_responder,
    id_location,
    id_request_type,
    id_service_type,
    id_request_status,
    created_date,
    agreed_date,
    description
)
SELECT
    :requester_member_id,
    :responder_member_id,
    :location_id,
    rt.id,
    :service_type_id,
    :status_id,
    NOW(),
    :planned_datetime,
    :description
FROM request_type rt
WHERE rt.name = 'Chamado'
RETURNING id;

-- 7) Inserção de solicitação do tipo Atividade de Pátio.
-- Usa a mesma tabela request, variando id_request_type.
INSERT INTO request (
    id_member_requester,
    id_member_responder,
    id_location,
    id_request_type,
    id_service_type,
    id_request_status,
    created_date,
    agreed_date,
    description
)
SELECT
    :requester_member_id,
    :responder_member_id,
    :location_id,
    rt.id,
    :service_type_id,
    :status_id,
    NOW(),
    :planned_datetime,
    :description
FROM request_type rt
WHERE rt.name = 'Atividade de Pátio'
RETURNING id;

-- 8) Registro de proposta/programação de atendimento.
-- O schema atual não possui request_aprove; o fluxo equivalente deve ser
-- registrado em request_transaction.
-- Parâmetros esperados:
-- :request_id INTEGER
-- :requester_member_id INTEGER
-- :responder_member_id INTEGER
-- :transaction_status_id INTEGER
-- :proposed_date TIMESTAMP
-- :description VARCHAR(200)
INSERT INTO request_transaction (
    id_request,
    id_member_requester,
    id_member_responder,
    id_transaction_status,
    requested_date,
    proposed_date,
    description
)
VALUES (
    :request_id,
    :requester_member_id,
    :responder_member_id,
    :transaction_status_id,
    NOW(),
    :proposed_date,
    :description
)
RETURNING id;
