from pydantic import BaseModel
from ..uploads import UploadedFile


class BinaryFile(UploadedFile):
    pass


class VisitPayload(BaseModel):
    requestId: int | None = None
    description: str
    startDatetime: str
    stopDatetime: str
    memberIds: list[int]
    photos: list[BinaryFile] = []
    checklists: list[dict] = []
