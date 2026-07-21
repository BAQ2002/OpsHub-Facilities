
INSERT INTO REQUEST_TYPE (ID, name) VALUES
    (1, 'Chamado'),
    (2, 'Atividade de Pátio')
ON CONFLICT (ID) DO NOTHING;

INSERT INTO REQUEST_STATUS (ID, description) VALUES
    (1,'Em aberto'),
    (2,'Programada'),
    (3,'Em andamento'),
    (4,'Concluída'),
    (5,'Cancelada')
ON CONFLICT (ID) DO NOTHING;
