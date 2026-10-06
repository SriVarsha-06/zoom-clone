from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserAuth(BaseModel):
    name: str
    email: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = 40

class MeetingResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    start_time: Optional[datetime]
    duration_minutes: Optional[int]
    status: str
    invite_link: str

    class Config:
        from_attributes = True