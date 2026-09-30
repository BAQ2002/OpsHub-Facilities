"""Generate a self-contained Oracle 19c initial load, without a DB connection."""
from __future__ import annotations

import json
import hashlib
import re
from collections import OrderedDict, defaultdict
from datetime import datetime
from pathlib import Path

from .core import digest, norm, one
from .oracle import REQUEST_COLUMNS
from .media import read_asset, require_media, asset_state


ROOT = Path(__file__).resolve().parents[2]
ORDER = OrderedDict([
    ("OHFC_SLA", "ServicesTables/INSERT_SLA.sql"),
    ("OHFC_SERVICE_CATEGORY", "ServicesTables/INSERT_SERVICE_CATEGORY.sql"),
    ("OHFC_SECTOR", "MembersTables/INSERT_SECTOR.sql"),
    ("OHFC_MEMBERSHIP", "MembersTables/INSERT_MEMBERSHIP.sql"),
    ("OHFC_BUSINESS", "LocationsTables/INSERT_BUSINESS.sql"),
    ("OHFC_REQUEST_TYPE", "RequestsTables/INSERT_REQUEST_TYPE.sql"),
    ("OHFC_REQUEST_STATUS", "RequestsTables/INSERT_REQUEST_STATUS.sql"),
    ("OHFC_REQUEST_TRANSACTION_STATUS", "RequestsTables/INSERT_REQUEST_TRANSACTION_STATUS.sql"),
    ("OHFC_SERVICE_TYPE", "ServicesTables/INSERT_SERVICE_TYPE.sql"),
    ("OHFC_SERVICE_FIELD_TYPE", "ServicesTables/INSERT_SERVICE_FIELD_TYPE.sql"),
    ("OHFC_REGION", "LocationsTables/INSERT_REGION.sql"),
    ("OHFC_LOCATION", "LocationsTables/INSERT_LOCATION.sql"),
    ("OHFC_REQUEST", "RequestsTables/INSERT_REQUEST.sql"),
    ("OHFC_SERVICE_FIELD_VALUE", "ServicesTables/INSERT_SERVICE_FIELD_VALUE.sql"),
    ("OHFC_SERVICE_FIELD_MEDIA", "ServicesTables/INSERT_SERVICE_FIELD_MEDIA.sql"),
    ("OHFC_REQUEST_TASK", "RequestsTables/INSERT_REQUEST_TASK.sql"),
    ("OHFC_TASK_MEMBER_OCCURRENCE", "MembersTables/INSERT_TASK_MEMBER_OCCURRENCE.sql"),
    ("OHFC_REQUEST_TASK_MEDIA", "RequestsTables/INSERT_REQUEST_TASK_MEDIA.sql"),
    ("OHFC_REQUEST_TRANSACTION", "RequestsTables/INSERT_REQUEST_TRANSACTION.sql"),
    ("OHFC_CHECKLIST_TYPE", "ChecklistsTables/INSERT_CHECKLIST_TYPE.sql"),
    ("OHFC_CHECKLIST_FIELD_TYPE", "ChecklistsTables/INSERT_CHECKLIST_FIELD_TYPE.sql"),
    ("OHFC_REQUEST_TASK_CHECKLIST", "ChecklistsTables/INSERT_REQUEST_TASK_CHECKLIST.sql"),
    ("OHFC_CHECKLIST_FIELD_VALUE", "ChecklistsTables/INSERT_CHECKLIST_FIELD_VALUE.sql"),
    ("OHFC_IMPORT_TICKET", "ImportTables/INSERT_IMPORT_TICKET.sql"),
    ("OHFC_IMPORT_SNAPSHOT", "ImportTables/INSERT_IMPORT_SNAPSHOT.sql"),
])
EMPTY_REASONS = {
    "OHFC_SLA": "Prazos não foram definidos na análise. Marcos de SLA preservados nos snapshots; nenhum prazo inventado.",
    "OHFC_SERVICE_FIELD_MEDIA": "Sem binários nesta carga. Com import_media_content=false, campos MEDIA são cadastrados e URLs ficam nos snapshots, sem respostas de mídia.",
    "OHFC_REQUEST_TASK": "Não há execução de tarefas estruturada e conciliada nas fontes.",
    "OHFC_TASK_MEMBER_OCCURRENCE": "Não há atribuições de executores por tarefa conciliadas nas fontes.",
    "OHFC_REQUEST_TASK_MEDIA": "Não há anexos binários de tarefas nas fontes.",
    "OHFC_REQUEST_TRANSACTION": "Eventos do histórico não foram convertidos em transferências/aprovações.",
    "OHFC_CHECKLIST_TYPE": "Modelos dos antigos seeds vieram de outros arquivos XLSX, fora desta carga de tickets.",
    "OHFC_CHECKLIST_FIELD_TYPE": "Não foram importados os modelos externos de checklist dos antigos seeds.",
    "OHFC_REQUEST_TASK_CHECKLIST": "Respostas dos formulários permanecem em SERVICE_FIELD_VALUE ou no snapshot.",
    "OHFC_CHECKLIST_FIELD_VALUE": "Não há checklist de tarefa conciliado nesta carga.",
}


