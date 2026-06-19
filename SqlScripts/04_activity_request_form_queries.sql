-- ============================================================
-- OpsHub Facilities - Solicitar atividade form queries/mutations
-- Base schema: SqlScritps/Create_Tables.sql
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
    l.description,
    l.location_x,
    l.location_y,
    rg.id AS region_id,
    rg.name AS region_name,
    b.id AS business_id,
    b.name AS business_name
FROM locations l
JOIN regions rg
    ON rg.id = l.id_region
JOIN business b
    ON b.id = rg.id_business
WHERE (:business_id IS NULL OR b.id = :business_id)
ORDER BY b.name, rg.name, l.name;

-- 5) Setores para identificar solicitante/responsável.
SELECT
    id,
    name
FROM sector
ORDER BY name;

-- 6) Inserção de solicitação do tipo Chamado.
-- Parâmetros esperados:
-- :requester_sector_id INTEGER
-- :responsible_sector_id INTEGER
-- :location_id INTEGER
-- :service_type_id INTEGER
-- :status_id INTEGER              -- normalmente status 'Aberto'
-- :planned_datetime TIMESTAMP
-- :images_endpoint VARCHAR(200)
-- :description VARCHAR(100)
INSERT INTO requests (
    id_sector_requester,
    id_sector_responsible,
    id_location,
    id_request_type,
    id_service_type,
    id_status,
    ocurrence_datetime,
    planned_datetime,
    images_endpoint,
    description
)
SELECT
    :requester_sector_id,
    :responsible_sector_id,
    :location_id,
    rt.id,
    :service_type_id,
    :status_id,
    NOW(),
    :planned_datetime,
    :images_endpoint,
    :description
FROM requests_types rt
WHERE rt.name = 'Chamado'
RETURNING id;

-- 7) Inserção de solicitação do tipo Atividade de Pátio.
-- Usa a mesma tabela requests, variando id_request_type.
INSERT INTO requests (
    id_sector_requester,
    id_sector_responsible,
    id_location,
    id_request_type,
    id_service_type,
    id_status,
    ocurrence_datetime,
    planned_datetime,
    images_endpoint,
    description
)
SELECT
    :requester_sector_id,
    :responsible_sector_id,
    :location_id,
    rt.id,
    :service_type_id,
    :status_id,
    NOW(),
    :planned_datetime,
    :images_endpoint,
    :description
FROM requests_types rt
WHERE rt.name = 'Atividade de Pátio'
RETURNING id;

-- 8) Aprovação/programação de uma solicitação, quando a operação do pátio
-- precisar registrar lote/local e equipe responsável no fluxo request_aprove.
-- Parâmetros esperados:
-- :request_id INTEGER
-- :responsible_sector_id INTEGER
-- :batch_location_id INTEGER
-- :service_type_id INTEGER
-- :planned_datetime TIMESTAMP
-- :description VARCHAR(100)
INSERT INTO request_aprove (
    id_request,
    id_sector_responsible,
    id_batch,
    id_service_type,
    planned_datetime,
    description
)
VALUES (
    :request_id,
    :responsible_sector_id,
    :batch_location_id,
    :service_type_id,
    :planned_datetime,
    :description
)
RETURNING id;
