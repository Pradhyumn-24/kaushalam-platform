from flask import Blueprint, jsonify
from backend.app.models import db, NotificationOutbox, User, SessionRequest, Club

outbox_bp = Blueprint("outbox", __name__)

@outbox_bp.route("", methods=["GET"])
def get_outbox():
    logs = NotificationOutbox.query.order_by(NotificationOutbox.created_at.desc()).limit(50).all()
    return jsonify({"outbox": [l.to_dict() for l in logs]}), 200

@outbox_bp.route("/stats", methods=["GET"])
def get_stats():
    learners = User.query.filter_by(role="learner").count()
    teachers = User.query.filter_by(role="teacher").count()
    completed = SessionRequest.query.filter_by(status="completed").count()
    clubs = Club.query.count()

    return jsonify({
        "totalLearners": learners,
        "totalTeachers": teachers,
        "completedSessions": completed,
        "activeClubs": clubs
    }), 200