def build_data(plan, catalog):
    if plan["summary"]["pending"] or any(r["errors"] for r in plan["rows"]):
        raise ValueError("Exportação SQL exige uma prévia sem pendências")
    rows = [r for r in plan["rows"] if not r.get("duplicate_of")]
    require_media(plan)
    if any(not r.get("request") or not r["request"].get("import_id") for r in rows):
        raise ValueError("Reserve todos os IDs antes de exportar SQL")
    if any(r["request"].get("existing_request_id") for r in rows):
        raise ValueError("SQL de carga inicial não aceita adoção de registros existentes")
    rows.sort(key=lambda r: r["request"]["import_id"])
    data = {table: [] for table in ORDER}
    indexes = defaultdict(dict)

    def add(table, key, values):
        if key not in indexes[table]:
            number = max((r["ID"] for r in data[table]), default=0) + 1
            indexes[table][key] = number
            data[table].append(dict(ID=number, **values))
        return indexes[table][key]

    # Preserve the category IDs used by the UI and the original 46 location paths.
    seed = ROOT / "database/SqlScripts/InsertTable"
    categories = re.findall(r"\('([^']+)'\)", (seed / "ServicesTables/INSERT_SERVICE_CATEGORY.sql").read_text(encoding="utf-8-sig"))
    if len(categories) != 10:
        raise ValueError("Formato inesperado no catálogo de categorias de referência")
    excluded_categories = {norm(c) for c in plan.get("excluded_categories", [])}
    for number, category in enumerate(categories, 1):
        if norm(category) not in excluded_categories:
            indexes["OHFC_SERVICE_CATEGORY"][norm(category)] = number
            data["OHFC_SERVICE_CATEGORY"].append({"ID": number, "NAME": category})
    sectors = re.findall(r'VALUES\s*\("([^"]+)",\s*(\d+)\)', (seed / "MembersTables/INSERT_SECTOR.sql").read_text(encoding="utf-8-sig"))
    if len(sectors) != 12:
        raise ValueError("Formato inesperado no catálogo de setores de referência")
    for name, level in sectors:
        add("OHFC_SECTOR", norm(name), {"NAME": name, "ACCESS_LEVELS": int(level)})

    def place(path):
        business = add("OHFC_BUSINESS", norm(path["business"]), {"NAME": path["business"]})
        region = add("OHFC_REGION", (business, norm(path["region"])), {"ID_BUSINESS": business, "NAME": path["region"]})
        if path.get("region_id") is not None and path["region_id"] != region:
            raise ValueError("ID de região fixo diverge da ordem do catálogo")
        return add("OHFC_LOCATION", (region, norm(path["location"])), {
            "ID_REGION": region, "NAME": path["location"], "LOCATION_X": None, "LOCATION_Y": None,
        })

    for path in catalog:
        place(path)
    for table, names, column in (
        ("OHFC_REQUEST_TYPE", ["Chamado", "Atividade de Pátio"], "NAME"),
        ("OHFC_REQUEST_STATUS", ["Em aberto", "Programada", "Em andamento", "Concluída", "Cancelada"], "DESCRIPTION"),
        ("OHFC_REQUEST_TRANSACTION_STATUS", ["Solicitada", "Aprovada", "Retornada", "Cancelada"], "DESCRIPTION"),
    ):
        for number, name in enumerate(names, 1):
            data[table].append({"ID": number, column: name})

    members = {}
    for row in rows:
        for role in ("Solicitante", "Criador", "Aprovador", "Cancelador"):
            email = str(one(row["raw"], f"E-mail {role}") or "").strip().lower()
            if email:
                name = one(row["raw"], f"Nome {role}")
                members[email] = members.get(email) or name
    for email, name in sorted(members.items()):
        add("OHFC_MEMBERSHIP", email, {"ID_SECTOR": None, "NAME": name, "EMAIL": email, "ACCESS_LEVEL": None})

    for row in rows:
        request = row["request"]
        if norm(request["category"]) in excluded_categories:
            raise ValueError("Categoria excluída ainda presente nas linhas importáveis")
        category = add("OHFC_SERVICE_CATEGORY", norm(request["category"]), {"NAME": request["category"]})
        service = add("OHFC_SERVICE_TYPE", (category, norm(request["service"])), {
            "ID_SERVICE_CATEGORY": category, "NAME": request["service"], "DESCRIPTION": request["subcategory"],
        })
        number = request["import_id"]
        value = {"ID": number, "ID_REQUEST_TYPE": request["request_type_id"],
                 "ID_MEMBERSHIP_REQUESTER": indexes["OHFC_MEMBERSHIP"][request["requester"]["email"]],
                 "ID_MEMBERSHIP_RESPONDER": None, "ID_LOCATION": place(request["location"]),
                 "ID_SERVICE_TYPE": service, "ID_REQUEST_STATUS": request["status_id"],
                 "DESCRIPTION": request["description"]}
        for field in ("created_date", "agreed_date", "started_date", "finished_date", "canceled_date"):
            value[field.upper()] = datetime.fromisoformat(request[field]) if request[field] else None
        data["OHFC_REQUEST"].append(value)
        for field in request["fields"]:
            definition = field.get("definition", {"type": "TEXT", "options": None,
                                                "required": 0, "active": 0, "display_order": None})
            field_id = add("OHFC_SERVICE_FIELD_TYPE", (service, norm(field["name"])), {
                "ID_SERVICE_TYPE": service, "NAME": field["name"], "TYPE": definition["type"],
                "OPTIONS": json.dumps({"value": definition["options"]}, ensure_ascii=False) if definition["options"] is not None else None,
                "REQUIRED": definition["required"], "ACTIVE": definition["active"],
                "DISPLAY_ORDER": definition["display_order"],
            })
            if definition["type"] == "MEDIA":
                if not field.get("import_media_content", True):
                    continue
                for url in field["value"]:
                    data["OHFC_SERVICE_FIELD_MEDIA"].append({
                        "ID": len(data["OHFC_SERVICE_FIELD_MEDIA"]) + 1,
                        "ID_SERVICE_FIELD_TYPE": field_id, "ID_REQUEST": number, **read_asset(url),
                    })
                continue
            data["OHFC_SERVICE_FIELD_VALUE"].append({
                "ID": len(data["OHFC_SERVICE_FIELD_VALUE"]) + 1, "ID_SERVICE_FIELD_TYPE": field_id,
                "ID_REQUEST": number, "VALUE": json.dumps({"value": field["value"]}, ensure_ascii=False, allow_nan=False),
            })

    field_states = defaultdict(list)
    for value in sorted(data["OHFC_SERVICE_FIELD_VALUE"], key=lambda v: (v["ID_SERVICE_FIELD_TYPE"], v["ID"])):
        field_states[value["ID_REQUEST"]].append({"id_service_field_type": value["ID_SERVICE_FIELD_TYPE"], "value": value["VALUE"]})
    requests = {r["ID"]: r for r in data["OHFC_REQUEST"]}
    media_states = defaultdict(list)
    for media in sorted(data["OHFC_SERVICE_FIELD_MEDIA"], key=lambda v: (v["ID_SERVICE_FIELD_TYPE"], v["ID"])):
        media_states[media["ID_REQUEST"]].append(asset_state(media))
    for row in rows:
        number = row["request"]["import_id"]
        state = {"request": {column.lower(): requests[number][column] for column in REQUEST_COLUMNS},
                 "fields": field_states[number]}
        if media_states[number]:
            state["media"] = media_states[number]
        data["OHFC_IMPORT_TICKET"].append({"SOURCE_NAME": plan["source"], "LEGACY_ID": row["legacy_id"],
            "ID_REQUEST": number, "CONTENT_HASH": row["content_hash"], "TARGET_HASH": digest(state)})
        data["OHFC_IMPORT_SNAPSHOT"].append({"ID": len(data["OHFC_IMPORT_SNAPSHOT"]) + 1,
            "SOURCE_NAME": plan["source"], "LEGACY_ID": row["legacy_id"], "ID_REQUEST": number,
            "CONTENT_HASH": row["content_hash"],
            "PAYLOAD": json.dumps({"mapping_hash": plan["mapping_hash"], "row": row}, ensure_ascii=False)})
    return data


