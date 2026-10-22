import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.app.models import db

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=[app.config.get("FRONTEND_URL", "http://localhost:3000"), "http://127.0.0.1:3000"])

    # Register blueprints
    from backend.app.routes.auth import auth_bp
    from backend.app.routes.teachers import teachers_bp
    from backend.app.routes.sessions import sessions_bp
    from backend.app.routes.clubs import clubs_bp, announcements_bp, leaderboard_bp
    from backend.app.routes.outbox import outbox_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(teachers_bp, url_prefix="/api/teachers")
    app.register_blueprint(sessions_bp, url_prefix="/api/sessions")
    app.register_blueprint(clubs_bp, url_prefix="/api/clubs")
    app.register_blueprint(announcements_bp, url_prefix="/api/announcements")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
    app.register_blueprint(outbox_bp, url_prefix="/api/outbox")

    # Global Error Handlers (safe errors, no stack traces leaked)
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint or resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error. Please try again later."}), 500

    # Ensure tables are created in development
    with app.app_context():
        db.create_all()

    return app
