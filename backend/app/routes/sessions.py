from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import db, User, TeacherProfile, SessionRequest, Review
from backend.app.services.email_service import send_notification_email

sessions_bp = Blueprint("sessions", __name__)

@sessions_bp.route("/request", methods=["POST"])
@jwt_required()
def request_session():
    user_id = int(get_jwt_identity())
    learner = User.query.get(user_id)
    if not learner or learner.role != "learner":
        return jsonify({"error": "Only registered learners can book sessions."}), 403

    data = request.get_json() or {}
    teacher_id = data.get("teacher_id")
    skill = data.get("skill", "").strip()
    scheduled_date = data.get("scheduled_date", "").strip()
    scheduled_time = data.get("scheduled_time", "").strip()
    duration_minutes = int(data.get("duration_minutes", 45))
    learning_objective = data.get("learning_objective", "").strip()
    learner_message = data.get("learner_message", "").strip()

    if not teacher_id or not skill or not scheduled_date or not scheduled_time or not learning_objective:
        return jsonify({"error": "Please provide teacher, skill, date, time, and learning objective."}), 400

    # Prevent past dates
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if scheduled_date < today_str:
        return jsonify({"error": "Session date cannot be in the past."}), 400

    teacher = User.query.filter_by(id=teacher_id, role="teacher").first()
    if not teacher or not teacher.teacher_profile:
        return jsonify({"error": "Selected teacher does not exist or is unavailable."}), 404

    # Check conflict with existing approved sessions
    conflict = SessionRequest.query.filter_by(
        teacher_id=teacher.id,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        status="approved"
    ).first()

    if conflict:
        return jsonify({
            "error": f"Teacher {teacher.full_name} is already booked at {scheduled_time} on {scheduled_date}. Please pick another slot."
        }), 409

    session_req = SessionRequest(
        learner_id=learner.id,
        teacher_id=teacher.id,
        skill=skill,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        duration_minutes=duration_minutes,
        learning_objective=learning_objective,
        learner_message=learner_message or None,
        status="pending"
    )
    db.session.add(session_req)
    db.session.commit()

    # Trigger outgoing notification email to teacher
    subject = f"[Kaushalam] New Peer Session Request: {skill} from {learner.full_name}"
    html = f"""
    <h2>New Session Request on Kaushalam</h2>
    <p>Hello {teacher.full_name},</p>
    <p><strong>{learner.full_name}</strong> has requested a peer learning session with you.</p>
    <ul>
        <li><strong>Skill/Topic:</strong> {skill}</li>
        <li><strong>Date & Time:</strong> {scheduled_date} at {scheduled_time} ({duration_minutes} mins)</li>
        <li><strong>Objective:</strong> {learning_objective}</li>
    </ul>
    <p>Please log in to your Kaushalam Teacher Dashboard to accept or decline.</p>
    """
    text = f"New request for {skill} from {learner.full_name} on {scheduled_date} at {scheduled_time}."
    send_notification_email(teacher.email, teacher.full_name, subject, html, text, "booking_requested")

    return jsonify({
        "message": f"Session request submitted to {teacher.full_name}! Waiting for teacher approval.",
        "session_id": session_req.id
    }), 201

@sessions_bp.route("/pending", methods=["GET"])
@jwt_required()
def get_pending_sessions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role == "teacher":
        sessions = SessionRequest.query.filter_by(teacher_id=user.id, status="pending").order_by(SessionRequest.requested_at.desc()).all()
    else:
        sessions = SessionRequest.query.filter_by(learner_id=user.id, status="pending").order_by(SessionRequest.requested_at.desc()).all()

    result = []
    for s in sessions:
        item = s.to_dict()
        item["learner_name"] = s.learner.full_name if s.learner else "Unknown"
        item["learner_email"] = s.learner.email if s.learner else ""
        item["learner_course"] = f"{s.learner.course} ({s.learner.branch})" if s.learner else ""
        item["teacher_name"] = s.teacher.full_name if s.teacher else "Unknown"
        item["teacher_email"] = s.teacher.email if s.teacher else ""
        result.append(item)

    return jsonify({"sessions": result}), 200

