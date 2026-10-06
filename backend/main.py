from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
import datetime

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_HOST_ID = "usr_default_01"

@app.post("/api/auth/login", response_model=schemas.UserResponse)
def login_or_signup(user_data: schemas.UserAuth, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user:
        user_id = f"usr_{uuid.uuid4().hex[:6]}"
        user = models.User(id=user_id, name=user_data.name, email=user_data.email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/api/meetings/instant", response_model=schemas.MeetingResponse)
def create_instant_meeting(db: Session = Depends(get_db)):
    meeting_id = f"{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:3]}"
    db_meeting = models.Meeting(
        id=meeting_id,
        title="Instant Meeting",
        host_id=MOCK_HOST_ID,
        start_time=datetime.datetime.now(datetime.timezone.utc),
        status="ongoing"
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    return {
        **db_meeting.__dict__,
        "invite_link": f"/meeting/{meeting_id}"
    }

@app.post("/api/meetings/schedule", response_model=schemas.MeetingResponse)
def schedule_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting_id = f"{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:3]}"
    db_meeting = models.Meeting(
        id=meeting_id,
        title=meeting.title,
        description=meeting.description,
        host_id=MOCK_HOST_ID,
        start_time=meeting.start_time,
        duration_minutes=meeting.duration_minutes,
        status="scheduled"
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    return {
        **db_meeting.__dict__,
        "invite_link": f"/meeting/{meeting_id}"
    }

@app.get("/api/meetings/upcoming")
def get_upcoming_meetings(db: Session = Depends(get_db)):
    return db.query(models.Meeting).filter(models.Meeting.status == "scheduled").all()

@app.get("/api/meetings/recent")
def get_recent_meetings(db: Session = Depends(get_db)):
    return db.query(models.Meeting).filter(models.Meeting.status == "ended").all()

@app.get("/api/meetings/{meeting_id}")
def validate_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"id": meeting.id, "title": meeting.title, "valid": True}