def schema_definitions():
    text = (ROOT / "database/SqlScripts/CreateTables/CREATE_ALL_TABLES.sql").read_text(encoding="utf-8-sig")
    text += "\n" + Path(__file__).with_name("install.sql").read_text(encoding="utf-8-sig")
    text = re.sub(r"--[^\n]*", "", text)
    return dict(re.findall(r"CREATE TABLE (\w+)\s*\((.*?)\);", text, re.S))


def validate_data(data):
    """Verify every generated row against the local DDL, including FK/unique keys."""
    schemas = schema_definitions()
    for table, rows in data.items():
        body = schemas[table]
        columns = {}
        for line in body.splitlines():
            match = re.match(r"\s*(\w+)\s+(NUMBER\([^)]*\)|VARCHAR2\((\d+) CHAR\)|DATE|CLOB|BLOB|INTERVAL[^,]*)(.*)", line)
            if match:
                columns[match[1]] = (match[2], int(match[3]) if match[3] else None, match[4])
        keys = re.findall(r"(?:PRIMARY KEY|UNIQUE)\s*\(([^)]+)\)", body)
        for key in keys:
            names = [n.strip() for n in key.split(",")]
            tuples = [tuple(r.get(n) for n in names) for r in rows]
            populated = [t for t in tuples if all(v is not None for v in t)]
            if len(populated) != len(set(populated)):
                raise ValueError(f"Chave repetida: {table} {key}")
        for row in rows:
            if set(row) - columns.keys():
                raise ValueError(f"Coluna desconhecida: {table}")
            for name, (kind, maximum, rest) in columns.items():
                value = row.get(name)
                if value is None and "NOT NULL" in rest and "DEFAULT" not in rest:
                    raise ValueError(f"Campo obrigatório: {table}.{name}")
                if value is None:
                    continue
                if maximum and len(str(value)) > maximum:
                    raise ValueError(f"Texto excede {maximum}: {table}.{name}")
                if kind.startswith("NUMBER"):
                    precision = int(re.search(r"\d+", kind)[0])
                    if type(value) is not int or len(str(abs(value))) > precision:
                        raise ValueError(f"Número inválido: {table}.{name}")
                    if "IN (0, 1)" in rest and value not in (0, 1):
                        raise ValueError(f"Booleano inválido: {table}.{name}")
                if kind == "DATE" and not isinstance(value, datetime):
                    raise ValueError(f"Data inválida: {table}.{name}")
                if kind == "BLOB" and (not isinstance(value, bytes) or not value):
                    raise ValueError(f"Arquivo binário inválido: {table}.{name}")
                if "IS JSON" in rest:
                    parsed = json.loads(value)
                    if name in ("VALUE", "OPTIONS") and set(parsed) != {"value"}:
                        raise ValueError("Envelope JSON inválido")
        for column, parent, parent_column in re.findall(r"FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)", body):
            allowed = {r[parent_column] for r in data[parent]}
            if any(r.get(column) is not None and r[column] not in allowed for r in rows):
                raise ValueError(f"FK inválida: {table}.{column} → {parent}")


