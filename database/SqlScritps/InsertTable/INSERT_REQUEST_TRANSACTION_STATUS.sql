INSERT INTO TRANSACTION_STATUS (ID, name) VALUES
    (1, 'Solicitada'),
    (2, 'Aprovada'),
    (3, 'Retornada'),
    (4, 'Reprovada'),
    (5, 'Cancelada')
ON CONFLICT (ID) DO NOTHING;

