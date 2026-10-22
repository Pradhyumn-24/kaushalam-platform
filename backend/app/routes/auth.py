import json
import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.app.models import db, User, TeacherProfile

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register-learner", methods=["POST"])
def register_learner():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    college = data.get("college", "").strip()
    course = data.get("course", "").strip()
    branch = data.get("branch", "").strip()
    year_of_study = data.get("year_of_study")
    student_id = data.get("student_id", "").strip()
    bio = data.get("bio", "").strip()
    skills_wanted = data.get("skills_wanted", [])

    if not full_name or not email or not password or not college or not course or not branch or not year_of_study:
        return jsonify({"error": "Please provide all required fields."}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email address format."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email address already exists."}), 409

    user = User(
        role="learner",
        email=email,
        full_name=full_name,
        college=college,
        course=course,
        branch=branch,
        year_of_study=int(year_of_study),
        student_id=student_id or None,
        bio=bio,
        skills_wanted=json.dumps(skills_wanted) if isinstance(skills_wanted, list) else json.dumps([])
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "email": user.email})
    return jsonify({
        "message": "Learner registration successful!",
        "token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/register-teacher", methods=["POST"])
def register_teacher():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    college = data.get("college", "").strip()
    course = data.get("course", "").strip()
    branch = data.get("branch", "").strip()
    year_of_study = data.get("year_of_study")
    student_id = data.get("student_id", "").strip()
    bio = data.get("bio", "").strip()
    skills = data.get("skills", [])
    category = data.get("category", "").strip()
    experience_level = data.get("experience_level", "Intermediate").strip()
    availability = data.get("availability", "").strip()
    session_duration = int(data.get("session_duration", 45))
    avatar_url = data.get("avatar_url")

    if not full_name or not email or not password or not college or not course or not branch or not year_of_study or not category or not availability:
        return jsonify({"error": "Please provide all required profile and availability details."}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email address format."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email address already exists."}), 409

    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]

    if not skills:
        return jsonify({"error": "Please provide at least one skill you can teach."}), 400

    user = User(
        role="teacher",
        email=email,
        full_name=full_name,
        college=college,
        course=course,
        branch=branch,
        year_of_study=int(year_of_study),
        student_id=student_id or None,
        bio=bio,
        avatar_url=avatar_url
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    teacher_prof = TeacherProfile(
        user_id=user.id,
        skills=json.dumps(skills),
        category=category,
        experience_level=experience_level,
        availability=availability,
        session_duration=session_duration,
        is_verified=True,
        verification_notes="Campus Peer Verified"
    )
    db.session.add(teacher_prof)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "email": user.email})
    return jsonify({
        "message": "Teacher account registered successfully!",
        "token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Please enter both email and password."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "email": user.email})
    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200
