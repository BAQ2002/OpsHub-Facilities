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
