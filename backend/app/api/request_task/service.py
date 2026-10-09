from datetime import datetime
import base64
from ...database import DatabaseConnection, sql

from ..checklist.schemas import ChecklistSubmission
from ..checklist.service import add_to_visit
from .schemas import VisitPayload


def save_visit(
    connection: DatabaseConnection, data: VisitPayload, visit_id: int | None = None
) -> int:
    params = {
        "request": data.requestId,
        "description": data.description,
        "range_start": datetime.fromisoformat(data.startDatetime),
        "stop": datetime.fromisoformat(data.stopDatetime),
        "id": visit_id,
    }
    if visit_id:
        connection.execute(
            sql("""UPDATE OHFC_REQUEST_TASK
    SET DESCRIPTION=:description,
        STARTED_DATE=:range_start,
        FINISHED_DATE=:stop
    WHERE ID=:id"""),
            params,
        )
        connection.execute(
            sql("""DELETE
    FROM OHFC_TASK_MEMBER_OCCURRENCE
    WHERE ID_REQUEST_TASK=:id"""),
            params,
        )
    else:
        visit_id = connection.insert_id(
            sql("""INSERT INTO OHFC_REQUEST_TASK (
    ID_REQUEST,
    DESCRIPTION,
    STARTED_DATE,
    FINISHED_DATE
)
VALUES (
    :request,
    :description,
    :range_start,
    :stop
)
RETURNING ID INTO :new_id"""),
            params,
        )
    for member in data.memberIds:
        connection.execute(
            sql("""INSERT INTO OHFC_TASK_MEMBER_OCCURRENCE (
    ID_REQUEST_TASK,
    ID_MEMBERSHIP
)
VALUES (
    :task,
    :member
)"""),
            {"task": visit_id, "member": member},
        )
    for photo in data.photos:
        content = base64.b64decode(photo.contentBase64)
        connection.execute(
            sql("""INSERT INTO OHFC_REQUEST_TASK_MEDIA (
    ID_REQUEST_TASK,
    CONTENT,
    FILE_NAME,
    MIME_TYPE,
    FILE_SIZE
)
VALUES (
    :task,
    :content,
    :name,
    :mime,
    :file_size
)"""),
            {
                "task": visit_id,
                "content": content,
                "name": photo.fileName,
                "mime": photo.mimeType,
                "file_size": len(content),
            },
        )
    for checklist in data.checklists:
        add_to_visit(
            connection, visit_id, ChecklistSubmission.model_validate(checklist)
        )
    connection.commit()
    return visit_id


def get_media(connection: DatabaseConnection, media_id: int):
    return (
        connection.execute(
            sql("""SELECT CONTENT,
       FILE_NAME,
       MIME_TYPE
    FROM OHFC_REQUEST_TASK_MEDIA
    WHERE ID=:id"""),
            {"id": media_id},
        )
        .mappings()
        .one_or_none()
    )


def get_visit_details(connection: DatabaseConnection, visit_id: int):
    from ..entities import VisitEntities
    from ..projections import projection
    task = connection.execute(sql("SELECT * FROM OHFC_REQUEST_TASK WHERE ID=:id"),
                              {"id": visit_id}).mappings().one_or_none()
    if task is None:
        return None
    task_params = {"id": task["id"]}
    executors = list(connection.execute(sql(f"""{"SELECT " + projection("OHFC_TASK_MEMBER_OCCURRENCE", "O", "occurrence") + ', M.ID AS "member__id", M.NAME AS "member__name"'}
        FROM OHFC_TASK_MEMBER_OCCURRENCE O JOIN OHFC_MEMBERSHIP M ON M.ID=O.ID_MEMBERSHIP
        WHERE O.ID_REQUEST_TASK=:id ORDER BY M.NAME"""), task_params).mappings())
    photos = [dict(photo, url=f'/api/v1/request-tasks/media/{photo["id"]}')
        for photo in connection.execute(sql("""SELECT ID, FILE_NAME, MIME_TYPE
            FROM OHFC_REQUEST_TASK_MEDIA WHERE ID_REQUEST_TASK=:id"""), task_params).mappings()]
    checklists = []
    for checklist in connection.execute(sql(f"""{"SELECT " + projection("OHFC_REQUEST_TASK_CHECKLIST", "RTC", "checklist") + ", " + projection("OHFC_CHECKLIST_TYPE", "CT", "definition")} FROM OHFC_REQUEST_TASK_CHECKLIST RTC
        JOIN OHFC_CHECKLIST_TYPE CT ON CT.ID=RTC.ID_CHECKLIST_TYPE
        WHERE RTC.ID_REQUEST_TASK=:id ORDER BY RTC.ID"""), task_params).mappings():
        values = list(connection.execute(sql(f"""{"SELECT " + projection("OHFC_CHECKLIST_FIELD_VALUE", "CFV", "value") + ", " + projection("OHFC_CHECKLIST_FIELD_TYPE", "CFT", "field")} FROM OHFC_CHECKLIST_FIELD_VALUE CFV
            JOIN OHFC_CHECKLIST_FIELD_TYPE CFT ON CFT.ID=CFV.ID_CHECKLIST_FIELD_TYPE
            WHERE CFV.ID_REQUEST_TASK_CHECKLIST=:id ORDER BY CFT.DISPLAY_ORDER,CFT.ID"""),
            {"id": checklist["checklist"]["id"]}).mappings())
        checklists.append(dict(checklist, values=values))

    return VisitEntities.model_validate({"task": task, "executors": executors,
                                        "photos": photos, "checklists": checklists})