def string_chunks(value, byte_limit=900):
    current, size = [], 0
    for char in value:
        length = len(char.encode("utf-8"))
        if current and size + length > byte_limit:
            yield "".join(current)
            current, size = [], 0
        current.append(char)
        size += length
    if current or not value:
        yield "".join(current)


def literal(value, clob=False):
    if value is None:
        return "NULL"
    if isinstance(value, datetime):
        return "TO_DATE('" + value.isoformat(sep=" ", timespec="seconds") + "', 'YYYY-MM-DD HH24:MI:SS')"
    if type(value) is int:
        return str(value)
    if not isinstance(value, str):
        raise ValueError(f"Tipo não suportado em SQL: {type(value)}")
    parts = []
    for segment in re.split(r"([\r\n\t])", value):
        if not segment:
            continue
        if segment in ("\r", "\n", "\t"):
            parts.append(f"CHR({ord(segment)})")
        else:
            for chunk in string_chunks(segment):
                token = "'" + chunk.replace("'", "''") + "'"
                parts.append(f"TO_CLOB({token})" if clob else token)
    if not parts:
        return "EMPTY_CLOB()" if clob else "NULL"
    if clob and not parts[0].startswith("TO_CLOB("):
        parts[0] = f"TO_CLOB({parts[0]})"
    return "\n    || ".join(parts)


