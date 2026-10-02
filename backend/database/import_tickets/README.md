# Importação recorrente de chamados

Interpreta os relatórios XLSX do legado por regras editáveis e grava solicitações no
Oracle 19c. Várias colunas podem contribuir para `REQUEST.DESCRIPTION` e para o caminho
`BUSINESS → REGION → LOCATION → REQUEST.ID_LOCATION`.

O comando padrão **somente gera uma prévia**. Não conecta ao banco, não modifica os
arquivos XLSX e não executa os scripts PostgreSQL antigos.

## Uso

Na raiz do repositório, instale as dependências no ambiente Python do projeto:

```powershell
.\.venv\Scripts\python.exe -m pip install -r database/import_tickets/requirements.txt

.\.venv\Scripts\python.exe -m database.import_tickets `
  "C:\importacao\report-tickets-01.01.2026 - 30.06.2026.xlsx" `
  "C:\importacao\report-tickets-01.07.2026 - 31.12.2026.xlsx"
```

Saídas em `output/`, ignoradas pelo Git:

- `preview.json`: linhas originais, identificador de origem, solicitação interpretada,
  respostas adicionais, avisos, erros e hash das regras/catálogo.
- `preview.md`: resumo e lista das linhas pendentes, com arquivo, aba e linha.

Dados pessoais e URLs assinadas de anexos permanecem nesses arquivos; não os publique.
`--output caminho.json` permite guardar prévias de lotes diferentes. A prévia é de
mapeamento: ainda não comprova a compatibilidade com os cadastros de uma base concreta.

### Gerar arquivos INSERT Oracle

Acrescente `--export-sql database/oracle/InsertTable` ao comando de prévia para gerar
os scripts por domínio, o consolidado `INSERT_ALL_TABLES.sql` e o executor
`RUN_SQLPLUS.sql` para as 23 tabelas originais. As duas tabelas de auditoria ficam no consolidado separado `INSERT_IMPORT_TABLES.sql`, executado após a carga principal e a instalação de `INSTALL_IMPORT_TABLES.sql`. Cada carga possui seu próprio COMMIT. Não há conexão com o banco. A exportação exige zero pendências e
IDs reservados para todas as solicitações. Não combine essa opção com `--apply`.

Os scripts são destinados a uma base vazia, com as 23 tabelas existentes. As duas
tabelas auxiliares são instaladas separadamente por `INSTALL_IMPORT_TABLES.sql`.
O README gerado informa a sequência de execução e o manifest contém contagens e
SHA-256 dos scripts. Não use essa carga inicial em uma base já povoada.

## Regras de interpretação

Edite `mapping.json` e gere a prévia novamente. Não é necessário alterar Python a cada
nova coluna ou variação de nomenclatura.

| Configuração | Função |
| --- | --- |
| `source` | Identifica sistema e tenant. Deve permanecer estável entre exportações da mesma base. |
| `header_roles` | Nomes equivalentes de colunas de unidade, região, local e descrição. |
| `header_patterns` | Expressões sobre cabeçalhos normalizados, sem acentos/pontuação. |
| `header_overrides` | Classificação explícita: `business`, `region`, `location`, `description`, `extra` ou `ignore`. |
| `business_aliases`, `region_aliases`, `location_aliases` | Equivalência entre valores da origem e nomes do catálogo. |
| `category_aliases` | Equivalência de categorias, incluindo o nome longo de pintura → PINTURA. |
| `default_business` | Unidade padrão somente quando não há coluna de unidade preenchida; inicialmente `null`. |
| `create_unmapped_locations` | Cria locais novos sob uma região/unidade resolvida, habilitado. |
| `missing_location` | Somente ausência completa: Região 1, TECON Salvador / Prédio Administrativo / Local exato não especificado. |
| `service_rules` | Regras específicas por `category` e `service`, incluindo overrides, aliases de campos e unidade padrão. |
| `field_aliases` | Nome da coluna → nome de campo adicional, respeitando o limite de 100 caracteres. |
| `row_overrides` | Correções pontuais de `location`, `description` e `legacy_id`, por arquivo/aba/linha. |
| `existing_request_ids` | Correspondência explícita do número legado com o ID de um chamado já existente. |
| `catalog_file` | Caminhos de localização permitidos, sem presumir IDs do banco. |
| `resolutions_file` | Regras revisadas para combinações exatas de campos de localização pendentes. |
| `summaries_file` | Resumos revisados por número de origem e hash do texto integral. |
| `numbering_file` | Reservas persistentes de `REQUEST.ID` por chave de origem. |
| `duplicate_occurrences` | Seletores que identificam cada ocorrência dos números repetidos. |

