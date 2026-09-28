"""Oracle persistence. All mutations belong to one caller-owned transaction."""
from __future__ import annotations

import json
import re
from datetime import datetime

from .core import digest, norm, parse_date


class ImportConflict(ValueError):
    pass


REQUEST_COLUMNS = (
    "ID_REQUEST_TYPE", "ID_MEMBERSHIP_REQUESTER", "ID_LOCATION", "ID_SERVICE_TYPE",
    "ID_REQUEST_STATUS", "CREATED_DATE", "AGREED_DATE", "STARTED_DATE", "FINISHED_DATE",
    "CANCELED_DATE", "DESCRIPTION",
)


class OracleStore:
    def __init__(self, connection):
        self.connection = connection

    def rows(self, sql, **params):
        with self.connection.cursor() as cursor:
            cursor.execute(sql, params)
            names = [c[0].lower() for c in cursor.description]
            return [dict(zip(names, [v.read() if hasattr(v, "read") else v for v in row])) for row in cursor]

    def execute(self, sql, **params):
        with self.connection.cursor() as cursor:
            cursor.execute(sql, params)

    def insert(self, table, values):
        # Table/column identifiers originate exclusively in this module.
        import oracledb
        with self.connection.cursor() as cursor:
            output = cursor.var(oracledb.DB_TYPE_NUMBER)
            statement = f"INSERT INTO {table} ({','.join(values)}) VALUES ({','.join(':'+k for k in values)}) RETURNING ID INTO :new_id"
            if "VALUE" in values:
                cursor.setinputsizes(VALUE=oracledb.DB_TYPE_CLOB)
            if "PAYLOAD" in values:
                cursor.setinputsizes(PAYLOAD=oracledb.DB_TYPE_CLOB)
            cursor.execute(statement, dict(values, new_id=output))
            return int(output.getvalue()[0])

    def named_id(self, table, name, parent=None, extra=None):
        parent = parent or {}
        where = " AND ".join(f"{k}=:{k}" for k in parent)
        rows = self.rows(f"SELECT ID, NAME FROM {table}" + (f" WHERE {where}" if where else ""), **parent)
        matches = [r for r in rows if norm(r["name"]) == norm(name)]
        if len(matches) > 1:
            raise ImportConflict(f"Cadastro ambíguo em {table}: {name}")
        if matches:
            return int(matches[0]["id"])
        return self.insert(table, dict(parent, NAME=name, **(extra or {})))

    def member_id(self, member):
        matches = self.rows("SELECT ID FROM OHFC_MEMBERSHIP WHERE LOWER(TRIM(EMAIL))=:email", email=member["email"])
        if len(matches) > 1:
            raise ImportConflict(f"E-mail duplicado em MEMBERSHIP: {member['email']}")
        if matches:
            return int(matches[0]["id"])
        # No access rights, sectors, or invented names are assigned by the import.
        return self.insert("OHFC_MEMBERSHIP", {"NAME": member["name"], "EMAIL": member["email"]})

    def request_values(self, request):
        location = request["location"]
        if location.get("region_id") is not None:
            region = location["region_id"]
            matches = self.rows("SELECT R.NAME REGION_NAME, B.NAME BUSINESS_NAME FROM OHFC_REGION R JOIN OHFC_BUSINESS B ON B.ID=R.ID_BUSINESS WHERE R.ID=:id", id=region)
            if len(matches) != 1 or norm(matches[0]["region_name"]) != norm(location["region"]) or norm(matches[0]["business_name"]) != norm(location["business"]):
                raise ImportConflict(f"Região {region} não corresponde ao destino padrão configurado")
        else:
            business = self.named_id("OHFC_BUSINESS", location["business"])
            region = self.named_id("OHFC_REGION", location["region"], {"ID_BUSINESS": business})
        place = self.named_id("OHFC_LOCATION", location["location"], {"ID_REGION": region})
        category = self.named_id("OHFC_SERVICE_CATEGORY", request["category"])
        service = self.named_id("OHFC_SERVICE_TYPE", request["service"], {"ID_SERVICE_CATEGORY": category},
                                {"DESCRIPTION": request["subcategory"]})
        values = {"ID_REQUEST_TYPE": request["request_type_id"],
                  "ID_MEMBERSHIP_REQUESTER": self.member_id(request["requester"]),
                  "ID_LOCATION": place, "ID_SERVICE_TYPE": service,
                  "ID_REQUEST_STATUS": request["status_id"], "DESCRIPTION": request["description"]}
        for name in ("created_date", "agreed_date", "started_date", "finished_date", "canceled_date"):
            values[name.upper()] = datetime.fromisoformat(request[name]) if request[name] else None
        return values

    def state_hash(self, request_id):
        request = self.rows(f"SELECT {','.join(REQUEST_COLUMNS)} FROM OHFC_REQUEST WHERE ID=:id", id=request_id)
        if len(request) != 1:
            raise ImportConflict("Solicitação da correspondência não existe")
        fields = self.rows("SELECT ID_SERVICE_FIELD_TYPE, VALUE FROM OHFC_SERVICE_FIELD_VALUE WHERE ID_REQUEST=:id ORDER BY ID_SERVICE_FIELD_TYPE, ID", id=request_id)
        return digest({"request": request[0], "fields": fields})

    def advance_request_identity(self):
        # Advance the actual identity sequence without DDL/implicit commit. Oracle
        # sequence advances are not rolled back, so a failed import may leave gaps.
        rows = self.rows("SELECT I.SEQUENCE_NAME, S.INCREMENT_BY FROM USER_TAB_IDENTITY_COLS I JOIN USER_SEQUENCES S ON S.SEQUENCE_NAME=I.SEQUENCE_NAME WHERE I.TABLE_NAME='OHFC_REQUEST' AND I.COLUMN_NAME='ID'")
        if len(rows) != 1 or rows[0]["increment_by"] <= 0:
            raise ImportConflict("Identity crescente de OHFC_REQUEST não encontrada no schema da conexão")
        sequence = rows[0]["sequence_name"]
        if not re.fullmatch(r"[A-Z0-9_$#]+", sequence):
            raise ImportConflict("Nome de sequence inválido")
        self.execute(f'''DECLARE
            maximum_id NUMBER;
            next_id NUMBER;
        BEGIN
            SELECT NVL(MAX(ID), 0) INTO maximum_id FROM OHFC_REQUEST;
            LOOP
                SELECT "{sequence}".NEXTVAL INTO next_id FROM DUAL;
                EXIT WHEN next_id > maximum_id;
            END LOOP;
        END;''')

    def save_fields(self, request_id, service_id, fields):
        existing = self.rows("SELECT ID, NAME, TYPE FROM OHFC_SERVICE_FIELD_TYPE WHERE ID_SERVICE_TYPE=:id", id=service_id)
        for field in fields:
            matches = [r for r in existing if norm(r["name"]) == norm(field["name"])]
            if len(matches) > 1:
                raise ImportConflict(f"Definição de campo ambígua: {field['name']}")
            if matches:
                definition = matches[0]
            else:
                field_id = self.insert("OHFC_SERVICE_FIELD_TYPE", {
                    "ID_SERVICE_TYPE": service_id, "NAME": field["name"], "TYPE": "TEXT",
                    "REQUIRED": 0, "ACTIVE": 0, "DISPLAY_ORDER": None,
                })
                definition = {"id": field_id, "name": field["name"], "type": "TEXT"}
                existing.append(definition)
            value = convert_field(field["value"], definition["type"])
            previous = self.rows("SELECT ID FROM OHFC_SERVICE_FIELD_VALUE WHERE ID_REQUEST=:request AND ID_SERVICE_FIELD_TYPE=:field", request=request_id, field=definition["id"])
            if previous:
                raise ImportConflict("Campo já existente; a importação não sobrescreve respostas independentes")
            self.insert("OHFC_SERVICE_FIELD_VALUE", {
                "ID_REQUEST": request_id, "ID_SERVICE_FIELD_TYPE": definition["id"],
                "VALUE": json.dumps({"value": value}, ensure_ascii=False, allow_nan=False),
            })

    def lock(self):
        # Serialize importers and prevent simultaneous changes to the mapped tables.
        for table in ("OHFC_IMPORT_TICKET", "OHFC_IMPORT_SNAPSHOT", "OHFC_REQUEST",
                      "OHFC_BUSINESS", "OHFC_REGION", "OHFC_LOCATION", "OHFC_MEMBERSHIP",
                      "OHFC_SERVICE_CATEGORY", "OHFC_SERVICE_TYPE", "OHFC_SERVICE_FIELD_TYPE",
                      "OHFC_SERVICE_FIELD_VALUE"):
            self.execute(f"LOCK TABLE {table} IN EXCLUSIVE MODE NOWAIT")

    def check_catalog_ids(self):
        expected = {1: "Em aberto", 2: "Programada", 3: "Em andamento", 4: "Concluída", 5: "Cancelada"}
        statuses = {int(r["id"]): norm(r["description"]) for r in self.rows("SELECT ID, DESCRIPTION FROM OHFC_REQUEST_STATUS")}
        types = {int(r["id"]): norm(r["name"]) for r in self.rows("SELECT ID, NAME FROM OHFC_REQUEST_TYPE")}
        if any(statuses.get(k) != norm(v) for k, v in expected.items()) or types.get(1) != "chamado" or types.get(2) != "atividade de patio":
            raise ImportConflict("Catálogos REQUEST_STATUS/REQUEST_TYPE não correspondem aos IDs do projeto")

    def has_unmanaged_requests(self):
        return bool(self.rows("SELECT R.ID FROM OHFC_REQUEST R WHERE NOT EXISTS (SELECT 1 FROM OHFC_IMPORT_TICKET I WHERE I.ID_REQUEST=R.ID) FETCH FIRST 1 ROWS ONLY"))