def insert_sql(table, row):
    if isinstance(row.get("CONTENT"), bytes):
        values = ["EMPTY_BLOB()" if column == "CONTENT" else literal(value)
                  for column, value in row.items()]
        lines = ["DECLARE", "    media_blob BLOB;", "BEGIN",
                 f"    INSERT INTO {table} ({', '.join(row)})",
                 "    VALUES (" + ", ".join(values) + ") RETURNING CONTENT INTO media_blob;"]
        for start in range(0, len(row["CONTENT"]), 900):
            chunk = row["CONTENT"][start:start + 900]
            lines.append(f"    DBMS_LOB.WRITEAPPEND(media_blob, {len(chunk)}, HEXTORAW('{chunk.hex()}'));")
        lines.extend(["END;", "/", ""])
        return "\n".join(lines)
    expressions = [literal(value, column in ("VALUE", "OPTIONS", "PAYLOAD")) for column, value in row.items()]
    return f"INSERT INTO {table} ({', '.join(row)})\nVALUES (\n    " + ",\n    ".join(expressions) + "\n);\n"


PREAMBLE = """-- Oracle 19c. Executar como script SQL*Plus/SQLcl (SQL Developer: F5).
-- Carga inicial; requer as tabelas existentes e vazias. UTF-8.
SET DEFINE OFF
SET SQLBLANKLINES ON
SET AUTOCOMMIT OFF
SET ECHO OFF
WHENEVER OSERROR EXIT FAILURE ROLLBACK
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK
"""


def guard_sql(data):
    lines = ["-- Falha antes de inserir se qualquer tabela de destino estiver povoada.", "DECLARE", "    n NUMBER;", "BEGIN"]
    for table in data:
        lines.extend([f"    EXECUTE IMMEDIATE 'LOCK TABLE {table} IN EXCLUSIVE MODE NOWAIT';",
                      f"    SELECT COUNT(*) INTO n FROM {table};",
                      f"    IF n <> 0 THEN RAISE_APPLICATION_ERROR(-20001, '{table} deve estar vazia'); END IF;"])
    lines.extend(["END;", "/", ""])
    return "\n".join(lines)


