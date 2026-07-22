INSERT INTO REQUEST_STATUS (ID, description) VALUES
    (1,'Em aberto'),
    (2,'Programada'),
    (3,'Em andamento'),
    (4,'Concluída'),
    (5,'Cancelada')
ON CONFLICT (ID) DO NOTHING;