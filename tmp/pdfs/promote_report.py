from pathlib import Path

target=Path('backend/app/api/request/report.py')
src=Path('tmp/pdfs/build_report.py').read_text(encoding='utf-8')
imports=src[:src.index('ROOT=')]
imports=imports.replace('from pathlib import Path','from io import BytesIO').replace('from reportlab.pdfbase import pdfmetrics\n','').replace('from reportlab.pdfbase.ttfonts import TTFont\n','')
body=src[src.index('NAVY='):src.index("print(str(OUT))")]
body=body.replace("'ArialBold'","'Helvetica-Bold'").replace("'Arial'","'Helvetica'")
body=body.replace("def date(v): return datetime.fromisoformat(v).strftime('%d/%m/%Y %H:%M') if v else 'Não informado'", "def date(v): return (datetime.fromisoformat(v) if isinstance(v,str) else v).strftime('%d/%m/%Y %H:%M') if v else 'Não informado'")
body=body.replace('ensure_ascii=False)', 'ensure_ascii=False, default=str)')
body=body.replace("'Período de abertura: 01/01/2026 a 30/09/2026 (inclusive)'", "f'Período de abertura: {period} (inclusive)'")
body=body.replace('Abrangência: todas as organizações, categorias, locais e situações cadastradas no período.', 'Filtros: {filter_description}.')
body=body.replace("'Seleção pela data de criação: de 01/01/2026 às 00:00 até antes de 01/10/2026 às 00:00, conforme os horários armazenados no banco. As situações e os demais dados são os existentes na extração; não representam uma reconstrução histórica do fechamento de setembro.'", "'Seleção pela data de criação, incluindo todo o último dia do período, conforme os horários armazenados no banco. As situações e os demais dados são os existentes na extração; não representam uma reconstrução histórica do encerramento do período.'")
body=body.replace("'01/01/2026 a 30/09/2026 | Fonte: base Oracle do OpsHub'", "f'{period} | Fonte: base Oracle do OpsHub'")
body=body.replace("title='Relatório de chamados | Janeiro a setembro de 2026'", "title=f'Relatório de chamados | {period}'")
body=body.replace('SimpleDocTemplate(str(OUT)', 'SimpleDocTemplate(OUT')
body=body.replace('PdfReader(str(OUT))','PdfReader(OUT)')
body=body.replace("with OUT.open('wb') as f: writer.write(f)","result=BytesIO()\nwriter.write(result)\nreturn result.getvalue()")
body=body.replace("im=PILImage.open(m['path']); w,h=im.size; scale=min(350/w,180/h,1)\n            story.append(Image(m['path'],width=w*scale,height=h*scale,hAlign='LEFT'))", "try:\n                im=PILImage.open(BytesIO(m['content'])); im.load()\n                w,h=im.size; scale=min(350/w,180/h,1)\n                image_data=BytesIO(); im.convert('RGB').save(image_data,format='PNG'); image_data.seek(0)\n                story.append(Image(image_data,width=w*scale,height=h*scale,hAlign='LEFT'))\n            except (OSError, ValueError, PILImage.DecompressionBombError):\n                body('Não foi possível renderizar este anexo. Consulte o arquivo original no chamado.')")
body=body.replace("records=DATA['records']; total=len(records)","records=DATA['records']; total=len(records)\nif not records:\n    raise ValueError('Nenhum chamado encontrado para os filtros informados.')")
target.write_text(imports+'\n\ndef build_report(DATA, start, end, filter_description):\n    """Render the complete inspection-support report in memory for one request."""\n    OUT=BytesIO()\n    period=f"{start:%d/%m/%Y} a {end:%d/%m/%Y}"\n'+''.join('    '+line+'\n' if line else '\n' for line in body.splitlines()),encoding='utf-8')

src=Path('tmp/pdfs/extract_report.py').read_text(encoding='utf-8')
queries=src[src.index('    queries = {'):src.index('    assert len(ids)')]
queries=queries.replace("query + ' WHERE ' + scope", "query + ' WHERE ' + related_scope, params")
queries=queries.replace("            blob = m.pop('content')\n            path = root / f\"media_{kind}_{m['id']}.bin\"\n            path.write_bytes(blob)\n            data['media'].append(dict(m, kind=kind, path=str(path)))", "            data['media'].append(dict(m, kind=kind))")
header='''from datetime import datetime, time, timedelta, timezone
from .service import REQUEST_SELECT, selection_filter


def collect_report(connection, start, end, search=None, business_id=None, category_ids=None, status_ids=None):
    """Read a consistent snapshot; use the same search semantics as the kanban."""
    if end < start or end.year == 9999:
        raise ValueError("Período inválido.")
    c = connection
    params = {"range_start": datetime.combine(start, time.min),
              "range_end": datetime.combine(end + timedelta(days=1), time.min),
              "business": business_id, "search": search.strip() if search and search.strip() else None,
              "search_pattern": f"%{search.strip()}%" if search and search.strip() else None}
    selected = selection_filter("ST.ID_SERVICE_CATEGORY", "category_id", category_ids, params)
    selected += selection_filter("R.ID_REQUEST_STATUS", "status_id", status_ids, params)
    scope = """R.CREATED_DATE>=:range_start AND R.CREATED_DATE<:range_end
        AND (CAST(:business AS INTEGER) IS NULL OR RG.ID_BUSINESS=:business)
        AND (CAST(:search AS VARCHAR2(4000)) IS NULL
            OR TO_CHAR(R.ID) LIKE :search_pattern OR UPPER(ST.NAME) LIKE UPPER(:search_pattern)
            OR UPPER(M.NAME) LIKE UPPER(:search_pattern) OR UPPER(L.NAME) LIKE UPPER(:search_pattern)
            OR UPPER(R.DESCRIPTION) LIKE UPPER(:search_pattern))""" + selected
    c.execute("SET TRANSACTION READ ONLY")
    records = c.execute(REQUEST_SELECT + " WHERE " + scope + " ORDER BY B.NAME,RG.NAME,L.NAME,R.ID", params).all()
    if not records:
        raise ValueError("Nenhum chamado encontrado para os filtros informados.")
    # Reuse the entire filtered selection for all related collections without ID-list limits.
    selection = "SELECT R.ID " + REQUEST_SELECT[REQUEST_SELECT.index("    FROM OHFC_REQUEST R"):]
    related_scope = "R.ID IN (" + selection + " WHERE " + scope + ")"
    members = c.execute("SELECT ID, NAME FROM OHFC_MEMBERSHIP").all()
    data = {"records": records, "members": members,
            "extracted_at": datetime.now(timezone(timedelta(hours=-3))).isoformat()}
'''
Path('backend/app/api/request/report_data.py').write_text(header+queries+'    return data\n',encoding='utf-8')
