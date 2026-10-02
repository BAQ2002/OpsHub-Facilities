"""Read legacy field metadata without executing its PostgreSQL SQL."""
import json
import re

from .core import aliases, norm


def read_catalog(path, config):
    text = path.read_text(encoding="utf-8-sig")
    quoted = r"'((?:''|[^'])*)'"
    pattern = (r"SELECT ST.ID, " + quoted + r", " + quoted
               + r", (.*?),\s*(TRUE|FALSE),\s*(TRUE|FALSE),\s*(\d+)\s+FROM.*?WHERE SC.NAME = "
               + quoted + r"\s+AND ST.NAME = " + quoted)
    result = []
    categories = aliases(config, "category_aliases")
    for match in re.finditer(pattern, text, re.S):
        name, kind, options, required, active, order, category, service = match.groups()
        name, category, service = (v.replace("''", "'") for v in (name, category, service))
        if options != "NULL":
            option_match = re.fullmatch(quoted + r"::JSONB", options)
            if not option_match:
                raise ValueError(f"Opções SQL não reconhecidas: {name}")
            options = json.loads(option_match[1].replace("''", "'"))
        else:
            options = None
        result.append({"category": categories.get(norm(category), category), "service": service,
                       "name": name.strip(), "type": kind, "options": options,
                       "required": int(required == "TRUE"), "active": int(active == "TRUE"),
                       "display_order": int(order)})
    if len(result) != text.count("INSERT INTO OHFC_SERVICE_FIELD_TYPE"):
        raise ValueError("Catálogo de campos não foi interpretado integralmente")
    return result


def prepare_fields(fields, category, service, config, warnings):
    from .oracle import convert_field
    definitions = [d for d in config.get("field_catalog", [])
                   if norm(d["category"]) == norm(category) and norm(d["service"]) == norm(service)]
    names = aliases(config, "field_aliases")
    def key(name):
        return norm(names.get(norm(name), name))
    last_order = max((d["display_order"] for d in definitions), default=0)
    for index, field in enumerate(fields, 1):
        matches = [d for d in definitions if key(d["name"]) == key(field["name"])]
        if len(matches) > 1:
            raise ValueError(f"Definição de campo ambígua: {field['name']}")
        if matches:
            definition = {k: v for k, v in matches[0].items() if k not in ("category", "service", "name")}
        else:
            definition = {"type": "TEXT", "options": None, "required": 0,
                          "active": 1, "display_order": last_order + index}
        value = field["value"]
        if field.get("media"):
            definition["type"] = "MEDIA"
            definition["options"] = None
            field["definition"] = definition
            field["import_media_content"] = config.get("import_media_content", True)
            continue
        if definition["type"] == "MULTI_SELECT" and isinstance(value, str):
            try:
                decoded = json.loads(value)
            except ValueError:
                decoded = None
            value = decoded if isinstance(decoded, list) else [part.strip() for part in value.split(",") if part.strip()]
        field["value"] = convert_field(value, definition["type"])
        field["definition"] = definition
        if definition["options"] is not None:
            values = field["value"] if isinstance(field["value"], list) else [field["value"]]
            allowed = {norm(v) for v in definition["options"]}
            if any(norm(v) not in allowed for v in values):
                warnings.append(f"Resposta histórica fora das opções do catálogo, preservada: {field['name']}")
