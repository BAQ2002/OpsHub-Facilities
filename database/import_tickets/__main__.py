"""python -m database.import_tickets --help"""
import argparse
import json
from pathlib import Path

from .core import build_plan, load_mapping, read_workbooks, render_report, reserve_numbers


def main():
    parser = argparse.ArgumentParser(description="Interpreta relatórios XLSX por regras semânticas; padrão: somente prévia")
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--mapping", type=Path, default=Path(__file__).with_name("mapping.json"))
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("output") / "preview.json")
    parser.add_argument("--apply", action="store_true", help="Grava no Oracle após gerar a prévia; requer install.sql")
    parser.add_argument("--reserve-numbers", action="store_true", help="Reserva IDs persistentes para novas origens no numbering_file")
    parser.add_argument("--export-sql", type=Path, help="Gera scripts Oracle de carga inicial organizados por domínio, sem acessar o banco")
    parser.add_argument("--download-media", action="store_true", help="Baixa arquivos de URLs válidas para o cache antes da carga")
    parser.add_argument("--allow-pending", action="store_true", help="Importa somente linhas resolvidas; pendentes ficam no relatório")
    parser.add_argument("--update-existing", action="store_true", help="Atualiza chamados importados e inalterados no destino")
    parser.add_argument("--allow-new-in-existing", action="store_true", help="Permite novos chamados em base com solicitações sem correspondência")
    args = parser.parse_args()
    if args.export_sql and args.apply:
        parser.error("Use --export-sql separadamente de --apply")
    if args.output.suffix.lower() != ".json":
        parser.error("--output deve ser um arquivo .json (o resumo .md é gerado ao lado)")
    config, catalog = load_mapping(args.mapping)
    raw_rows = list(read_workbooks(args.files))
    plan = build_plan(raw_rows, config, catalog)
    if args.reserve_numbers:
        if not config.get("numbering_file"):
            parser.error("Configure numbering_file antes de reservar IDs")
        config["request_numbers"] = reserve_numbers(plan["rows"], config["request_numbers"])
        numbers_path = args.mapping.parent / config["numbering_file"]
        numbers_path.write_text(json.dumps(config["request_numbers"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        plan = build_plan(raw_rows, config, catalog)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")
    report = args.output.with_suffix(".md")
    report.write_text(render_report(plan), encoding="utf-8")
    print(json.dumps(plan["summary"], ensure_ascii=False))
    print(f"Prévia e pendências: {args.output.resolve()}")
    print(f"Resumo: {report.resolve()}")
    from .media import prepare_media, require_media
    media = prepare_media(plan, download=args.download_media)
    args.output.with_name("media_manifest.json").write_text(json.dumps(media, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Mídias: {media['references']} referências; {media['missing_references']} sem arquivo")
    if args.apply or args.export_sql:
        require_media(plan)
    if args.export_sql:
        from .export_sql import export_sql
        manifest = export_sql(plan, catalog, args.export_sql)
        print(f"Scripts Oracle: {args.export_sql.resolve()}")
        print(json.dumps(manifest["counts"], ensure_ascii=False))
    if not args.apply:
        return 0
    if plan["summary"]["pending"] and not args.allow_pending:
        parser.exit(2, "Existem pendências. Corrija o mapeamento ou use --allow-pending para carga parcial explícita.\n")
    from backend.app.database import settings
    from .oracle import OracleStore, apply_plan
    import oracledb

    if not all((settings.oracle_user, settings.oracle_password.get_secret_value(), settings.oracle_dsn)):
        parser.exit(2, "Configure ORACLE_USER, ORACLE_PASSWORD e ORACLE_DSN.\n")
    with oracledb.connect(user=settings.oracle_user, password=settings.oracle_password.get_secret_value(), dsn=settings.oracle_dsn) as connection:
        connection.call_timeout = settings.oracle_call_timeout_ms
        counts = apply_plan(OracleStore(connection), plan, update_existing=args.update_existing,
                            allow_new_in_existing=args.allow_new_in_existing)
    print(json.dumps(counts, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
