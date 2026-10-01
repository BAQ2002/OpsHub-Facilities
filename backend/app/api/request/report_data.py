from datetime import datetime, time, timedelta, timezone
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
    queries = {
        'tasks': 'SELECT T.* FROM OHFC_REQUEST_TASK T JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'transactions': 'SELECT T.*, S.DESCRIPTION STATUS_DESCRIPTION FROM OHFC_REQUEST_TRANSACTION T LEFT JOIN OHFC_REQUEST_TRANSACTION_STATUS S ON S.ID=T.ID_REQUEST_TRANSACTION_STATUS JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'fields': 'SELECT V.*, F.NAME FIELD_NAME FROM OHFC_SERVICE_FIELD_VALUE V JOIN OHFC_SERVICE_FIELD_TYPE F ON F.ID=V.ID_SERVICE_FIELD_TYPE JOIN OHFC_REQUEST R ON R.ID=V.ID_REQUEST',
        'checklists': 'SELECT C.*, T.ID_REQUEST, D.NAME CHECKLIST_NAME FROM OHFC_REQUEST_TASK_CHECKLIST C JOIN OHFC_REQUEST_TASK T ON T.ID=C.ID_REQUEST_TASK JOIN OHFC_CHECKLIST_TYPE D ON D.ID=C.ID_CHECKLIST_TYPE JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'checklist_values': 'SELECT V.*, F.NAME FIELD_NAME, T.ID_REQUEST FROM OHFC_CHECKLIST_FIELD_VALUE V JOIN OHFC_CHECKLIST_FIELD_TYPE F ON F.ID=V.ID_CHECKLIST_FIELD_TYPE JOIN OHFC_REQUEST_TASK_CHECKLIST C ON C.ID=V.ID_REQUEST_TASK_CHECKLIST JOIN OHFC_REQUEST_TASK T ON T.ID=C.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
        'executors': 'SELECT O.*, M.NAME, T.ID_REQUEST FROM OHFC_TASK_MEMBER_OCCURRENCE O JOIN OHFC_MEMBERSHIP M ON M.ID=O.ID_MEMBERSHIP JOIN OHFC_REQUEST_TASK T ON T.ID=O.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST',
    }
    for name, query in queries.items():
        data[name] = c.execute(query + ' WHERE ' + related_scope, params).all()
    data['media'] = []
    for kind, query in [('request', 'SELECT M.*, M.ID_REQUEST REPORT_REQUEST_ID FROM OHFC_SERVICE_FIELD_MEDIA M JOIN OHFC_REQUEST R ON R.ID=M.ID_REQUEST'), ('task', 'SELECT M.*, T.ID_REQUEST REPORT_REQUEST_ID FROM OHFC_REQUEST_TASK_MEDIA M JOIN OHFC_REQUEST_TASK T ON T.ID=M.ID_REQUEST_TASK JOIN OHFC_REQUEST R ON R.ID=T.ID_REQUEST')]:
        for m in c.execute(query + ' WHERE ' + related_scope, params).all():
            data['media'].append(dict(m, kind=kind))
    return data
