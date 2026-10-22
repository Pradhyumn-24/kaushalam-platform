from datetime import datetime
from backend.app.models.user import db

class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False) # Academic, Workshop, Hackathon, Cultural, Sports, General
    organizer = db.Column(db.String(100), nullable=False)
    event_date = db.Column(db.String(50), nullable=True)
    venue = db.Column(db.String(100), nullable=True)
    registration_url = db.Column(db.String(255), nullable=True)
    published_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_sample = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "organizer": self.organizer,
            "event_date": self.event_date,
            "venue": self.venue,
            "registration_url": self.registration_url,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "is_sample": self.is_sample
        }

class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey("sessions.id"), unique=True, nullable=False)
    learner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "learner_id": self.learner_id,
            "teacher_id": self.teacher_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class NotificationOutbox(db.Model):
    __tablename__ = "notification_outbox"

    id = db.Column(db.Integer, primary_key=True)
    recipient_email = db.Column(db.String(120), nullable=False)
    recipient_name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    body_html = db.Column(db.Text, nullable=False)
    body_text = db.Column(db.Text, nullable=False)
    event_type = db.Column(db.String(50), nullable=False) # booking_requested, booking_approved, booking_rejected, welcome
    status = db.Column(db.String(20), default="queued") # queued, sent, failed
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "recipient_email": self.recipient_email,
            "recipient_name": self.recipient_name,
            "subject": self.subject,
            "event_type": self.event_type,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None
        }
