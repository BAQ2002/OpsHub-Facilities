
INSERT INTO REQUEST_TYPE (name) VALUES
    ('Chamado'),
    ('Atividade de Pátio')
ON CONFLICT (name) DO NOTHING;

INSERT INTO REQUEST_STATUS (description) VALUES
    ('Aberto'),
    ('Programada'),
    ('Em andamento'),
    ('Concluída')
ON CONFLICT (description) DO NOTHING;
