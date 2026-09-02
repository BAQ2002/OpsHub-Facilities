import base64
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..checklist.schemas import ChecklistSubmission
from ..checklist.service import add_to_visit
from .schemas import VisitPayload


def save_visit(
    session: Session, data: VisitPayload, visit_id: int | None = None
) -> int:
    params = {
        "request": data.requestId,
        "description": data.description,
        "start": data.startDatetime,
        "stop": data.stopDatetime,
        "id": visit_id,
    }
    if visit_id:
        session.execute(
            text(
                "UPDATE request_task SET description=:description,start_datetime=:start,stop_datetime=:stop WHERE id=:id"
            ),
            params,
        )
        session.execute(
            text("DELETE FROM task_member_occurrence WHERE id_task=:id"), params
        )
    else:
        visit_id = session.execute(
            text(
                "INSERT INTO request_task(id_request,description,start_datetime,stop_datetime) VALUES (:request,:description,:start,:stop) RETURNING id"
            ),
            params,
        ).scalar_one()
    for member in data.memberIds:
        session.execute(
            text(
                "INSERT INTO task_member_occurrence(id_task,id_membership) VALUES (:task,:member)"
            ),
            {"task": visit_id, "member": member},
        )
    for photo in data.photos:
        content = base64.b64decode(photo.contentBase64)
        session.execute(
            text(
                "INSERT INTO request_task_media(id_request_task,content,file_name,mime_type,file_size) VALUES (:task,:content,:name,:mime,:size)"
            ),
            {
                "task": visit_id,
                "content": content,
                "name": photo.fileName,
                "mime": photo.mimeType,
                "size": len(content),
            },
        )
    for checklist in data.checklists:
        add_to_visit(session, visit_id, ChecklistSubmission.model_validate(checklist))
    session.commit()
    return visit_id


def get_media(session: Session, media_id: int):
    return (
        session.execute(
            text(
                "SELECT content,file_name,mime_type FROM request_task_media WHERE id=:id"
            ),
            {"id": media_id},
        )
        .mappings()
        .one_or_none()
    )