def convert_field(value, field_type):
    kind = (field_type or "").upper()
    if kind in ("TEXT", "SINGLE_SELECT"):
        return str(value)
    if kind == "DATE":
        try:
            return parse_date(value)
        except ValueError as exc:
            raise ImportConflict(str(exc)) from exc
    if kind == "NUMBER":
        from decimal import Decimal, InvalidOperation
        try:
            number = Decimal(str(value).strip().replace(",", "."))
            if not number.is_finite():
                raise InvalidOperation
            return int(number) if number == int(number) else float(number)
        except (InvalidOperation, ValueError, OverflowError):
            raise ImportConflict(f"Número inválido: {value}") from None
    if kind == "BOOL":
        if norm(value) in ("true", "sim", "1"):
            return True
        if norm(value) in ("false", "nao", "0"):
            return False
        raise ImportConflict(f"Booleano inválido: {value}")
    if kind == "MULTI_SELECT":
        if isinstance(value, list):
            return value
        try:
            decoded = json.loads(value)
            if isinstance(decoded, list):
                return decoded
        except (ValueError, TypeError):
            pass
        raise ImportConflict("MULTI_SELECT precisa de um array JSON explícito")
    raise ImportConflict(f"Tipo de campo não importável como resposta textual: {kind}")


def apply_plan(store, plan, *, update_existing=False, allow_new_in_existing=False):
    """Apply only ready rows. Any DB error rolls the entire batch back."""
    counts = {"inserted": 0, "updated": 0, "unchanged": 0, "pending": plan["summary"]["pending"]}
    try:
        store.lock()
        store.check_catalog_ids()
        if not allow_new_in_existing and store.has_unmanaged_requests():
            # Explicit adoption may reconcile an already populated legacy seed database.
            ready = [r for r in plan["rows"] if not r["errors"] and not r.get("duplicate_of")]
            if any(not r["request"].get("existing_request_id") and not store.rows(
                    "SELECT ID_REQUEST FROM OHFC_IMPORT_TICKET WHERE SOURCE_NAME=:source AND LEGACY_ID=:legacy",
                    source=plan["source"], legacy=r["legacy_id"]) for r in ready):
                raise ImportConflict("Banco contém chamados sem correspondência. Preencha existing_request_ids ou use --allow-new-in-existing após conciliar a carga antiga")
        for row in plan["rows"]:
            if row["errors"] or row.get("duplicate_of"):
                continue
            source, legacy = plan["source"], row["legacy_id"]
            previous = store.rows("SELECT ID_REQUEST, CONTENT_HASH, TARGET_HASH FROM OHFC_IMPORT_TICKET WHERE SOURCE_NAME=:source AND LEGACY_ID=:legacy", source=source, legacy=legacy)
            desired_id = row["request"].get("import_id")
            if previous and desired_id is not None and int(previous[0]["id_request"]) != desired_id:
                raise ImportConflict(f"Numeração revisada de {legacy} diverge do ID já importado; concilie a base")
            if previous and previous[0]["content_hash"] == row["content_hash"]:
                counts["unchanged"] += 1
                continue
            if previous and not update_existing:
                raise ImportConflict(f"Chamado {legacy} mudou na origem. Revise e use --update-existing")
            if previous and store.state_hash(previous[0]["id_request"]) != previous[0]["target_hash"]:
                raise ImportConflict(f"Chamado {legacy} foi editado no destino; conciliação manual necessária")
            adopted = row["request"].get("existing_request_id")
            if adopted and desired_id is not None and adopted != desired_id:
                raise ImportConflict("ID de adoção diferente do número de destino reservado")
            if adopted and not previous:
                if not update_existing:
                    raise ImportConflict("Adoção de chamado existente exige --update-existing")
                if store.rows("SELECT ID_REQUEST FROM OHFC_IMPORT_TICKET WHERE ID_REQUEST=:id", id=adopted):
                    raise ImportConflict("ID de adoção já vinculado a outro chamado legado")
                store.state_hash(adopted)  # Verify existence before mutation.
                if store.rows("SELECT ID FROM OHFC_SERVICE_FIELD_VALUE WHERE ID_REQUEST=:id", id=adopted):
                    raise ImportConflict("Adoção com respostas existentes exige conciliação prévia; nenhuma resposta foi excluída")
            values = store.request_values(row["request"])
            if previous or adopted:
                request_id = previous[0]["id_request"] if previous else adopted
                store.execute("UPDATE OHFC_REQUEST SET " + ",".join(f"{k}=:{k}" for k in REQUEST_COLUMNS) + " WHERE ID=:request_id", **values, request_id=request_id)
                if previous:
                    store.execute("DELETE FROM OHFC_SERVICE_FIELD_VALUE WHERE ID_REQUEST=:id", id=request_id)
                counts["updated"] += 1
            else:
                if desired_id is not None:
                    if store.rows("SELECT ID FROM OHFC_REQUEST WHERE ID=:id", id=desired_id):
                        raise ImportConflict(f"REQUEST.ID {desired_id} já está ocupado por outro registro")
                    values["ID"] = desired_id
                request_id = store.insert("OHFC_REQUEST", values)
                counts["inserted"] += 1
            store.save_fields(request_id, values["ID_SERVICE_TYPE"], row["request"]["fields"])
            target_hash = store.state_hash(request_id)
            params = dict(source=source, legacy=legacy, request_id=request_id, content_hash=row["content_hash"], target_hash=target_hash)
            if previous:
                store.execute("UPDATE OHFC_IMPORT_TICKET SET CONTENT_HASH=:content_hash, TARGET_HASH=:target_hash WHERE SOURCE_NAME=:source AND LEGACY_ID=:legacy AND ID_REQUEST=:request_id", **params)
            else:
                store.execute("INSERT INTO OHFC_IMPORT_TICKET (SOURCE_NAME,LEGACY_ID,ID_REQUEST,CONTENT_HASH,TARGET_HASH) VALUES (:source,:legacy,:request_id,:content_hash,:target_hash)", **params)
            store.insert("OHFC_IMPORT_SNAPSHOT", {"SOURCE_NAME": source, "LEGACY_ID": legacy,
                         "ID_REQUEST": request_id, "CONTENT_HASH": row["content_hash"],
                         "PAYLOAD": json.dumps({"mapping_hash": plan["mapping_hash"], "row": row}, ensure_ascii=False)})
        if any(r.get("request", {}).get("import_id") is not None for r in plan["rows"] if r.get("request")) and (counts["inserted"] or counts["updated"]):
            store.advance_request_identity()
        store.connection.commit()
        return counts
    except Exception:
        store.connection.rollback()
        raise