Exemplo de regra específica (incluir no array `service_rules`):

```json
{
  "category": "ARTÍFICE",
  "service": "Outros",
  "header_overrides": {
    "Detalhamento da necessidade": "description",
    "Onde executar?": "location"
  }
}
```

Exemplo de alias para um local que já existe no catálogo:

```json
"localização informada pelo legado": {
  "business": "Centro Logístico Salvador",
  "region": "Prédio Administrativo",
  "location": "Tanque/estacionamento no Prédio ADM CLS"
}
```

`locations.json` foi inicializado com os 46 locais dos scripts de referência.
Adicione caminhos revisados para novos locais. A aplicação cria os cadastros ausentes
e procura os existentes por nome normalizado **e pai**, recuperando os IDs reais.
Um local conhecido em apenas uma unidade pode resolver essa unidade; se houver mais
de um caminho possível, o resultado fica pendente. Não há correspondência aproximada
por similaridade de texto.

Todos os indícios de localização são combinados, não apenas o primeiro preenchido.
`Andar` e `Pavimento` refinam o prédio; um segundo andar sem sala específica usa o
local genérico daquele andar, se catalogado. Um prédio sem detalhe pode usar
`Local exato não especificado` **somente na região/unidade resolvida**.
Um detalhe desconhecido gera um novo local se a região/unidade puder ser determinada
pelos outros campos ou por nomes completos conhecidos contidos no texto. Por exemplo,
`Almoxarifado Estoque 04` cria um local na região Almoxarifado. O nome original é preservado,
com limite de 100 caracteres. A prévia lista os novos locais em `new_locations`;
os registros são criados/reutilizados durante `--apply`, pelo nome normalizado e região,
somente para as linhas efetivamente importadas. Nenhuma gravação ocorre na prévia.
Detalhes contraditórios ou sem região/unidade determinável continuam pendentes.
O padrão não presume TECON para `Prédio ADM`, pois existe prédio administrativo no CLS.

Quando **nenhuma informação de localização** estiver preenchida (incluindo colunas
com apenas `-`), utiliza-se `Local exato não especificado` na **Região 1 — Prédio
Administrativo / TECON Salvador**. Na carga, o ID 1 é validado contra esses nomes;
uma divergência interrompe a transação. O local é criado nessa região se ainda não existir.
Essa regra não se aplica a locais desconhecidos, conflitos ou unidade/região ambígua,
nem elimina outras pendências da linha (descrição longa, número duplicado etc.).

### Resoluções revisadas dos relatórios de 2026

`location_resolutions.json` complementa as regras gerais quando a combinação exata de
cabeçalhos/valores ainda não foi resolvida. As evidências e o destino são visíveis no arquivo.
Foram aprovados estes tratamentos:

- Grupo 538 (Prédio ADM sem unidade ou somente TECON): Região 1, TECON Salvador /
  Prédio Administrativo / Local exato não especificado.
- Grupo 34 (novo local sem região identificável): mesmo destino padrão do TECON.
- Grupo 47: unidade CLS, preservando a região/local descritos. A carga cria/reutiliza
  Pátio Operacional, Manutenção e Armazém no CLS, além dos locais necessários.

Os textos originais de localização permanecem no snapshot. A regra especial do grupo
47 também vincula ao CLS a ocorrência de ETE ao lado da Manutenção, conforme a decisão
de tratar todo esse grupo como CLS. Nenhuma unidade é presumida para combinações novas
que não correspondam às regras revisadas.

Descrições são reunidas na ordem física das colunas, removendo apenas textos repetidos
idênticos. Colunas de mesmo nome continuam separadas. `-` e vazios são desconsiderados;
zero e falso são preservados. Acima de 300 caracteres, a linha fica pendente, sem
truncamento quando não houver resumo revisado. Os 25 textos longos dos relatórios atuais
têm resumos em `description_summaries.json`. Cada resumo só é aplicado se o hash do texto
original continuar igual; alterações posteriores exigem nova revisão. O texto integral
também aparece em `full_description` na prévia e permanece no snapshot. A coluna
`Histórico` não é tratada como descrição.

