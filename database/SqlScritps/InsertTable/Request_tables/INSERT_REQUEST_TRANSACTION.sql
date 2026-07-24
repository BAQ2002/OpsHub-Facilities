
INSERT INTO REQUEST_TRANSACTION (ID, name) VALUES
    (1, 'Chamado'),
    (2, 'Atividade de Pátio')
ON CONFLICT (ID) DO NOTHING;

