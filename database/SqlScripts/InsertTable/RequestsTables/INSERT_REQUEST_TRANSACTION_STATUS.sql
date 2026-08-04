INSERT INTO REQUEST_TRANSACTION_STATUS (ID, name) VALUES
    (1, 'Solicitada'),
    (2, 'Aprovada'),
    (3, 'Retornada'),
    (4, 'Cancelada')
ON CONFLICT (ID) DO NOTHING;

