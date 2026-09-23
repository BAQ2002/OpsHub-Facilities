# Cores das categorias

A paleta segue os valores HEX da imagem de referência fornecida para esta alteração.
`app/entities/navigation_entities/service_category_styles.ts` é a fonte compartilhada.
Cada página mantém sua própria entidade de correlação:

- `home_viewModels.ts`: `ActivityCategoryStyle`, `EquipmentCard.categoryStyle`,
  `HomePageViewModel.categoryStyleMap` e `getActivityCategoryStyle` para cards,
  marcadores do mapa e indicadores da tabela.
- `chamados_dashboard_viewModels.ts`: `CategoryChartItem` e `mapCategoryChartItem`
  para as fatias do gráfico e suas legendas.

## Paleta

Os IDs seguem os scripts de carga em `database/SqlScripts/InsertTable`.
Os nomes abreviados da referência correspondem aos nomes completos abaixo.

| ID | Categoria no banco | Referência | Principal | Fundo |
|---|---|---|---|---|
| 1 | ARTÍFICE | Artífice | #B97842 | #F6E7D9 |
| 2 | CLIMATIZAÇÃO E REFRIGERAÇÃO | Refrigeração | #1CA2C1 | #E6F7FB |
| 3 | COPA | Copa | #D94E2B | #FBE7E2 |
| 4 | INSTALAÇÕES ELÉTRICAS | Elétrica | #FFD21A | #FFF8D9 |
| 5 | INSTALAÇÕES HIDRÁULICAS | Hidráulica | #2864C7 | #E6F0FB |
| 6 | JARDINAGEM | Jardinagem | #31A354 | #E7F6EA |
| 7 | MANUTENÇÂO CIVIL | Civil | #78899B | #E8ECF1 |
| 9 | PINTURA | Pintura | #E63286 | #FDE7F1 |
| 10 | PMOC | PMOC | #6540A4 | #EFE7F8 |
| Demais / ausente | Inclui ID 8, NOVOS PROJETOS | Fallback neutro | #64748B | #F1F5F9 |

## Regras de uso e contrato

A consulta usa o ID persistido, nunca a posição no resultado ou o nome exibido.
Filtros, ordenação e mudanças de quantidade não alteram a cor de uma categoria.
Ambientes devem preservar os IDs do catálogo; se a carga mudar, revise a correlação.

A cor principal identifica pontos, marcadores e fatias. A cor de fundo é usada
nos identificadores dos cards, badges da tabela e linhas da legenda do gráfico.
Os textos continuam escuros para manter a leitura, especialmente em Elétrica.
O fundo geral das páginas permanece #FFFFFF.

`GET /api/v1/requests/activity-tracking` retorna `categoryData` como
`{ categoryId, label, value }[]`, sem cores de categoria. O serviço frontend
converte esses dados em `CategoryChartItem[]` antes de renderizar o Dashboard.
Backend e frontend devem ser atualizados juntos para este contrato.
As cores de status e indicadores gerais não fazem parte desta correlação.

Para incluir uma categoria, adicione o ID e os dois HEX na paleta compartilhada;
as duas páginas passam a utilizá-los automaticamente. Atualize também esta tabela.
