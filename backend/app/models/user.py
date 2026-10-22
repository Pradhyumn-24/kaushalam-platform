from datetime import datetime
import json
import bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False) # 'learner' or 'teacher' or 'admin'
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    college = db.Column(db.String(150), nullable=False)
    course = db.Column(db.String(50), nullable=False)
    branch = db.Column(db.String(80), nullable=False)
    year_of_study = db.Column(db.Integer, nullable=False)
    student_id = db.Column(db.String(50), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    skills_wanted = db.Column(db.Text, nullable=True) # JSON list for learners
    avatar_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    teacher_profile = db.relationship("TeacherProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    learner_sessions = db.relationship("SessionRequest", foreign_keys="SessionRequest.learner_id", backref="learner", lazy=True)
    teacher_sessions = db.relationship("SessionRequest", foreign_keys="SessionRequest.teacher_id", backref="teacher", lazy=True)

    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))

    def to_dict(self):
        data = {
            "id": self.id,
            "role": self.role,
            "email": self.email,
            "full_name": self.full_name,
            "college": self.college,
            "course": self.course,
            "branch": self.branch,
            "year_of_study": self.year_of_study,
            "student_id": self.student_id,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if self.role == "learner":
            data["skills_wanted"] = json.loads(self.skills_wanted) if self.skills_wanted else []
        elif self.role == "teacher" and self.teacher_profile:
            data["teacher_profile"] = self.teacher_profile.to_dict()
        return data


class TeacherProfile(db.Model):
    __tablename__ = "teacher_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skills = db.Column(db.Text, nullable=False) # JSON list of skill strings
    category = db.Column(db.String(50), nullable=False)
    experience_level = db.Column(db.String(50), nullable=False, default="Intermediate")
    availability = db.Column(db.String(255), nullable=False)
    session_duration = db.Column(db.Integer, nullable=False, default=45)
    is_verified = db.Column(db.Boolean, default=True)
    verification_notes = db.Column(db.String(255), nullable=True)
    hourly_credits = db.Column(db.Integer, default=0)
    total_sessions_taught = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=5.0)
    total_reviews = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skills": json.loads(self.skills) if self.skills else [],
            "category": self.category,
            "experience_level": self.experience_level,
            "availability": self.availability,
            "session_duration": self.session_duration,
            "is_verified": self.is_verified,
            "verification_notes": self.verification_notes,
            "total_sessions_taught": self.total_sessions_taught,
            "average_rating": self.average_rating,
            "total_reviews": self.total_reviews
        }
