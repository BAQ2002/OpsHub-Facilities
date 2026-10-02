-- PostgreSQL: aplicar depois da renomeacao para OHFC_, com a API parada.
-- Usa o contexto da conexao, sem especificar schema proprietario.
-- Valores nulos de ACCESS_LEVELS ou FILE_SIZE nao convertivel para INTEGER
-- impedem a migracao. Corrija os dados de origem antes de repetir a transacao.
-- Nao altera nomes de colunas nem preenche valores automaticamente.

BEGIN;

ALTER TABLE OHFC_SECTOR
    ALTER COLUMN ACCESS_LEVELS SET NOT NULL;

ALTER TABLE OHFC_REQUEST_TASK_MEDIA
    ALTER COLUMN FILE_SIZE TYPE INTEGER USING FILE_SIZE::INTEGER;

COMMIT;