## Identidade, datas e demais respostas

- Números repetidos sem seletores revisados continuam pendentes. Os números 665, 1261
  e 1466 foram revisados como **duas solicitações distintas cada**. A identificação usa
  categoria, serviço e data de abertura interpretada, sem depender de posição ou nome do
  arquivo. Um seletor não reconhecido ou ambíguo bloqueia a linha.
- As chaves da origem são `665#1`, `665#2` etc.; os números originais e todas as colunas
  continuam preservados. As reservas de `REQUEST.ID` são 665/666, 1261/1262 e 1466/1467.
  Outros chamados que ocupavam os números reservados foram deslocados para números
  livres. O de/para completo está em `request_numbers.json` e as alterações na prévia.
- As 1.680 reservas atuais são únicas. Reordenar arquivos ou importar apenas um subconjunto
  não recalcula IDs. Não apague nem regenere esse arquivo depois de uma carga aplicada.
  Para novos números da origem, execute a prévia com `--reserve-numbers`: mantém as
  reservas existentes e salva as novas. O arquivo deve ser versionado junto às regras;
  não execute reservas concorrentes. Uma nova duplicidade exige definir seus seletores
  e conciliar qualquer colisão com reservas já existentes.
- Repetir a mesma ocorrência identificada importa uma só vez. O importador não renumera
  chamados que já estejam gravados no banco. Se o de/para divergir de uma carga anterior,
  interrompe a transação para conciliação.
- `Data Abertura` prevalece; se ausente, utiliza-se o primeiro evento explícito de abertura
  no histórico. Sem ambos, permanece nula, com aviso. `STARTED_DATE` utiliza o primeiro
  evento explícito de andamento. Todos os eventos originais ficam preservados.
- `Data Agendamento` vai para `AGREED_DATE`; não muda o status para Programada.
- Solicitante é identificado por e-mail, sem conferir permissões nem inventar setor.
  Responder, criador, aprovador e cancelador não são inferidos como equivalentes.
- Respostas adicionais usam TYPE, OPTIONS, REQUIRED, ACTIVE e DISPLAY_ORDER do catálogo
  configurado em `field_catalog_file`, por categoria + serviço + nome normalizado.
  O catálogo de referência é o antigo `INSERT_SERVICE_FIELD_TYPE.sql`; ele é lido,
  nunca executado. Campos sem correspondência são TEXT, ativos, opcionais e ordenados
  após os campos legados. A carga continua incluindo somente campos com respostas
  adicionais importadas; localização e descrição mantêm o tratamento anterior.
  NUMBER e BOOL geram números e booleanos JSON; MULTI_SELECT gera arrays, interpretando
  a lista separada por vírgulas da exportação; DATE gera texto ISO. OPTIONS usa o
  envelope JSON `{"value": [...]}`. Respostas fora das opções antigas são preservadas
  com aviso. Tipos existentes divergentes no Oracle bloqueiam a importação para conciliação.
  Tipos existentes NUMBER, BOOL, DATE, SINGLE_SELECT e MULTI_SELECT são respeitados;
  MULTI_SELECT exige array JSON explícito, sem adivinhar separadores. Tipos incompatíveis
  interrompem a transação. JSON persistido usa `{"value": ...}`.
- Colunas base sem destino operacional (SLA, histórico, notas, papéis de auditoria etc.)
  são preservadas integralmente no snapshot. `ignore` também mantém o valor original.
- URLs de campos adicionais geram definições MEDIA, preservando as outras propriedades
  do catálogo. Nesta carga, `import_media_content=false`: não são criadas respostas
  em SERVICE_FIELD_MEDIA nem SERVICE_FIELD_VALUE para esses campos. As URLs são
  preservadas nos snapshots; arquivos ausentes não bloqueiam a carga e não são baixados.
  Para importar binários em uma carga futura, habilite `import_media_content=true`.
  Nesse modo são criadas respostas em SERVICE_FIELD_MEDIA. Use `--download-media` para obter
  os arquivos antes de `--export-sql` ou `--apply`. A prévia não acessa a rede.
  `output/media_manifest.json` lista vínculos, URLs e arquivos ausentes. O cache usa
  `output/media/<SHA256 da URL>.bin` e um `.json` com file_name, mime_type e sha256
  do conteúdo. Arquivos locais podem ser conciliados nesse formato, sem alterar URLs
  históricas. Downloads têm limite de 25 MiB por arquivo; URLs expiradas são bloqueadas.
  O SQL usa EMPTY_BLOB seguido de DBMS_LOB.WRITEAPPEND na mesma transação; exige bytes
  reais antes de gerar qualquer arquivo. Nenhuma mídia ausente é substituída por BLOB
  vazio ou pelo texto da URL. Placeholders not-found-deskbee.jpg não são anexos.
  Cada URL distinta por campo/chamado gera uma resposta; o cache reutiliza downloads.
  O hash de destino inclui metadados e SHA256 dos binários para proteger alterações.
  A importação não cria tarefas, transações ou checklists a partir de
  eventos ambíguos. Essas etapas exigem fontes/mapeamentos próprios.

