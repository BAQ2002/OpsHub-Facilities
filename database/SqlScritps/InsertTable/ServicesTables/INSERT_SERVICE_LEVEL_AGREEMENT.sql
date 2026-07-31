-- ================================== REGION ================================== --
INSERT INTO SERVICE_LEVEL_AGREEMENT ( ID, NAME, DESCRIPTION, DEADLINE) 
VALUES ( 1, 'Baixa prioridade', 'Este SLA deve ser aplicado em chamados de baixa prioridade.', INTERVAL '1' DAY);

INSERT INTO SERVICE_LEVEL_AGREEMENT ( ID, NAME, DESCRIPTION, DEADLINE)  
VALUES ( 2, 'Média prioridade', 'Este SLA deve ser aplicado em chamados de média criticidade.', INTERVAL '2' DAY);

INSERT INTO SERVICE_LEVEL_AGREEMENT ( ID, NAME, DESCRIPTION, DEADLINE)  
VALUES ( 3, 'Alta prioridade', 'Este SLA deve ser aplicado em chamados de alta prioridade.', INTERVAL '5' DAY);

INSERT INTO SERVICE_LEVEL_AGREEMENT ( ID, NAME, DESCRIPTION, DEADLINE)  
VALUES ( 4, 'Crítica', 'Este SLA deve ser aplicado em chamados de alta criticidade, que afetem a operação.', INTERVAL '7' DAY);

