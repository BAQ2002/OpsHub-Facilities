from pydantic import BaseModel


class BinaryFile(BaseModel):
    fileName: str
    mimeType: str
    contentBase64: str


class VisitPayload(BaseModel):
    requestId: int | None = None
    description: str
    startDatetime: str
    stopDatetime: str
    memberIds: list[int]
    photos: list[BinaryFile] = []
    checklists: list[dict] = []