## Aplicação no Oracle

1. Disponibilize o schema atual OHFC e os catálogos de status/tipo com os IDs do projeto:
   status 1 Em aberto, 2 Programada, 3 Em andamento, 4 Concluída, 5 Cancelada;
   tipos 1 Chamado e 2 Atividade de Pátio. O importador verifica esses valores.
2. Execute `install.sql` uma vez, separadamente. Cria apenas duas tabelas auxiliares:
   correspondência de IDs e snapshots de importação. DDL Oracle causa commit implícito.
3. Configure `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_DSN` no ambiente ou nos arquivos
   de configuração usados pelo backend. Execute a partir da raiz do projeto.
4. Corrija as pendências da prévia e acrescente `--apply` ao comando.

Por padrão, nenhuma linha é gravada se a prévia tiver pendências.
`--allow-pending` autoriza explicitamente aplicar apenas as linhas resolvidas.
A aplicação bloqueia as tabelas envolvidas para escrita com NOWAIT durante a transação;
execute em janela de manutenção. Falha de lock ou qualquer erro de persistência resulta
em rollback integral do lote. Nenhum DDL é executado pelo Python.

Reexecutar o mesmo conteúdo é idempotente. Uma origem alterada exige `--update-existing`.
Antes de atualizar, compara-se o estado persistido da solicitação e suas respostas ao
snapshot anterior; alterações nesses campos feitas pelo aplicativo impedem sobrescrita.
Campos não gerenciados, como responsável, não são alterados. O histórico das versões
importadas fica em `OHFC_IMPORT_SNAPSHOT`.

Uma base com chamados antigos sem correspondência é bloqueada para prevenir duplicação
dos antigos seeds. Preencha `existing_request_ids` após conciliação. Adoção exige
`--update-existing` e não aceita respostas existentes sem conciliação prévia.
`--allow-new-in-existing` permite inserir chamados realmente novos em uma base já
povoada; não use essa opção para contornar a identificação dos chamados antigos.

Quando há IDs explícitos reservados, o importador verifica se já estão ocupados antes
de inserir. Antes do commit, avança a sequence identity de `OHFC_REQUEST` até ultrapassar
o maior ID da tabela, sem DDL nem commits intermediários. O schema da conexão precisa
ser proprietário da tabela e expor uma identity crescente. Avanços de sequence não
são revertidos por rollback e podem deixar lacunas, como nas inserções normais do Oracle.
Identities de outros cadastros que tenham recebido seeds antigos com IDs explícitos
ainda precisam estar regularizadas. Esse mecanismo requer homologação em Oracle.

## Verificação

Categorias configuradas em `excluded_categories` não participam da carga: atualmente
`Dúvida Aplicativo` e `NOVOS PROJETOS`. Seus chamados, serviços, campos, respostas e
linhas de auditoria não geram INSERTs. As linhas originais excluídas permanecem em
`excluded_rows` na prévia local, e as reservas de REQUEST.ID são mantidas. Os IDs das
categorias restantes também são preservados. Essa regra não apaga dados já existentes
no Oracle; vale para a geração da carga e a seleção de linhas do importador.

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s database/import_tickets/tests -v
```

Os testes cobrem interpretação, conflitos, duplicidades, preservação de dados,
idempotência, proteção contra alterações no destino e rollback simulado.
A prévia foi exercitada com os dois relatórios de 2026. Persistência e locks ainda
precisam ser homologados em Oracle; os testes não substituem essa homologação.

## Implantação

Ferramenta administrativa: não é necessária no servidor web. Execute em ambiente restrito, com backup e credenciais separadas das usadas pela aplicação. Consulte o [guia de implantação](../../docs/deployment.md).
