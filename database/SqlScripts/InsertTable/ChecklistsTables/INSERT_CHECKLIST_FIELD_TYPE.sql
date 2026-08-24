-- ============================================================
-- OpsHub - Carga inicial completa de CHECKLIST_FIELD_TYPE
-- Origem: 34 arquivos XLSX (20 do primeiro lote + 14 do segundo lote).
-- Regras aplicadas:
--   * Abas adicionais desconsideradas.
--   * Campos auxiliares importados.
--   * NA normalizado para "NÃO APLICÁVEL".
--   * DISPLAY_ORDER segue a ordem visual/lógica do formulário.
-- Dependência: execute INSERT_CHECKLIST_TYPE_COMPLETO_34.sql primeiro.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 01. BOMBA LAMEIRA/VÁCUO | Rev. 01/2018 | Fonte: CHECK LIST - BOMBA VACUO_01.2018(1).xlsx
-- 9 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('A mangueira de alta pressão encontra-se íntegra. (não possui marcas de dobras ou vazamentos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Foi verificado as condições dos cabos elétricos, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: rodas, punho, conexões, molas e calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Verificado a integridade física do sistema das conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Verificar nível de lubrificante', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 20),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 24),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 25),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 26),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 27),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 28)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'BOMBA LAMEIRA/VÁCUO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 02. CJ BARCO E MOTOR | Rev. 01/2018 | Fonte: CHECK LIST - CJ BARCO E MOTOR 01.2018(1).xlsx
-- 14 itens de inspeção + 18 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 5),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 6),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 7),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 9),
        ('O colaborador habilitado e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 10),
        ('Cada pessoa a bordo dispõe de um colete salva-vidas individual e de tamanho apropriado e boia tipo rosca disponível?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('A capacidade máxima de 1 tripulante e 3 passageiros está respeitada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Verificado se há vazamento no casco do barco?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O motor não possui menhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('As condições gerais do motor tais como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estár com a cor leitosa)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos  e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O motor de popa está adequadamente preso ao barco?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('O remo está disponível e em bom estado no barco?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O sistema de direção encontra-se em  boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Condições do filtro de ar ( verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 28),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 29),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 30),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 31),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 32)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'CJ BARCO E MOTOR'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 03. COMPACTADOR A PERCUSSÃO | Rev. 01/2018 | Fonte: CHECK LIST - COMPACTADOR A PERCUSSÃO_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento trabalhará somente sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Condições do filtro de ar (verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'COMPACTADOR A PERCUSSÃO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 04. ESMERIL | Rev. 01/2018 | Fonte: CHECK LIST - ESMERIL_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O equipameto fixo sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O sistema de proteções do rebolo está bem fixado e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O rebolo instalado possui capacidade nominal maior ou igual a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O rebolo está sem desgaste excessivo ou trinca que comprometa a segurança na operação do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Verifique-se de que o rebolo esteja girando livremente antes de ligar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ESMERIL'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 05. ESMERILHADEIRA / LIXADEIRA OU POLICORTE | Rev. 01/2018 | Fonte: CHECK LIST - ESMERILHADEIRA-LIXADEIRA OU POLICORTE_01.2018(1).xlsx
-- 12 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compatível com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definido o tipo de disco e acessórios adequados ao tipo de trabalho a ser excutado.(disco corte/desbaste para aço carbono, inox, escovas rotativas e lixas)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O(s) disco(s) estão em boas condições não apresentam deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O sistema de proteções do disco está bem fixado e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O disco instalado possui capaciadade nominal maior ou igual a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O equipamento fixo sob superficie plana estável? (aplicável apenas a policorte).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('A chave para troca do disco acompanha o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Verifique-se de que o disco esteja girando livremente antes de ligar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 27),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 28),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 29),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 30),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 31)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ESMERILHADEIRA / LIXADEIRA OU POLICORTE'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 06. FURADEIRA SDS e MANDRIL / PARAFUSADEIRA / MARTELO PERFURADOR | Rev. 01/2018 | Fonte: CHECK LIST - FURADEIRA DE IMPACTO-PARAFUSADEIRA- MARTELO PERFURADOR_01.2018(1).xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compatível com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definidido o uso das brocas e acessórios adequados ao tipo de trabalho a ser excutado.(brocas para madeira, aço, concreto, encaixe soquetes)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('A(s) brocas(s) estão afiadas e em boas condições não apresentão deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O mandril encontra-se em boas condições, não apresenta folga demasiada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O diâmetro da broca é compatível com mandril?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('A chave de mandril acompanha o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Bateria recarregada? (para equipamentos a bateria).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'FURADEIRA SDS e MANDRIL / PARAFUSADEIRA / MARTELO PERFURADOR'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 07. GERADOR | Rev. 00/2018 | Fonte: CHECK LIST - GERADOR_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (cor e transparência clara, tipo cor de mel, aspecto de cor tipo leitoso ou café)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Condições do filtro de ar (verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Foi verificado se o quadro de acionamento elétrico está em bom estado de funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Nível de fluido de arrefecimento do radiador?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'GERADOR'
  AND CT.VERSION = '00/2018';

-- ------------------------------------------------------------
-- 08. GRAB | Rev. 01/2018 | Fonte: CHECK LIST - GRAB_01.2018(1).xlsx
-- 13 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O equipamento foi liberado para utilização pela área de manutenção?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('A carga da bateria foi medida e está apto a suportar a jornada de trabalho?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('A mangueira de alta pressão e cilindro encontra-se integras. (não possui marcas de deformações e/ou vazamentos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('A caixa do sisitema hidráulico foi pressurizado com gás nitrogênio 2kgf e não apresentam vazamentos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('As condições gerais do equipamento tais como: estrutura da mandíbula, lâmina da mandibula, juntas de soldagem, parafusos, porcas e acessórios estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('A lingada do equipamento está compátivel com o projetado na IT ou Plano Rigging?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('As condições dos acessórios de lingada, anelões, manilhas, cabos de aço, balancim e olhais estão livres de deformações, fissuras, dobras e saltamento da alma do Cabo de aço.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Os acessórios de linga estão certificados e com a certificação dentro da validade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('As partes móveis do equipamento tais como: engrenagens, roldanas e articulações estão devidamente lubrificados.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O controle do Grab foi testado e responde os comandos normalmente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('O manômetro da caixa do sistema hidráulico está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Verificado o nível de nitrogênio (manter 2kgf)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 28),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 29),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 30),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 31),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 32)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'GRAB'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 09. CONJUNTO OXI-ACETILENO | Rev. 01/2018 | Fonte: CHECK LIST - MAÇARICO_01.2018(1).xlsx
-- 13 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('As tubulações flexíveis-mangueiras possuem cores convencionais (oxigênio-verde; acetileno-vermelho)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Há válvulas de retrocesso de chama, no regulador e na caneta – linhas de oxigênio e acetileno?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O regulador de pressão é específico para cada gás e possui válvula de segurança?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('As condições gerais do equipamento e carrinho e transporte como: Rodas, punho, conexões, molas e calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Os cilindros estão dispostos sobre carrinhos apropriados e devidamente amarrados com corrente ?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('As roscas das conexões são auto-vedantes? E não há utilização de fitas ou outros materiais p/ vedação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Verificado a integridade física do sistema das conexões do equipamento bem como mangueira de alta pressão não possui marcas de dobras ou vazamentos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Os manometros estão integros, funcionando normalmente e com as aferições validas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Os cilindros possuem a rotulagem correspondente e a FISPQ encontra-se junto ao cilindro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Todo o conjunto oxi-acetileno está livre de contaminação de oleos ou graxas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Os  bicos de corte estão em boas condições de uso, não contem estão sujos  e/ou entopidos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 28),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 29),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 30),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 31),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 32)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'CONJUNTO OXI-ACETILENO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 10. MAÇARICO GLP | Rev. 01/2018 | Fonte: CHECK LIST - MAÇARICO_GLP_2025(1).xlsx
-- 12 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('As tubulações flexíveis-mangueiras possuem cores convencionais (em toda extenção do botijão ao maçatico), ?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Há válvulas de retrocesso de chama?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O regulador de pressão é específico para o GLP possui válvula de segurança?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('As roscas das conexões são auto-vedantes? E não há utilização de fitas ou outros materiais p/ vedação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Verificado a integridade física do sistema das conexões do equipamento bem como mangueira de alta pressão não possui marcas de dobras ou vazamentos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Os cilindros possuem a rotulagem correspondente e a FISPQ encontra-se junto ao botijão?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Verificar se o maçarico está limpo e sem obstruções.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Verificar a existência de rachaduras ou danos no corpo do maçarico.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Confirmar que o gatilho de ignição funciona corretamente.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Checar se há desgaste visível na ponta do maçarico (verifique se a chama está estável e ajustada corretamente).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 27),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 28),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 29),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 30),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 31)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MAÇARICO GLP'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 11. MÁQUINA DE PINTURA AIRLESS | Rev. 01/2018 | Fonte: CHECK LIST - MAQUINA DE PINTURA AIRLESS_01.2018(1).xlsx
-- 13 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruido e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos  e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Condições do filtro de ar ( verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('O dispositivo de segurança da pistola está em bom estado de funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('O sistema de válvula de retorno está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 28),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 29),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 30),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 31),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 32)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MÁQUINA DE PINTURA AIRLESS'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 12. PERFURATRIZ | Rev. 01/2018 | Fonte: CHECK LIST - PERFURATRIZ_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compatível com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definido o uso de serra-copo, e acessórios adequados ao tipo de trabalho a ser executado.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O equipamento fixo sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Serra copo está em boas condições e não apresenta deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Verificado se serra copo está bem afixado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('A proteção contra projeção de partículas está instalada e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'PERFURATRIZ'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 13. PLACA VIBRATÓRIA | Rev. 01/2018 | Fonte: CHECK LIST - PLACA VIBRATÓRIA_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos  e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Condições do filtro de ar (verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'PLACA VIBRATÓRIA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 14. SERRA TICO TICO | Rev. 01/2018 | Fonte: CHECK LIST - SERRA TICO TICO_01.2018(1).xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definidido o tipo de disco e acessórios adequados ao tipo de trabalho a ser excutado.(discos para madeira, concreto e cerâmica)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O(s) disco(s) estão em boas condições não apresentam deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O sistema de proteções do disco está bem fixado e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O disco instalado possui capacidade nominal maior ou igual a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O disco está sem desgaste excessivo ou trinca que comprometa a segurança na operação do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Verifique-se de que o disco de corte esteja girando livremente antes de ligar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'SERRA TICO TICO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 15. ANDAIME | Rev. 06/2019 | Fonte: CHECK LIST - ANDAIME_01.2018(1).xlsx
-- 12 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Os componentes metálicos e de madeira estão sem sinais de quebra, fissuras, deformação ou corrosão?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Os montantes possuem travamentos (pinos, parafusos, braçadeiras, etc.) contra o desencaixe acidental?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O piso de trabalho possui forração completa, antiderrapante, nivelado, travado e resistente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O perimetro está protegido por guarda-corpo de 1,20 m, travessão intermediário de 0,70 m e rodapé de 0,20 m?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O acesso para o interior do andaime é protegido contra abertura acidental (portão ou cancela)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Os montantes estão apoiados em sapatas sobre base nivelada e resistente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Possui escada de acesso instalada quando o piso de trabalho estiver a mais de 1,0 m de altura?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O ponto de içar materiais não compromete a estabilidade e segurança do andaime?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('A torre está fixada à estrutura fixa estável independente de modo a resistir aos esforços e oscilações?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('A torre quando não fixada, não excede em altura, quatro vezes a menor dimensão da base de apoio?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Os rodízios são providos de travas de modo a evitar deslocamentos acidentais?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 27),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 28),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 29),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 30),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 31)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ANDAIME'
  AND CT.VERSION = '06/2019';

