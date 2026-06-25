-- =========================
-- SERVICE_CATEGORY
-- =========================
INSERT INTO LOCATIONS (ID, NAME) VALUES (1, 'ARTÍFICE');

-- =========================
-- BUSINESS
-- =========================
INSERT INTO BUSINESS (ID, NAME) VALUES (1, 'TECON Salvador');
INSERT INTO BUSINESS (ID, NAME) VALUES (2, 'Centro Logístico Salvador');

-- =========================
-- REGIONS
-- =========================

INSERT INTO REGIONS (ID, id_business, NAME) VALUES (1, 1, 'Prédio Administrativo');
INSERT INTO REGIONS (ID, id_business, NAME) VALUES (2, 1, 'Almoxarifado');
INSERT INTO REGIONS (ID, id_business, NAME) VALUES (3, 1, 'Armazém');
INSERT INTO REGIONS (ID, id_business, NAME) VALUES (4, 1, 'Manutenção');
INSERT INTO REGIONS (ID, id_business, NAME) VALUES (5, 1, 'Pàtio Operacional');


-- =========================
-- LOCATIONS
-- =========================

INSERT INTO LOCATIONS (ID, ID_REGION, NAME) VALUES (5, 1, 'Fila A - Lote 12');
INSERT INTO LOCATIONS (ID, ID_REGION, NAME) VALUES (5, 1, 'Pàtio Operacional');
INSERT INTO LOCATIONS (ID, ID_REGION, NAME) VALUES (5, 1, 'Pàtio Operacional');
INSERT INTO LOCATIONS (ID, ID_REGION, NAME) VALUES (5, 1, 'Pàtio Operacional');