@sessions_bp.route("/upcoming", methods=["GET"])
@jwt_required()
def get_upcoming_sessions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role == "teacher":
        sessions = SessionRequest.query.filter_by(teacher_id=user.id, status="approved").order_by(SessionRequest.scheduled_date.asc(), SessionRequest.scheduled_time.asc()).all()
    else:
        sessions = SessionRequest.query.filter_by(learner_id=user.id, status="approved").order_by(SessionRequest.scheduled_date.asc(), SessionRequest.scheduled_time.asc()).all()

    result = []
    for s in sessions:
        item = s.to_dict()
        item["learner_name"] = s.learner.full_name if s.learner else "Unknown"
        item["learner_email"] = s.learner.email if s.learner else ""
        item["teacher_name"] = s.teacher.full_name if s.teacher else "Unknown"
        item["teacher_email"] = s.teacher.email if s.teacher else ""
        result.append(item)

    return jsonify({"sessions": result}), 200

@sessions_bp.route("/history", methods=["GET"])
@jwt_required()
def get_session_history():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    status_filter = request.args.get("status", "all")
    query = SessionRequest.query

    if user.role == "teacher":
        query = query.filter_by(teacher_id=user.id)
    else:
        query = query.filter_by(learner_id=user.id)

    if status_filter != "all":
        query = query.filter_by(status=status_filter)

    sessions = query.order_by(SessionRequest.scheduled_date.desc(), SessionRequest.requested_at.desc()).all()

    result = []
    for s in sessions:
        item = s.to_dict()
        item["learner_name"] = s.learner.full_name if s.learner else "Unknown"
        item["teacher_name"] = s.teacher.full_name if s.teacher else "Unknown"
        if s.review:
            item["review_rating"] = s.review.rating
            item["review_comment"] = s.review.comment
        result.append(item)

    return jsonify({"sessions": result}), 200

@sessions_bp.route("/<int:session_id>/approve", methods=["POST"])
@jwt_required()
def approve_session(session_id):
    user_id = int(get_jwt_identity())
    teacher = User.query.get(user_id)
    if not teacher or teacher.role != "teacher":
        return jsonify({"error": "Only teachers can approve sessions."}), 403

    session_req = SessionRequest.query.get(session_id)
    if not session_req:
        return jsonify({"error": "Session request not found."}), 404

    if session_req.teacher_id != teacher.id:
        return jsonify({"error": "You cannot approve requests for other teachers."}), 403

    if session_req.status != "pending":
        return jsonify({"error": f"Cannot approve request with status: {session_req.status}"}), 400

    # Conflict check
    conflict = SessionRequest.query.filter(
        SessionRequest.teacher_id == teacher.id,
        SessionRequest.scheduled_date == session_req.scheduled_date,
        SessionRequest.scheduled_time == session_req.scheduled_time,
        SessionRequest.status == "approved",
        SessionRequest.id != session_id
    ).first()

    if conflict:
        return jsonify({"error": "Conflict: You already have another approved session at this date and time."}), 409

    data = request.get_json() or {}
    meeting_link = data.get("meeting_link") or f"https://meet.google.com/kau-{session_id:04d}"
    teacher_notes = data.get("teacher_notes")

    session_req.status = "approved"
    session_req.meeting_link = meeting_link
    session_req.teacher_notes = teacher_notes
    db.session.commit()

    # Send confirmation email to learner
    subject = f"[Kaushalam Approved] Session Confirmed: {session_req.skill} with {teacher.full_name}"
    html = f"""
    <h2>Your Session is Confirmed!</h2>
    <p>Hello {session_req.learner.full_name},</p>
    <p><strong>{teacher.full_name}</strong> has confirmed your session for <strong>{session_req.skill}</strong>.</p>
    <p><strong>Scheduled:</strong> {session_req.scheduled_date} at {session_req.scheduled_time} ({session_req.duration_minutes} mins)</p>
    <p><strong>Meeting link:</strong> <a href="{meeting_link}">{meeting_link}</a></p>
    """
    text = f"Session confirmed for {session_req.skill} with {teacher.full_name} on {session_req.scheduled_date} at {session_req.scheduled_time}."
    send_notification_email(session_req.learner.email, session_req.learner.full_name, subject, html, text, "booking_approved")

    return jsonify({"message": "Session approved successfully!", "session": session_req.to_dict()}), 200

