CREATE TABLE IF NOT EXISTS activity_request (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Fechado')),
  has_unread_message BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO activity_request (id, title, status, has_unread_message, created_at)
VALUES
  (212, 'Teste10', 'Aberto', false, '2026-04-29 10:38:00-03'),
  (213, 'Reparos em móveis', 'Aberto', false, '2026-04-29 11:35:00-03'),
  (214, 'Pintura de segurança/operacional/predial/metálica', 'Aberto', false, '2026-04-29 11:38:00-03'),
  (215, 'Reparos em móveis', 'Aberto', false, '2026-04-29 11:39:00-03'),
  (218, 'Outros', 'Aberto', true, '2026-04-29 13:25:00-03'),
  (219, 'Pintura de segurança/operacional/predial/metálica', 'Aberto', false, '2026-04-29 13:28:00-03'),
  (17, 'Interruptor ou Tomada com defeito/quebrado', 'Fechado', false, '2026-03-12 10:28:00-03'),
  (217, 'Outros', 'Fechado', false, '2026-04-29 13:15:00-03')
ON CONFLICT (id) DO NOTHING;

SELECT setval('activity_request_id_seq', COALESCE((SELECT MAX(id) FROM activity_request), 1));
