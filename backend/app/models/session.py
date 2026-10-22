from datetime import datetime
from backend.app.models.user import db

class SessionRequest(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    skill = db.Column(db.String(100), nullable=False)
    scheduled_date = db.Column(db.String(20), nullable=False)
    scheduled_time = db.Column(db.String(10), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False, default=45)
    learning_objective = db.Column(db.Text, nullable=False)
    learner_message = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True) # pending, approved, rejected, cancelled, completed
    teacher_notes = db.Column(db.Text, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    meeting_link = db.Column(db.String(255), nullable=True)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    review = db.relationship("Review", backref="session", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "learner_id": self.learner_id,
            "teacher_id": self.teacher_id,
            "skill": self.skill,
            "scheduled_date": self.scheduled_date,
            "scheduled_time": self.scheduled_time,
            "duration_minutes": self.duration_minutes,
            "learning_objective": self.learning_objective,
            "learner_message": self.learner_message,
            "status": self.status,
            "teacher_notes": self.teacher_notes,
            "rejection_reason": self.rejection_reason,
            "meeting_link": self.meeting_link,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "review": self.review.to_dict() if self.review else None
        }
