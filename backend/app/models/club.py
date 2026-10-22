from datetime import datetime
from backend.app.models.user import db

class Club(db.Model):
    __tablename__ = "clubs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False) # Technical, Cultural, Sports, Creative Arts, Public Speaking, Entrepreneurship
    description = db.Column(db.Text, nullable=False)
    activities = db.Column(db.Text, nullable=False)
    coordinator_name = db.Column(db.String(100), nullable=False)
    contact_email = db.Column(db.String(120), nullable=False)
    meeting_info = db.Column(db.String(255), nullable=False)
    member_count = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    logo_icon = db.Column(db.String(50), default="Users")
    is_sample = db.Column(db.Boolean, default=True)

    activities_list = db.relationship("LeaderboardActivity", backref="club", lazy=True, cascade="all, delete-orphan")
    memberships = db.relationship("ClubMembership", backref="club", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "category": self.category,
            "description": self.description,
            "activities": self.activities,
            "coordinator_name": self.coordinator_name,
            "contact_email": self.contact_email,
            "meeting_info": self.meeting_info,
            "member_count": self.member_count,
            "score": self.score,
            "logo_icon": self.logo_icon,
            "is_sample": self.is_sample
        }

class ClubMembership(db.Model):
    __tablename__ = "club_memberships"

    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey("clubs.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="pending") # pending, approved, rejected
    statement_of_purpose = db.Column(db.Text, nullable=True)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "club_id": self.club_id,
            "user_id": self.user_id,
            "status": self.status,
            "statement_of_purpose": self.statement_of_purpose,
            "applied_at": self.applied_at.isoformat() if self.applied_at else None
        }

class LeaderboardActivity(db.Model):
    __tablename__ = "leaderboard_activities"

    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey("clubs.id"), nullable=False)
    activity_name = db.Column(db.String(120), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False) # workshop, event, achievement, hackathon
    points = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "club_id": self.club_id,
            "activity_name": self.activity_name,
            "activity_type": self.activity_type,
            "points": self.points,
            "date": self.date,
            "description": self.description
        }
