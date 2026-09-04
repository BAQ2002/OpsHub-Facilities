import base64
from ....database import DatabaseConnection, sql

from ..checklist.schemas import ChecklistSubmission
from ..checklist.service import add_to_visit
from .schemas import VisitPayload


def save_visit(
    connection: DatabaseConnection, data: VisitPayload, visit_id: int | None = None
) -> int:
    params = {
        "request": data.requestId,
        "description": data.description,
        "start": data.startDatetime,
        "stop": data.stopDatetime,
        "id": visit_id,
    }
    if visit_id:
        connection.execute(
            sql("""UPDATE REQUEST_TASK
    SET DESCRIPTION=:description,
        START_DATETIME=:start,
        STOP_DATETIME=:stop
    WHERE ID=:id"""),
            params,
        )
        connection.execute(
            sql("""DELETE
    FROM TASK_MEMBER_OCCURRENCE
    WHERE ID_TASK=:id"""),
            params,
        )
    else:
        visit_id = connection.execute(
            sql("""INSERT INTO REQUEST_TASK (
    ID_REQUEST,
    DESCRIPTION,
    START_DATETIME,
    STOP_DATETIME
)
VALUES (
    :request,
    :description,
    :start,
    :stop
)
RETURNING ID"""),
            params,
        ).scalar_one()
    for member in data.memberIds:
        connection.execute(
            sql("""INSERT INTO TASK_MEMBER_OCCURRENCE (
    ID_TASK,
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
            sql("""INSERT INTO REQUEST_TASK_MEDIA (
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
    :size
)"""),
            {
                "task": visit_id,
                "content": content,
                "name": photo.fileName,
                "mime": photo.mimeType,
                "size": len(content),
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
    FROM REQUEST_TASK_MEDIA
    WHERE ID=:id"""),
            {"id": media_id},
        )
        .mappings()
        .one_or_none()
    )
