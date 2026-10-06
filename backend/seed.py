import datetime
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

if not db.query(models.User).filter_by(id="usr_default_01").first():
    default_user = models.User(id="usr_default_01", name="John Doe", email="john@example.com")
    db.add(default_user)

if not db.query(models.Meeting).filter_by(id="111-222-333").first():
    db.add(models.Meeting(
        id="111-222-333",
        title="Weekly Team Sync",
        description="Discuss placement status and goals",
        host_id="usr_default_01",
        start_time=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=2),
        duration_minutes=40,
        status="scheduled"
    ))

db.commit()
db.close()
print("Database seeded successfully!")