-- ------------------------------------------------------------
-- 16. BETONEIRA | Rev. 01/2018 | Fonte: CHECK LIST - BETONEIRA_01.2018(1).xlsx
-- 9 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Pontos de lubrificação (05 graxeiras) lubrificadas conforme manual?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Fios, tomadas, motor seco e/ou sem umidade (inspeção visual sem acessar partes elétricas)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('As condições gerais do equipamento como: rodas, punho, conexões, molas e calços, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Verificado se a tensão no local é compatível com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento esta aterrado a malha de aterramento.', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O  dispositivo de segurança,  botão de desligar (vermelho) está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 20),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 24),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 25),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 26),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 27),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 28)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'BETONEIRA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 17. CINTO DE SEGURANÇA E TALABARTE | Rev. 01/2018 | Fonte: CHECK LIST - CINTO DE SEGURANÇA_01.2018 (1)(1).xlsx
-- 9 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('As etiquetas informativas estão fixas no cinto de segurança e talabarte, com suas informações visíveis?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Os componentes têxteis estão sem corte, desgaste, perfuração, fibras soltas ou costuras rompidas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Os componentes têxteis  estão sem queimaduras ou ressecamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O absorvedor de energia está sem sinal de ruptura ou rasgamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Os componentes plásticos (fivelas e passadores) estão sem avarias, rasgos ou ressecamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Os componentes metálicos estão sem sinais de quebra, fissuras, deformação ou corrosão?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Os conectores metálicos com trava dupla e automática, funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Os equipamentos sem nenhuma alteração ou reparo?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 20),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 24),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 25),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 26),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 27),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 28)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'CINTO DE SEGURANÇA E TALABARTE'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 18. COMPRESSOR DE AR | Rev. 01/2018 | Fonte: CHECK LIST - COMPRESSOR DE AR_01.2018(1).xlsx
-- 14 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('A mangueira de alta pressão encontra-se integra. (não possui marcas de dobras ou vazamentos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (cor e transparencia clara, tipo cor de mel, aspecto de cor tipo leitoso ou café)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Gatilho em bom estado de uso e funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Foi verificado as condições dos cabos elétricos, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('As condições gerais do equipamento como: rodas, punho, conexões, molas e calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Verificado se a tensão no local é compatível com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Verificado a integridade física do sistema das conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('O equipamento trabalhará somente sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('O  dispositivo de segurança (gatilho da pistola) está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 28),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 29),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 30),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 31),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 32),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 33)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'COMPRESSOR DE AR'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 19. ENCERADEIRA | Rev. 01/2018 | Fonte: CHECK LIST - ENCERADEIRA_01.2018(1).xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: Carcaça, calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O equipameto  trabalhara sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O sistema de proteções da escova ou disco está bem fixado e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('A escova ou disco instalada é compativel com equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O escova ou disco está sem desgaste excessivo ou sujeira que comprometa a segurança na operação do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Certifique-se que o sg esteja girando livremente antes de ligar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ENCERADEIRA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 20. ESCADA PORTÁTIL | Rev. 01/2018 | Fonte: CHECK LIST - ESCADA PORTÁTIL_01.2018(1).xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado para manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Os elementos verticais (montantes) para fixação dos degraus (travessas) estão em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Os degraus (travessas), possui antiderrapantes bem fixados aos montantes?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('A estrutura da escada é rígida, estável e segura?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Componentes metálicos (parafusos, rebites, dobradiças) estão em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Os montantes da escada possuem sapatas antiderrapantes na sua base inferior?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Os limitadores de abertura da escada de abrir são confeccionados com material rígido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Roldanas, guias, catracas da escada extensível em perfeito estado de funcionamento e conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('A corda para manobra da escada extensível sem desgaste ou desfiada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Limitador de curso da escada extensível fixado, garantindo a sobreposição segura quando estendida?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O limite máximo de carga da escada está visível e a carga está compatível?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ESCADA PORTÁTIL'
  AND CT.VERSION = '01/2018';

-- ============================================================
-- Segundo lote (14 arquivos)
-- ============================================================

-- ------------------------------------------------------------
-- 01. FURADEIRA DE BANCADA | Rev. 01/2018 | Fonte: CHECK LIST - FURADEIRA BANCADA_01.2018.xlsx
-- 12 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definidido o uso das brocas e acessórios adequados ao tipo de trabalho a ser excutado.(brocas para madeira, aço, concreto)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O equipamento fixo está sob superfície plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('A(s) brocas(s) estão afiadas e em boas condições não apresentão deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O diâmetro da broca é compatível com mandril?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O mandril encontra-se e em boas condições, não apresenta folga demasiada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('A chave de mandril acompanha o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('A proteção contra projeção de partículas está instalada e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 27),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 28),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 29),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 30),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 31)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'FURADEIRA DE BANCADA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 02. LAVADORA DE ALTA PRESSÃO A GASOLINA | Rev. 01/2018 | Fonte: CHECK LIST - LAVADORA DE ALTA PRESSÃO A GASOLINA_01.2018.xlsx
-- 14 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruido e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Condições do filtro de ar ( verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('O filtro de entrada de água foi verificado e encontra-se limpo?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O filtro de entrada de sucção de detergente foi verificado e encontra-se limpo?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('A mangueira de alta pressão encontra-se integra. (não possui marcas de dobras ou vasamentos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('O dispositivo de segurança (gatilho da pistola) está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 28),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 29),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 30),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 31),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 32),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 33)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'LAVADORA DE ALTA PRESSÃO A GASOLINA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 03. LAVADORA DE ALTA PRESSÃO ELÉTRICO | Rev. 01/2018 | Fonte: CHECK LIST - LAVADORA DE ALTA PRESSÃO ELETRICA_01.2018.xlsx
-- 12 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O filtro de entrada de água foi verificado e encontra-se limpo?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O filtro de entrada de sucção de detergente foi verificado e encontra-se limpo?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('A mangueira de alta pressão encontra-se integra. (não possui marcas de dobras ou vazamentos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Foi verificado as condições dos cabos elétricos, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('As condições gerais do equipamento como: rodas, punho, conexões, molas e calços, parafusos, porcas e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O óleo lubrificante foi está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Verificado a integridade física do sistema das conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('O ajuste do sistema de pressão está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('O equipamento trabalhará somente sob superfice plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('O dispositivo de segurança (Gatilho da pistola) está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 27),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 28),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 29),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 30),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 31)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'LAVADORA DE ALTA PRESSÃO ELÉTRICO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 04. MÁQUINA DE SOLDA | Rev. 01/2018 | Fonte: CHECK LIST - MAQUINA DE SOLDA_01.2018.xlsx
-- 13 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('A carcaça da máquina está em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Foi verificado as condições dos cabos elétricos e plugs, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As conexões estão em bom estado de conservação e está bem conectado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('A porta eletrodo está com isolamento íntegro e em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Foi considerado e disponibilizado o extintor de incêndio na atividade com maquina de solda?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('As condições gerais do equipamento e carrinho e transporte como: Rodas, punho, conexões, molas e calços, parafusos, porcas, alça de transporte, olhal de içamento e acessorios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Indicação de amperagem está disponível e legível?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('A manivela de regulagem da amperagem está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('A euiqueta de aferição do equipamento está valida e visivel?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('O sistema de ventilação está bem conservado e girando livremente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 28),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 29),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 30),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 31),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 32)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MÁQUINA DE SOLDA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 05. MARTELETE PNEUMÁTICO/ELETRICO | Rev. 01/2018 | Fonte: CHECK LIST - MARTELETE PNEUMÁTICO_01.2018.xlsx
-- 15 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (cor e transparencia clara, tipo cor de mel, aspecto de cor tipo leitoso ou café)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O equipamento trabalhará somente sob superficie plana estável?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Condições do filtro de ar (verificar quanto ao estado com relação à sujeira e/ou obstruções)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Nível de fluido de arrefecimento do radiador?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Foi verificado as condições dos engates e as mangueiras, se estão sem emendas ou descascadas e apropriadas para utilização?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Ponteira em bom estado de conservação (sem trincas, ferrugem e partes quebradas)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Gatilho em bom estado de uso e funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 25),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 28),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 29),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 30),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 31),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 32),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 33),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 34)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MARTELETE PNEUMÁTICO/ELETRICO'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 06. MINICARREGADEIRA | Rev. 01/2018 | Fonte: CHECK LIST - MINICARREGADEIRA_01.2018.xlsx
-- 32 itens de inspeção + 25 campos auxiliares
-- Documento original possui grade semanal S/T/Q/Q/S/S/D.
-- Na carga digital, cada item é representado por um único SELECT por execução
-- de REQUEST_TASK_CHECKLIST, preservando a estrutura atual do modelo.
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, FALSE, 1),
        ('HORIMETRO', 'NUMBER', NULL::JSONB, FALSE, 2),
        ('MARCA', 'TEXT', NULL::JSONB, FALSE, 3),
        ('TAG', 'TEXT', NULL::JSONB, FALSE, 4),
        ('SEMANA DATA - DE', 'DATE', NULL::JSONB, FALSE, 5),
        ('SEMANA DATA - ATÉ', 'DATE', NULL::JSONB, FALSE, 6),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 7),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Os filtros foram verificados?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 9),
        ('O nível de combustível foi verificado e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 10),
        ('O nível do óleo do motor foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O nível do óleo hidráulico foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O nível da água do radiador foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Tampa do tanque de combustível está conforme?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Caçamba foi verificada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Banco do operador verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Minecarregadeira esta sem vazamento de óleo , fluido ou outro líquido contaminante?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Minecarregadeira está limpa (carroceria e interior)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Sistema de comando (painel)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Carroceria (pintura)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Alarme de ré funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('A buzina funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Faróis dianteiros em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Faróis traseiros em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Pisca L/ Direito funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 25),
        ('Pisca L/ Esquerdo funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 26),
        ('Luz de ré funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 27),
        ('Luz de freio funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 28),
        ('Para-brisa dianteiro integro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 29),
        ('Para-brisa traseiro integro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 30),
        ('Os cintos de segurança estão em bom funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 31),
        ('A descarga (escapamento) está em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 32),
        ('Os retrovisores interno e extertos estão integros?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 33),
        ('O extintor está carregado e dentro do prazo de validade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 34),
        ('O freio de mão está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 35),
        ('Os pneus estão em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 36),
        ('Partida da máquina?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 37),
        ('Possui alarme de ré?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 38),
        ('Giroflex funcionando normalmente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 39),
        ('O motorista/ Operador está portando crachá e com data ASO valido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 40),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 41),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 42),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 43),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 44),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 45),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 46),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 47),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 48),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 49),
        ('Do setor', 'TEXT', NULL::JSONB, FALSE, 50),
        ('Para o Setor ou Empresa', 'TEXT', NULL::JSONB, FALSE, 51),
        ('Responsável pelo empréstimo', 'TEXT', NULL::JSONB, FALSE, 52),
        ('Matrícula do responsável pelo empréstimo', 'TEXT', NULL::JSONB, FALSE, 53),
        ('Receptor do equipamento', 'TEXT', NULL::JSONB, FALSE, 54),
        ('Matrícula do receptor', 'TEXT', NULL::JSONB, FALSE, 55),
        ('Motivo do empréstimo', 'TEXT', NULL::JSONB, FALSE, 56),
        ('Data de retorno do equipamento', 'DATE', NULL::JSONB, FALSE, 57)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MINICARREGADEIRA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 07. MOTOSSERRA | Rev. 01/2018 | Fonte: CHECK LIST - MOTOSERRA_01.2018.xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruido e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Possui freio de segurança da corrente e o mesmo está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O equipamento não possui nenhum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O óleo lubrificante está no nível acima do médio e aparência normal (não deve estar com a cor leitosa).', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Foi verificada a integridade física do sistema de mangueiras, tubos e conexões do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O equipamento trabalhará somente em local ventilado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Trava de segurança do acelerador foi testado e está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('As condições de conservação das correntes estão boas, bem tensionadas e devidamente afiadas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Foi verificado se o acionamento está em bom estado e funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'MOTOSSERRA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 08. PLATAFORMA DE TRABALHO AEREA | Rev. 01/2018 | Fonte: CHECK LIST - PLATAFORMA DE TRABALHO AEREA_01.2018.xlsx
-- 15 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('Ausência de avaria externa e bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Estação de trabalho resistente e provida de guarda-corpo, travessão e rodapé?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Dispositivo de fechamento da estação de trabalho (portão ou cancela) seguro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Sistema de rodagem (pneus, rodas e rodízios), calibrados e bem conservados?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Estabilizadores de nivelamento funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Sinalizações de aviso, controle e capacidade de carga disponível no equipamento e legível?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Manual de operação disponível no equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Extintor de incêndio carregado e na validade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Sinal sonoro e visual funcionando automaticamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Controles de emergência operacionais?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Componentes elétricos (painéis, cabos, aterramento, plugs e tomadas), conservados e com bom isolamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Bateria carregada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Ausência de vazamentos de fluídos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Fluídos (combustível, lubrificante e hidráulico) no nível e operacional?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Equipamento funcionando adequadamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 25),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 26),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 27),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 28),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 29),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 30),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 31),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 32),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 33),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 34)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'PLATAFORMA DE TRABALHO AEREA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 09. RETIFICADORA | Rev. 01/2018 | Fonte: CHECK LIST - RETIFICADORA_01.2018.xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('A ponta montada está em boas condições de uso?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('A pinça encontra-se e em boas condições, não apresenta folga demasiada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O diâmetro da ponta montada é compatível com a pinça?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('A ponta montada instalada possui capacidade nominal maior ou igual a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Verificado se a ponta montada está girando livremente antes do equipamento ser ligado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'RETIFICADORA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 10. RETROESCAVADEIRA E ESCAVADEIRA | Rev. 06/2019 | Fonte: CHECK LIST - RETROESCAVADEIRA E ESCAVADEIRA_01.2018.xlsx
-- 32 itens de inspeção + 25 campos auxiliares
-- Documento original possui grade semanal S/T/Q/Q/S/S/D.
-- Na carga digital, cada item é representado por um único SELECT por execução
-- de REQUEST_TASK_CHECKLIST, preservando a estrutura atual do modelo.
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, FALSE, 1),
        ('HORIMETRO', 'NUMBER', NULL::JSONB, FALSE, 2),
        ('MARCA', 'TEXT', NULL::JSONB, FALSE, 3),
        ('TAG', 'TEXT', NULL::JSONB, FALSE, 4),
        ('SEMANA DATA - DE', 'DATE', NULL::JSONB, FALSE, 5),
        ('SEMANA DATA - ATÉ', 'DATE', NULL::JSONB, FALSE, 6),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 7),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Os filtros foram verificados?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 9),
        ('O nível de combustível foi verificado e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 10),
        ('O nível do óleo do motor foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O nível do óleo hidráulico foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O nível da água do radiador foi verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Tampa do tanque de combustível está conforme?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Caçamba foi verificada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Banco do operador verificado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Retroescavadeira está sem vazamento de óleo , fluido ou outro líquido contaminante?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Retroescavadeira está limpa (carroceria e interior)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Sistema de comando (painel)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Carroceria (pintura)?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Alarme de ré funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('A buzina funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 22),
        ('Faróis dianteiros em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 23),
        ('Faróis traseiros em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 24),
        ('Pisca L/ Direito funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 25),
        ('Pisca L/ Esquerdo funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 26),
        ('Luz de ré funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 27),
        ('Luz de freio funciona?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 28),
        ('Para-brisa dianteiro integro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 29),
        ('Para-brisa traseiro integro?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 30),
        ('Os cintos de segurança estão em bom funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 31),
        ('A descarga (escapamento) está em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 32),
        ('Os retrovisores interno e extertos estão integros?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 33),
        ('O extintor está carregado e dentro do prazo de validade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 34),
        ('O freio de mão está funcionando?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 35),
        ('Os pneus estão em bom estado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 36),
        ('Partida da máquina?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 37),
        ('Possui alarme de ré?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 38),
        ('Giroflex funcionando normalmente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 39),
        ('O motorista/ Operador está portando crachá e com data aso valido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 40),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 41),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 42),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 43),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 44),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 45),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 46),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 47),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 48),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 49),
        ('Do setor', 'TEXT', NULL::JSONB, FALSE, 50),
        ('Para o Setor ou Empresa', 'TEXT', NULL::JSONB, FALSE, 51),
        ('Responsável pelo empréstimo', 'TEXT', NULL::JSONB, FALSE, 52),
        ('Matrícula do responsável pelo empréstimo', 'TEXT', NULL::JSONB, FALSE, 53),
        ('Receptor do equipamento', 'TEXT', NULL::JSONB, FALSE, 54),
        ('Matrícula do receptor', 'TEXT', NULL::JSONB, FALSE, 55),
        ('Motivo do empréstimo', 'TEXT', NULL::JSONB, FALSE, 56),
        ('Data de retorno do equipamento', 'DATE', NULL::JSONB, FALSE, 57)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'RETROESCAVADEIRA E ESCAVADEIRA'
  AND CT.VERSION = '06/2019';

-- ------------------------------------------------------------
-- 11. ROÇADEIRA | Rev. 01/2018 | Fonte: CHECK LIST - ROÇADEIRA_01.2018.xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O trabalho está sendo realizado em condições de visibilidade adequada?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('Área de trabalho sinalizado e isolado com tela de proteção?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('O tanque de combustível está em bom estado de conservação e abastecido?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O equipamento possui algum tipo de vazamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O cinto de suporte e os cabos da mão estão de acordo com o tamanho do operador? (os cabos da mão devem estar limpos e secos)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Os componentes da roçadeira, como empunhaduras, haste, botões, gatilhos, suporte de apoio, motor, proteções de polias e outros estão em boas condições e funcionando normalmente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('As condições gerais do equipamento como: punho, conexões, molas e calços, parafusos e porcas estão em bom estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O óleo lubrificante está no nível acima do médio e aparência normal', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Foi verificado se travas de acelerador e alavanca estão funcionando facilmente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('A ferramenta de corte ou ferramentas acopláveis estão em perfeito estado de conservação e com a montagem correta?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ROÇADEIRA'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 12. ROLO COMPACTADOR | Rev. 01/2018 | Fonte: CHECK LIST - ROLO COMPACTADOR_01.2018.xlsx
-- 10 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('Os dispositivos de segurança como: buzina, alarme sonoro de ré, extintor de incêndio, faróis / faroletes e rodas / pneus, estão em boas condições de uso e visibilidade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('O equipamento está isento de vazamento que comprometa o meio ambiente ou integridade do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('O sistema de freio durante está em bom funcionamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Níveis de óleo do motor e do hidráulico estão corretos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('O painel de instrumentos está em bom estado para operação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O equipamento está em bom estado de conservação e limpeza?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('Existe iluminação adequada para trabalho à noite?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O piso do local onde está o operador está livre de obstáculos?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Retrovisores internos e externos estão em bom estado de visibilidade?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('O colaborador está usando os EPI''s necessários para operar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 25),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 26),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 27),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 28),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 29)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'ROLO COMPACTADOR'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 13. SERRA MÁRMORE | Rev. 01/2018 | Fonte: CHECK LIST - SERRA MÁRMORE_01.2018.xlsx
-- 11 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos, porcas e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definidido o tipo de disco e acessórios adequados ao tipo de trabalho a ser excutado.(discos para madeira, concreto e cerâmica)', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('O(s) disco(s) estão em boas condições não apresentam deformidades ou trincas?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O sistema de proteções do disco está bem fixado e em boas condições?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('O disco instalado possui capacidade nominal maior ou igual a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('O disco está sem desgaste excessivo ou trinca que comprometa a segurança na operação do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 19),
        ('Verifique-se de que o disco de corte esteja girando livremente antes de ligar o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 20),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 21),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 23),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 24),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 25),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 26),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 27),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 28),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 29),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 30)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'SERRA MÁRMORE'
  AND CT.VERSION = '01/2018';

-- ------------------------------------------------------------
-- 14. SOPRADOR TÉRMICO | Rev. 01/2018 | Fonte: CHECK LIST - SOPRADOR TERMICO_01.2018.xlsx
-- 8 itens de inspeção + 19 campos auxiliares
-- ------------------------------------------------------------
INSERT INTO CHECKLIST_FIELD_TYPE
(
    ID_CHECKLIST_TYPE,
    NAME,
    TYPE,
    OPTIONS,
    REQUIRED,
    ACTIVE,
    DISPLAY_ORDER
)
SELECT
    CT.ID,
    V.FIELD_NAME,
    V.FIELD_TYPE,
    V.FIELD_OPTIONS,
    V.REQUIRED,
    TRUE,
    V.DISPLAY_ORDER
FROM CHECKLIST_TYPE CT
CROSS JOIN
(
    VALUES
        ('EMPRESA/SETOR', 'TEXT', NULL::JSONB, TRUE, 1),
        ('DATA', 'DATE', NULL::JSONB, TRUE, 2),
        ('HORÁRIO DA ATIVIDADE - INÍCIO', 'TIME', NULL::JSONB, TRUE, 3),
        ('HORÁRIO DA ATIVIDADE - FIM', 'TIME', NULL::JSONB, TRUE, 4),
        ('Equipamento alugado?', 'SELECT', '["SIM", "NÃO"]'::JSONB, FALSE, 5),
        ('TAG (não preencher se alugado)', 'TEXT', NULL::JSONB, FALSE, 6),
        ('MARCA', 'TEXT', NULL::JSONB, TRUE, 7),
        ('MODELO', 'TEXT', NULL::JSONB, FALSE, 8),
        ('Nº SERIE OU PATRIMONIO', 'TEXT', NULL::JSONB, FALSE, 9),
        ('PT', 'TEXT', NULL::JSONB, TRUE, 10),
        ('O colaborador foi instruído e autorizado a manusear o equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 11),
        ('Foi verificado as condições dos cabos elétricos e plug, se estão sem emendas ou descascadas e apropriadas para utilização ao ar livre?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 12),
        ('As condições gerais do equipamento como: carcaça, parafusos e acessórios estão em perfeito estado de conservação?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 13),
        ('Verificado se a tensão no local é compativel com a do equipamento?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 14),
        ('Definido o uso dos acessórios adequados ao tipo de trabalho a ser executado?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 15),
        ('Os bocais e/ou raspadores estão isentos de substâncias que possam inflamar ou gerar gases nocivos e/ou inflamáveis?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 16),
        ('O controlador de calor está funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 17),
        ('Chave liga/desliga funcionando corretamente?', 'SELECT', '["SIM", "NÃO", "NÃO APLICÁVEL"]'::JSONB, FALSE, 18),
        ('Responsável pela inspeção', 'TEXT', NULL::JSONB, FALSE, 19),
        ('Descrição do problema', 'TEXT', NULL::JSONB, FALSE, 20),
        ('Descrição da solução imediata (Pré analise)', 'TEXT', NULL::JSONB, FALSE, 21),
        ('Local onde foi realizado reparo', 'TEXT', NULL::JSONB, FALSE, 22),
        ('Data envio', 'DATE', NULL::JSONB, FALSE, 23),
        ('Previsão de retorno', 'DATE', NULL::JSONB, FALSE, 24),
        ('Status final do equipamento', 'SELECT', '["Apto ao uso", "Sem conserto - Descarte", "Sem conserto - Retirar peças"]'::JSONB, FALSE, 25),
        ('Data do status final do equipamento', 'DATE', NULL::JSONB, FALSE, 26),
        ('Assinatura', 'TEXT', NULL::JSONB, FALSE, 27)
) AS V(FIELD_NAME, FIELD_TYPE, FIELD_OPTIONS, REQUIRED, DISPLAY_ORDER)
WHERE CT.NAME = 'SOPRADOR TÉRMICO'
  AND CT.VERSION = '01/2018';

COMMIT;
