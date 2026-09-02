from pydantic import BaseModel


class MembershipOption(BaseModel):
    id: int
    name: str
