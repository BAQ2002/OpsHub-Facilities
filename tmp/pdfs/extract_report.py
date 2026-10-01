import json, sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.app.database import open_pool, close_pool, get_connection
from backend.app.api.request.service import REQUEST_SELECT

root = Path(__file__).resolve().parent
scope = "R.CREATED_DATE>=DATE '2026-01-01' AND R.CREATED_DATE<DATE '2026-10-01'"
open_pool()
g = get_connection()
c = next(g)
try:
    c.execute('SET TRANSACTION READ ONLY')
    records = c.execute(REQUEST_SELECT + ' WHERE ' + scope + ' ORDER BY B.NAME,RG.NAME,L.NAME,R.ID').all()
    ids = [r['request']['id'] for r in records]
    members = c.execute('SELECT ID, NAME FROM OHFC_MEMBERSHIP').all()
    data = {'records': records, 'members': members, 'extracted_at': datetime.now(timezone(timedelta(hours=-3))).isoformat()}
    queries = {
        'tasks': 'SELECT T.* FROM OHFC_REQUEST_TASK T JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'transactions': 'SELECT T.*, S.DESCRIPTION STATUS_DESCRIPTION FROM OHFC_REQUEST_TRANSACTION T LEFT JOIN OHFC_REQUEST_TRANSACTION_STATUS S ON S.ID=T.ID_REQUEST_TRANSACTION_STATUS JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'fields': 'SELECT V.*, F.NAME FIELD_NAME FROM OHFC_SERVICE_FIELD_VALUE V JOIN OHFC_SERVICE_FIELD_TYPE F ON F.ID=V.ID_SERVICE_FIELD_TYPE JOIN OHFC_REQUEST R ON R.ID=V.ID_REQUEST',
        'checklists': 'SELECT C.*, T.ID_REQUEST, D.NAME CHECKLIST_NAME FROM OHFC_REQUEST_TASK_CHECKLIST C JOIN OHFC_REQUEST_TASK T ON T.ID=C.ID_REQUEST_TASK JOIN OHFC_CHECKLIST_TYPE D ON D.ID=C.ID_CHECKLIST_TYPE JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'checklist_values': 'SELECT V.*, F.NAME FIELD_NAME, T.ID_REQUEST FROM OHFC_CHECKLIST_FIELD_VALUE V JOIN OHFC_CHECKLIST_FIELD_TYPE F ON F.ID=V.ID_CHECKLIST_FIELD_TYPE JOIN OHFC_REQUEST_TASK_CHECKLIST C ON C.ID=V.ID_REQUEST_TASK_CHECKLIST JOIN OHFC_REQUEST_TASK T ON T.ID=C.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'executors': 'SELECT O.*, M.NAME, T.ID_REQUEST FROM OHFC_TASK_MEMBER_OCCURRENCE O JOIN OHFC_MEMBERSHIP M ON M.ID=O.ID_MEMBERSHIP JOIN OHFC_REQUEST_TASK T ON T.ID=O.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
    }
    for name, query in queries.items():
        data[name] = c.execute(query + ' WHERE ' + scope).all()
    data['media'] = []
    for kind, query in [('request', 'SELECT M.*, M.ID_REQUEST REPORT_REQUEST_ID FROM OHFC_SERVICE_FIELD_MEDIA M JOIN OHFC_REQUEST R ON R.ID=M.ID_REQUEST'), ('task', 'SELECT M.*, T.ID_REQUEST REPORT_REQUEST_ID FROM OHFC_REQUEST_TASK_MEDIA M JOIN OHFC_REQUEST_TASK T ON T.ID=M.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST')]:
        for m in c.execute(query + ' WHERE ' + scope).all():
            blob = m.pop('content')
            path = root / f"media_{kind}_{m['id']}.bin"
            path.write_bytes(blob)
            data['media'].append(dict(m, kind=kind, path=str(path)))
    assert len(ids) == len(set(ids))
    (root/'data.json').write_text(json.dumps(data, default=str, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({k: len(v) for k,v in data.items() if isinstance(v,list)}))
finally:
    g.close()
    close_pool()
