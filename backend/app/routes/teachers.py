import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import db, User, TeacherProfile, Review

teachers_bp = Blueprint("teachers", __name__)

@teachers_bp.route("", methods=["GET"])
def list_teachers():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    experience = request.args.get("experience", "").strip()
    availability = request.args.get("availability", "").strip()

    query = db.session.query(User, TeacherProfile).join(TeacherProfile, User.id == TeacherProfile.user_id).filter(User.role == "teacher")

    if category and category != "All":
        query = query.filter(TeacherProfile.category == category)
    if experience and experience != "All":
        query = query.filter(TeacherProfile.experience_level == experience)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_pattern)) |
            (TeacherProfile.skills.ilike(search_pattern)) |
            (User.bio.ilike(search_pattern))
        )
    if availability:
        query = query.filter(TeacherProfile.availability.ilike(f"%{availability}%"))

    query = query.order_by(TeacherProfile.average_rating.desc(), TeacherProfile.total_sessions_taught.desc())
    results = query.all()

    teachers = []
    for user, tp in results:
        t_data = user.to_dict()
        t_data.update(tp.to_dict())
        teachers.append(t_data)

    return jsonify({"teachers": teachers}), 200

@teachers_bp.route("/<int:teacher_id>", methods=["GET"])
def get_teacher(teacher_id):
    user = User.query.filter_by(id=teacher_id, role="teacher").first()
    if not user or not user.teacher_profile:
        return jsonify({"error": "Teacher not found."}), 404

    reviews = Review.query.filter_by(teacher_id=teacher_id).order_by(Review.created_at.desc()).all()
    teacher_dict = user.to_dict()
    teacher_dict["reviews"] = [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat(),
            "learner_name": r.session.learner.full_name if r.session and r.session.learner else "Student"
        }
        for r in reviews
    ]
    return jsonify({"teacher": teacher_dict}), 200

@teachers_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != "teacher" or not user.teacher_profile:
        return jsonify({"error": "Only registered teachers can update teacher profile."}), 403

    data = request.get_json() or {}
    tp = user.teacher_profile

    if "bio" in data:
        user.bio = data["bio"].strip()
    if "skills" in data:
        skills = data["skills"]
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]
        tp.skills = json.dumps(skills)
    if "category" in data:
        tp.category = data["category"]
    if "experience_level" in data:
        tp.experience_level = data["experience_level"]
    if "availability" in data:
        tp.availability = data["availability"].strip()
    if "session_duration" in data:
        tp.session_duration = int(data["session_duration"])

    db.session.commit()
    return jsonify({"message": "Teacher profile updated successfully!", "teacher": user.to_dict()}), 200
