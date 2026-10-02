-- OHFC_SERVICE_FIELD_TYPE: 165 registros. Gerado pelas regras revisadas da importação.
-- Sem COMMIT individual; executar pelo consolidado correspondente.

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    1,
    1,
    'Possui pt vinculada',
    'BOOL',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    2,
    1,
    'Tipo de pintura',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    3,
    1,
    'Data de finalização',
    'DATE',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    4,
    2,
    'Equipamento que necessita limpeza',
    'MULTI_SELECT',
    TO_CLOB('{"value": ["Microondas", "Geladeira"]}'),
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    5,
    4,
    'Ponto afetado',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Mictório", "Outro", "Vaso sanitário"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    6,
    4,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    7,
    5,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    8,
    6,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    9,
    7,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    10,
    7,
    'Tipo do dispenser',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Papel higiênico", "Sabão", "Papel toalha"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    11,
    7,
    'Motivo',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Outro", "Quebrado", "Não fixa na parede"]}'),
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    12,
    8,
    'Tipo de ponto afetado',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["OUTRO", "VASO SANITARIO"]}'),
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    13,
    9,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    14,
    10,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    15,
    10,
    'Problema identificado',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    16,
    11,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    17,
    12,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    18,
    12,
    'Quantidade de bebedouro',
    'NUMBER',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    19,
    13,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    20,
    13,
    'Problema identificado',
    'MULTI_SELECT',
    TO_CLOB('{"value": ["Não fecha", "Desalinhada", "outro", "Não abre bem"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    21,
    13,
    'Tipo da porta',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Madeira", "Corta-fogo", "Vidro", "Metálica"]}'),
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    22,
    14,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    23,
    14,
    'Tipo de item',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Equipamento elétrico", "Plug"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    24,
    14,
    'Quantidade de itens',
    'NUMBER',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    25,
    14,
    'Risco identificado',
    'TEXT',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    26,
    15,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    27,
    16,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    28,
    16,
    'Quantidade',
    'NUMBER',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    29,
    17,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    30,
    19,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    31,
    20,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    32,
    20,
    'Motivo da troca',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Outro", "Danificada", "Chave perdida"]}'),
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    33,
    21,
    'Quase sempre visível (exemplo: ar-57)',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    34,
    21,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    35,
    22,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    36,
    23,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    37,
    24,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    38,
    24,
    'Quase sempre visíveis (exemplo: ar-57)',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    39,
    25,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    40,
    25,
    'Quase sempre visíveis (exemplo: ar-57)',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    41,
    26,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    42,
    26,
    'Quase sempre visíveis (exemplo: ar-57)',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    43,
    28,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    44,
    28,
    'Verificar e eliminar danos e/ou corrosão no gabinete, na bandeja e nas serpentinas.',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    45,
    28,
    'Verificar a operação de drenagem de água da bandeja e realizar limpeza do dreno',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    46,
    28,
    'Lavar o gabinete, as bandejas e as serpentinas, sem o uso de produtos desengraxantes e corrosivos',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    47,
    28,
    'Limpar os ventiladores (carcaça e rotor)',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    48,
    28,
    'Filtro verificar e eliminar sujeira, danos e presença de corrosão, verificar e eliminar as frestas;',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    49,
    28,
    'Verificar presença de ruídos e/ou vibrações anormais.',
    'MEDIA',
    NULL,
    1,
    1,
    7
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    50,
    28,
    'Verificar a vedação dos painéis de fechamento do gabinete',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    51,
    28,
    'Verificação de temperaturas c° de insuflamento, ambiente interno.ref: (8 - 14c°)',
    'MEDIA',
    NULL,
    1,
    1,
    9
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    52,
    28,
    'Verificar o estado de conservação do isolamento térmico',
    'MEDIA',
    NULL,
    1,
    1,
    10
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    53,
    29,
    'Motivo',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    54,
    29,
    'Quantidade',
    'NUMBER',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    55,
    29,
    'Tipo de tomada',
    'TEXT',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    56,
    31,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    57,
    31,
    'Verificar e eliminar danos e/ou corrosão no gabinete, na bandeja e nas serpentinas.',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    58,
    31,
    'Verificar a operação de drenagem de água da bandeja e realizar limpeza do dreno',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    59,
    31,
    'Lavar o gabinete, as bandejas e as serpentinas, sem o uso de produtos desengraxantes e corrosivos',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    60,
    31,
    'Limpar os ventiladores (carcaça e rotor)',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    61,
    31,
    'Filtro verificar e eliminar sujeira, danos e presença de corrosão, verificar e eliminar as frestas;',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    62,
    31,
    'Verificar presença de ruídos e/ou vibrações anormais.',
    'MEDIA',
    NULL,
    1,
    1,
    7
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    63,
    31,
    'Verificar a vedação dos painéis de fechamento do gabinete',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    64,
    31,
    'Verificação de temperaturas c° de insuflamento, ambiente interno.ref: (8 - 14c°)',
    'MEDIA',
    NULL,
    1,
    1,
    9
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    65,
    31,
    'Verificar o estado de conservação do isolamento térmico',
    'MEDIA',
    NULL,
    1,
    1,
    10
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    66,
    31,
    'Verificação de existência de vazamentos',
    'MEDIA',
    NULL,
    1,
    1,
    11
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    67,
    31,
    'Leituras de tensão',
    'MEDIA',
    NULL,
    1,
    1,
    13
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    68,
    31,
    'Leitura de corrente',
    'MEDIA',
    NULL,
    1,
    1,
    14
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    69,
    31,
    'Leitura de pressão',
    'MEDIA',
    NULL,
    1,
    1,
    15
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    70,
    31,
    'Verificação de terminais',
    'MEDIA',
    NULL,
    1,
    1,
    16
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    71,
    31,
    'Verificação de fiação e contatos',
    'MEDIA',
    NULL,
    1,
    1,
    17
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    72,
    31,
    'Reaperto de conexões',
    'MEDIA',
    NULL,
    1,
    1,
    18
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    73,
    32,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    74,
    34,
    'Pintura',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Outros", "Faixa de pedestre"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    75,
    35,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    76,
    36,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    77,
    36,
    'Verificar e eliminar danos e/ou corrosão no gabinete, na bandeja e nas serpentinas.',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    78,
    36,
    'Verificação de temperaturas c° de insuflamento, ambiente interno.ref: (8 - 14c°)',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    79,
    37,
    'Obstrução identificada',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    80,
    37,
    'Quantidade de caixas',
    'NUMBER',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    81,
    36,
    'Medição de diferencial',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    82,
    36,
    'Verificação da operação de drenagem de água da bandeja e limpeza do dreno',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    83,
    36,
    'Lavar o gabinete, as bandejas e as serpentinas, sem o uso de produtos desengraxantes e corrosivos',
    'MEDIA',
    NULL,
    0,
    1,
    18
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    84,
    36,
    'Limpeza dos ventiladores (carcaça e rotor)',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    85,
    36,
    'Filtro verificar e eliminar sujeira, danos e presença de corrosão, verificar e eliminar as frestas;',
    'MEDIA',
    NULL,
    0,
    1,
    20
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    86,
    36,
    'Verificação da presença de ruídos e/ou vibrações anormais.',
    'MEDIA',
    NULL,
    1,
    1,
    10
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    87,
    36,
    'Verificação da vedação dos painéis de fechamento do gabinete',
    'MEDIA',
    NULL,
    1,
    1,
    11
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    88,
    36,
    'Verificação do estado de conservação do isolamento térmico',
    'MEDIA',
    NULL,
    1,
    1,
    12
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    89,
    28,
    'Medição do diferencial',
    'MEDIA',
    NULL,
    1,
    1,
    11
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    90,
    38,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    91,
    38,
    'Verificar e eliminar danos e/ou corrosão no gabinete, na bandeja e nas serpentinas.',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    92,
    38,
    'Verificar a operação de drenagem de água da bandeja e realizar limpeza do dreno',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    93,
    38,
    'Lavar o gabinete, as bandejas e as serpentinas, sem o uso de produtos desengraxantes e corrosivos',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    94,
    38,
    'Limpar os ventiladores (carcaça e rotor)',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    95,
    38,
    'Filtro verificar e eliminar sujeira, danos e presença de corrosão, verificar e eliminar as frestas;',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    96,
    38,
    'Verificar presença de ruídos e/ou vibrações anormais.',
    'MEDIA',
    NULL,
    1,
    1,
    7
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    97,
    38,
    'Verificar a vedação dos painéis de fechamento do gabinete',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    98,
    38,
    'Verificação de temperaturas c° de insuflamento, ambiente interno.ref: (8 - 14c°)',
    'MEDIA',
    NULL,
    1,
    1,
    9
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    99,
    38,
    'Verificar o estado de conservação do isolamento térmico',
    'MEDIA',
    NULL,
    1,
    1,
    10
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    100,
    38,
    'Medição de diferencial',
    'MEDIA',
    NULL,
    1,
    1,
    11
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    101,
    27,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    102,
    39,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    103,
    39,
    'Verificar e eliminar danos e/ou corrosão no gabinete, na bandeja e nas serpentinas.',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    104,
    39,
    'Verificar a operação de drenagem de água da bandeja e realizar limpeza do dreno',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    105,
    39,
    'Lavar o gabinete, as bandejas e as serpentinas, sem o uso de produtos desengraxantes e corrosivos',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    106,
    39,
    'Limpar os ventiladores (carcaça e rotor)',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    107,
    39,
    'Filtro verificar e eliminar sujeira, danos e presença de corrosão, verificar e eliminar as frestas;',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    108,
    39,
    'Verificar presença de ruídos e/ou vibrações anormais.',
    'MEDIA',
    NULL,
    1,
    1,
    7
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    109,
    39,
    'Verificar a vedação dos painéis de fechamento do gabinete',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    110,
    39,
    'Verificação de temperaturas c° de insuflamento, ambiente interno.ref: (8 - 14c°)',
    'MEDIA',
    NULL,
    1,
    1,
    9
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    111,
    39,
    'Verificar o estado de conservação do isolamento térmico',
    'MEDIA',
    NULL,
    1,
    1,
    10
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    112,
    39,
    'Verificação de existência de vazamentos',
    'MEDIA',
    NULL,
    1,
    1,
    11
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    113,
    39,
    'Hidrojateamento geral do equipamento',
    'MEDIA',
    NULL,
    1,
    1,
    12
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    114,
    31,
    'Medição de diferencial',
    'MEDIA',
    NULL,
    1,
    1,
    19
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    115,
    18,
    'Itensidade',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["FLUXO CONTÍNUO", "GOTEJAMENTO"]}'),
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    116,
    39,
    'Leituras de tensão',
    'MEDIA',
    NULL,
    1,
    1,
    14
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    117,
    39,
    'Leitura de corrente',
    'MEDIA',
    NULL,
    1,
    1,
    15
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    118,
    39,
    'Leitura de pressão',
    'MEDIA',
    NULL,
    1,
    1,
    16
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    119,
    39,
    'Verificação de terminais',
    'MEDIA',
    NULL,
    1,
    1,
    17
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    120,
    39,
    'Verificação de fiação e contatos',
    'MEDIA',
    NULL,
    1,
    1,
    18
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    121,
    39,
    'Reaperto de conexões',
    'MEDIA',
    NULL,
    1,
    1,
    19
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    122,
    39,
    'Medição de diferencial',
    'MEDIA',
    NULL,
    1,
    1,
    20
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    123,
    40,
    'Área aproximada afetada (metros quadrados)',
    'NUMBER',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    124,
    32,
    'Verificação e limpeza da carenagem',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    125,
    32,
    'Verificação e limpeza da turbina',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    126,
    32,
    'Verificação e limpeza dos defletores',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    127,
    32,
    'Verificação e limpeza do direcionamento de ar',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    128,
    41,
    'Foto da necessidade',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    129,
    41,
    'Quase sempre visíveis (exemplo: ar-57)',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    130,
    42,
    'Foto/anexo da ocorrência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    131,
    44,
    'Insira imagem',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    132,
    3,
    'Referência',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    133,
    32,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    134,
    36,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    135,
    45,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    136,
    45,
    'Lubrificação do eixo e do sistema de fixação da turbina',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    137,
    45,
    'Limpeza dos componentes elétricos',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    138,
    45,
    'Verificar conexões eletricas',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    139,
    45,
    'Limpeza de carenagem',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    140,
    45,
    'Limpeza de turbina',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    141,
    45,
    'Limpeza do direcionamento de ar',
    'MEDIA',
    NULL,
    1,
    1,
    7
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    142,
    45,
    'Medição de corrente',
    'MEDIA',
    NULL,
    1,
    1,
    8
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    143,
    45,
    'Medição de tensão',
    'MEDIA',
    NULL,
    1,
    1,
    9
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    144,
    28,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    12
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    145,
    46,
    'Frequencia do vazamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    146,
    39,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    13
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    147,
    47,
    'Tag do equipamento',
    'TEXT',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    148,
    47,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    149,
    47,
    'Verificação e limpeza da carenagem',
    'MEDIA',
    NULL,
    1,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    150,
    47,
    'Verificação e limpeza da turbina',
    'MEDIA',
    NULL,
    1,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    151,
    47,
    'Verificação e limpeza dos defletores',
    'MEDIA',
    NULL,
    1,
    1,
    5
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    152,
    47,
    'Verificação e limpeza do direcionamento de ar',
    'MEDIA',
    NULL,
    1,
    1,
    6
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    153,
    6,
    'Tet',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    154,
    31,
    'Técnico responsável',
    'SINGLE_SELECT',
    TO_CLOB('{"value": ["Rodrigo Silveira", "Bruno Silveira"]}'),
    1,
    1,
    12
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    155,
    48,
    'Técnico responsável',
    'TEXT',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    156,
    48,
    'Foto',
    'MEDIA',
    NULL,
    1,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    157,
    43,
    'Anexo da ocorrência',
    'MEDIA',
    NULL,
    0,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    158,
    49,
    'Técnico responsável',
    'TEXT',
    NULL,
    0,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    159,
    49,
    'Foto',
    'MEDIA',
    NULL,
    0,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    160,
    50,
    'Data da necessidade',
    'TEXT',
    NULL,
    0,
    1,
    1
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    161,
    50,
    'Hora da necessidade',
    'TEXT',
    NULL,
    0,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    162,
    50,
    'Itens solicitados',
    'TEXT',
    NULL,
    0,
    1,
    3
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    163,
    50,
    'Quantidade aproximada de pessoas',
    'TEXT',
    NULL,
    0,
    1,
    4
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    164,
    18,
    'Foto',
    'MEDIA',
    NULL,
    1,
    1,
    2
);

INSERT INTO OHFC_SERVICE_FIELD_TYPE (ID, ID_SERVICE_TYPE, NAME, TYPE, OPTIONS, REQUIRED, ACTIVE, DISPLAY_ORDER)
VALUES (
    165,
    38,
    'Técnico responsável',
    'TEXT',
    NULL,
    0,
    1,
    23
);