def finalize_sql(data):
    lines = ["-- Confere totais e avança identities sem DDL nem commit intermediário.", "DECLARE",
             "    n NUMBER;", "    seq_name VARCHAR2(128);", "    increment_value NUMBER;", "    next_id NUMBER;", "BEGIN"]
    for table, rows in data.items():
        lines.extend([f"    SELECT COUNT(*) INTO n FROM {table};",
                      f"    IF n <> {len(rows)} THEN RAISE_APPLICATION_ERROR(-20002, 'Total divergente: {table}'); END IF;"])
        if rows and "ID" in rows[0]:
            maximum = max(r["ID"] for r in rows)
            lines.extend([
                "    SELECT I.SEQUENCE_NAME, S.INCREMENT_BY INTO seq_name, increment_value",
                "    FROM USER_TAB_IDENTITY_COLS I JOIN USER_SEQUENCES S ON S.SEQUENCE_NAME=I.SEQUENCE_NAME",
                f"    WHERE I.TABLE_NAME='{table}' AND I.COLUMN_NAME='ID';",
                "    IF increment_value <= 0 THEN RAISE_APPLICATION_ERROR(-20003, 'Identity deve ser crescente'); END IF;",
                "    LOOP",
                "        EXECUTE IMMEDIATE 'SELECT ' || DBMS_ASSERT.ENQUOTE_NAME(seq_name, FALSE) || '.NEXTVAL FROM DUAL' INTO next_id;",
                f"        EXIT WHEN next_id > {maximum};",
                "    END LOOP;",
            ])
    lines.extend(["END;", "/", "COMMIT;", ""])
    return "\n".join(lines)


