"""Shared validation before uploaded content reaches persistence."""
import base64
import binascii

from pydantic import BaseModel, Field, field_validator

MAX_FILE_BYTES = 10 * 1024 * 1024


class UploadedFile(BaseModel):
    fileName: str = Field(min_length=1, max_length=255)
    mimeType: str = Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9!#$&^_.+-]+/[a-zA-Z0-9!#$&^_.+-]+$")
    contentBase64: str = Field(max_length=4 * ((MAX_FILE_BYTES + 2) // 3))

    @field_validator("contentBase64")
    @classmethod
    def valid_content(cls, value: str) -> str:
        try:
            content = base64.b64decode(value, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("Arquivo base64 inválido.") from exc
        if len(content) > MAX_FILE_BYTES:
            raise ValueError("Arquivo excede o limite de 10 MiB.")
        return value
