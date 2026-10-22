from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import db, Club, ClubMembership, Announcement, LeaderboardActivity

clubs_bp = Blueprint("clubs", __name__)
announcements_bp = Blueprint("announcements", __name__)
leaderboard_bp = Blueprint("leaderboard", __name__)

# --- CLUBS ---
@clubs_bp.route("", methods=["GET"])
def get_clubs():
    category = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip()

    query = Club.query
    if category and category != "All":
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            (Club.name.ilike(f"%{search}%")) |
            (Club.description.ilike(f"%{search}%")) |
            (Club.activities.ilike(f"%{search}%"))
        )

    clubs = query.order_by(Club.score.desc(), Club.member_count.desc()).all()
    return jsonify({"clubs": [c.to_dict() for c in clubs]}), 200

@clubs_bp.route("/<int:club_id>/join", methods=["POST"])
@jwt_required()
def join_club(club_id):
    user_id = int(get_jwt_identity())
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"error": "Club not found."}), 404

    existing = ClubMembership.query.filter_by(club_id=club_id, user_id=user_id).first()
    if existing:
        return jsonify({"error": f"You have already submitted a join request (Status: {existing.status})."}), 409

    data = request.get_json() or {}
    sop = data.get("statement_of_purpose", "").strip()

    membership = ClubMembership(
        club_id=club_id,
        user_id=user_id,
        status="pending",
        statement_of_purpose=sop or None
    )
    club.member_count += 1
    db.session.add(membership)
    db.session.commit()

    return jsonify({"message": f"Join request sent to {club.name} coordinator!"}), 201

# --- ANNOUNCEMENTS ---
@announcements_bp.route("", methods=["GET"])
def get_announcements():
    category = request.args.get("category", "").strip()
    query = Announcement.query
    if category and category != "All":
        query = query.filter_by(category=category)
    items = query.order_by(Announcement.published_at.desc()).all()
    return jsonify({"announcements": [a.to_dict() for a in items]}), 200

# --- LEADERBOARD ---
@leaderboard_bp.route("", methods=["GET"])
def get_leaderboard():
    category = request.args.get("category", "").strip()
    query = Club.query
    if category and category != "All":
        query = query.filter_by(category=category)
    clubs = query.order_by(Club.score.desc()).all()

    results = []
    for rank, club in enumerate(clubs, start=1):
        c_dict = club.to_dict()
        c_dict["rank"] = rank
        c_dict["activities"] = [a.to_dict() for a in club.activities_list]
        results.append(c_dict)

    return jsonify({"leaderboard": results}), 200