@sessions_bp.route("/<int:session_id>/reject", methods=["POST"])
@jwt_required()
def reject_session(session_id):
    user_id = int(get_jwt_identity())
    teacher = User.query.get(user_id)
    if not teacher or teacher.role != "teacher":
        return jsonify({"error": "Only teachers can reject sessions."}), 403

    session_req = SessionRequest.query.get(session_id)
    if not session_req:
        return jsonify({"error": "Session request not found."}), 404

    if session_req.teacher_id != teacher.id:
        return jsonify({"error": "You cannot reject requests for other teachers."}), 403

    if session_req.status != "pending":
        return jsonify({"error": f"Cannot reject request with status: {session_req.status}"}), 400

    data = request.get_json() or {}
    reason = data.get("reason", "Schedule unavailable")

    session_req.status = "rejected"
    session_req.rejection_reason = reason
    db.session.commit()

    # Notify learner
    subject = f"[Kaushalam] Session Update: {session_req.skill}"
    html = f"""
    <p>Hello {session_req.learner.full_name},</p>
    <p>Teacher {teacher.full_name} is unable to conduct the requested session on {session_req.scheduled_date}.</p>
    <p><strong>Reason:</strong> {reason}</p>
    <p>Please browse other student teachers on Kaushalam.</p>
    """
    text = f"Session request for {session_req.skill} rejected. Reason: {reason}"
    send_notification_email(session_req.learner.email, session_req.learner.full_name, subject, html, text, "booking_rejected")

    return jsonify({"message": "Session request rejected."}), 200

@sessions_bp.route("/<int:session_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_session(session_id):
    user_id = int(get_jwt_identity())
    session_req = SessionRequest.query.get(session_id)
    if not session_req:
        return jsonify({"error": "Session not found."}), 404

    if session_req.learner_id != user_id and session_req.teacher_id != user_id:
        return jsonify({"error": "You do not have permission to cancel this session."}), 403

    if session_req.status in ("completed", "cancelled"):
        return jsonify({"error": f"Cannot cancel a session that is {session_req.status}."}), 400

    session_req.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Session cancelled successfully."}), 200

@sessions_bp.route("/<int:session_id>/complete", methods=["POST"])
@jwt_required()
def complete_session(session_id):
    user_id = int(get_jwt_identity())
    session_req = SessionRequest.query.get(session_id)
    if not session_req:
        return jsonify({"error": "Session not found."}), 404

    if session_req.teacher_id != user_id:
        return jsonify({"error": "Only the assigned teacher can mark this session as completed."}), 403

    if session_req.status != "approved":
        return jsonify({"error": "Only approved sessions can be marked as completed."}), 400

    session_req.status = "completed"
    session_req.completed_at = datetime.utcnow()

    # Increment teacher total sessions taught
    if session_req.teacher.teacher_profile:
        session_req.teacher.teacher_profile.total_sessions_taught += 1

    db.session.commit()
    return jsonify({"message": "Session marked as completed! Learner can now leave feedback."}), 200

@sessions_bp.route("/<int:session_id>/review", methods=["POST"])
@jwt_required()
def review_session(session_id):
    user_id = int(get_jwt_identity())
    session_req = SessionRequest.query.get(session_id)
    if not session_req:
        return jsonify({"error": "Session not found."}), 404

    if session_req.learner_id != user_id:
        return jsonify({"error": "Only the learner who attended this session can submit a review."}), 403

    if session_req.status != "completed":
        return jsonify({"error": "Only completed sessions can be reviewed."}), 400

    if Review.query.filter_by(session_id=session_id).first():
        return jsonify({"error": "You have already reviewed this session."}), 409

    data = request.get_json() or {}
    rating = int(data.get("rating", 5))
    comment = data.get("comment", "").strip()

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5."}), 400

    rev = Review(
        session_id=session_id,
        learner_id=user_id,
        teacher_id=session_req.teacher_id,
        rating=rating,
        comment=comment or None
    )
    db.session.add(rev)

    # Recalculate average rating
    all_reviews = Review.query.filter_by(teacher_id=session_req.teacher_id).all()
    total_ratings = sum(r.rating for r in all_reviews) + rating
    count = len(all_reviews) + 1
    if session_req.teacher.teacher_profile:
        session_req.teacher.teacher_profile.average_rating = round(total_ratings / count, 1)
        session_req.teacher.teacher_profile.total_reviews = count

    db.session.commit()
    return jsonify({"message": "Thank you! Review submitted successfully."}), 201