def export_sql(plan, catalog, directory):
    data = build_data(plan, catalog)
    validate_data(data)
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    main_data = {table: rows for table, rows in data.items() if not table.startswith("OHFC_IMPORT_")}
    import_data = {table: rows for table, rows in data.items() if table.startswith("OHFC_IMPORT_")}
    scripts = OrderedDict()
    import_scripts = OrderedDict()
    scripts["00_VALIDATE_EMPTY.sql"] = guard_sql(main_data)
    import_scripts["ImportTables/00_VALIDATE_EMPTY.sql"] = guard_sql(import_data)
    for table, relative in ORDER.items():
        text = f"-- {table}: {len(data[table])} registros. Gerado pelas regras revisadas da importação.\n"
        text += "-- Sem COMMIT individual; executar pelo consolidado correspondente.\n"
        if not data[table]:
            text += "-- " + EMPTY_REASONS.get(table, "Sem dados nas fontes.") + "\n"
        text += "\n" + "\n".join(insert_sql(table, row) for row in data[table])
        target = import_scripts if table in import_data else scripts
        target[relative] = text
    scripts["99_VALIDATE_AND_SYNC_IDENTITIES.sql"] = finalize_sql(main_data)
    import_scripts["ImportTables/99_VALIDATE_AND_SYNC_IDENTITIES.sql"] = finalize_sql(import_data)
    for relative, text in list(scripts.items()) + list(import_scripts.items()):
        path = directory / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    (directory / "INSERT_ALL_TABLES.sql").write_text(PREAMBLE + "\n" + "\n".join(scripts.values()), encoding="utf-8")
    (directory / "INSERT_IMPORT_TABLES.sql").write_text(
        PREAMBLE + "\n-- Executar após a carga principal e a instalação das tabelas de auditoria.\n"
        + "\n".join(import_scripts.values()), encoding="utf-8")
    (directory / "RUN_SQLPLUS.sql").write_text(PREAMBLE + "\n" + "\n".join(f"@@{path}" for path in scripts) + "\n", encoding="utf-8")
    (directory / "INSTALL_IMPORT_TABLES.sql").write_text(Path(__file__).with_name("install.sql").read_text(encoding="utf-8-sig"), encoding="utf-8")
    counts = {table: len(rows) for table, rows in data.items()}
    manifest = {"format": "Oracle 19c initial load", "source": plan["source"], "mapping_hash": plan["mapping_hash"],
                "counts": counts, "files": {path.relative_to(directory).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
                                             for path in sorted(directory.rglob("*.sql"))},
                "sql_executed_in_database": False}
    (directory / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Carga Oracle dos relatórios de chamados", "",
             "Scripts gerados das planilhas e regras aprovadas. Não foram executados em Oracle.", "",
             "## Execução", "",
             "1. Crie as 23 tabelas com `database/SqlScripts/CreateTables/CREATE_ALL_TABLES.sql`, em uma base vazia.",
             "2. Execute **INSERT_ALL_TABLES.sql ou RUN_SQLPLUS.sql**, nunca ambos, como script (SQL Developer: F5). Ambos carregam somente as 23 tabelas originais.",
             "3. Execute `INSTALL_IMPORT_TABLES.sql` uma vez, separadamente: DDL das duas tabelas de auditoria.",
             "4. Execute `INSERT_IMPORT_TABLES.sql` para carregar OHFC_IMPORT_TICKET e OHFC_IMPORT_SNAPSHOT, após a carga principal.",
             "", "A carga principal não depende das tabelas de auditoria. RUN_SQLPLUS.sql executa somente os arquivos do domínio principal.",
             "Cada carga exige suas próprias tabelas de destino vazias e obtém locks de escrita NOWAIT. A auditoria referencia os chamados já carregados.",
             "Cada consolidado tem seu próprio COMMIT, após conferir totais e avançar as identities. Em erro na auditoria, a carga principal já confirmada permanece.",
             "O usuário da conexão deve ser proprietário das tabelas. Avanços de sequences podem deixar lacunas após rollback.",
             "Use cliente/arquivo UTF-8 e preserve SET DEFINE OFF para não interpretar & dos dados como variáveis.",
             "", "## Conteúdo e limites", "",
             f"- {len(data['OHFC_REQUEST'])} solicitações com IDs reservados; correspondências preservadas em IMPORT_TICKET.",
             "- IDs de categorias de referência e os 46 locais originais preservados; novos cadastros acrescentados.",
             "- Membros deduplicados por e-mail, incluindo papéis de auditoria. Setores do catálogo legado preservados, sem atribuir permissões aos membros.",
             "- Campos correspondentes ao catálogo legado preservam TYPE, OPTIONS, REQUIRED, ACTIVE e DISPLAY_ORDER; respostas têm tipos JSON compatíveis. Campos novos são TEXT, ativos, opcionais e ordenados após os campos legados.",
             "- IMPORT_TICKET e IMPORT_SNAPSHOT preservam correspondência, hashes, originais, URLs e descrições integrais.",
             "- URLs de campos adicionais geram definições MEDIA. Com import_media_content=false, não são geradas respostas em SERVICE_FIELD_MEDIA nem SERVICE_FIELD_VALUE; URLs permanecem nos snapshots. Quando a importação de binários está habilitada, o cache completo é obrigatório. Placeholders not-found-deskbee.jpg são ignorados.",
             "- Tabelas sem fonte suficiente têm arquivos explicativos sem INSERT. Não foram inventados SLAs, tarefas ou checklists.",
             "- Estes arquivos servem para a carga inicial. Para cargas incrementais, use o importador Python e mantenha request_numbers.json.",
             "", "## Validação local", "",
             "Conferidos tipos, tamanhos, chaves primárias/únicas, FKs e envelopes JSON contra os DDLs locais.",
             "Teste de execução no Oracle continua necessário. O manifest informa contagens e hashes dos arquivos por domínio.",
             "", "| Tabela | Registros |", "| --- | ---: |"]
    lines.extend(f"| {table} | {count} |" for table, count in counts.items())
    (directory / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (directory / "MEDIA_IMPORT_STATUS.md").write_text(
        "# Situação das mídias na carga gerada\n\n"
        + f"{sum(f['TYPE'] == 'MEDIA' for f in data['OHFC_SERVICE_FIELD_TYPE'])} definições MEDIA; "
        + f"{len(data['OHFC_SERVICE_FIELD_MEDIA'])} respostas com binários.\n\n"
        + "Quando import_media_content=false, os anexos históricos não são importados, conforme configuração. "
        + "As URLs permanecem nos snapshots. Nenhum BLOB vazio substitui arquivos ausentes.\n\n"
        + "Scripts regenerados; não executados no Oracle.\n", encoding="utf-8")
    return manifest
