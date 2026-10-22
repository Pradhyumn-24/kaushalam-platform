import pytest
from backend.app import create_app
from backend.config import TestConfig
from backend.app.models import db, User, TeacherProfile, SessionRequest

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_learner_registration_and_login(client):
    # 1. Register learner
    res = client.post("/api/auth/register-learner", json={
        "full_name": "Test Learner",
        "email": "learner@test.edu",
        "password": "Password123",
        "confirm_password": "Password123",
        "college": "Test Engineering College",
        "course": "B.Tech",
        "branch": "IT",
        "year_of_study": 2,
        "student_id": "23001"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert "token" in data
    assert data["user"]["role"] == "learner"

    # 2. Duplicate email rejected
    res_dup = client.post("/api/auth/register-learner", json={
        "full_name": "Duplicate Learner",
        "email": "learner@test.edu",
        "password": "Password123",
        "confirm_password": "Password123",
        "college": "Test College",
        "course": "B.Tech",
        "branch": "IT",
        "year_of_study": 2
    })
    assert res_dup.status_code == 409

    # 3. Successful Login
    res_login = client.post("/api/auth/login", json={
        "email": "learner@test.edu",
        "password": "Password123"
    })
    assert res_login.status_code == 200
    assert "token" in res_login.get_json()

def test_teacher_registration_and_booking_workflow(client):
    # Register teacher
    t_res = client.post("/api/auth/register-teacher", json={
        "full_name": "Test Teacher",
        "email": "teacher@test.edu",
        "password": "Password123",
        "confirm_password": "Password123",
        "college": "Test College",
        "course": "B.Tech",
        "branch": "CSE",
        "year_of_study": 4,
        "skills": ["Algorithms", "Python"],
        "category": "Technical",
        "experience_level": "Expert",
        "availability": "Mon-Fri 4-6 PM",
        "session_duration": 45
    })
    assert t_res.status_code == 201
    teacher_token = t_res.get_json()["token"]
    teacher_id = t_res.get_json()["user"]["id"]

    # Register learner
    l_res = client.post("/api/auth/register-learner", json={
        "full_name": "Student A",
        "email": "studenta@test.edu",
        "password": "Password123",
        "confirm_password": "Password123",
        "college": "Test College",
        "course": "B.Tech",
        "branch": "CSE",
        "year_of_study": 2
    })
    learner_token = l_res.get_json()["token"]

    # 1. Learner books a session
    book_res = client.post(
        "/api/sessions/request",
        headers={"Authorization": f"Bearer {learner_token}"},
        json={
            "teacher_id": teacher_id,
            "skill": "Python",
            "scheduled_date": "2026-11-20",
            "scheduled_time": "16:00",
            "duration_minutes": 45,
            "learning_objective": "Master list comprehensions and generators"
        }
    )
    assert book_res.status_code == 201
    session_id = book_res.get_json()["session_id"]

    # 2. Teacher sees the pending request
    pending_res = client.get(
        "/api/sessions/pending",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    assert pending_res.status_code == 200
    assert len(pending_res.get_json()["sessions"]) == 1

    # 3. Learner cannot approve (Role Authorization check)
    forbidden_approve = client.post(
        f"/api/sessions/{session_id}/approve",
        headers={"Authorization": f"Bearer {learner_token}"},
        json={"teacher_notes": "Trying to self-approve"}
    )
    assert forbidden_approve.status_code == 403

    # 4. Teacher approves request
    approve_res = client.post(
        f"/api/sessions/{session_id}/approve",
        headers={"Authorization": f"Bearer {teacher_token}"},
        json={"teacher_notes": "See you at 4 PM!", "meeting_link": "https://meet.google.com/test-room"}
    )
    assert approve_res.status_code == 200

    # 5. Prevent conflicting booking at same date and time
    conflict_res = client.post(
        "/api/sessions/request",
        headers={"Authorization": f"Bearer {learner_token}"},
        json={
            "teacher_id": teacher_id,
            "skill": "Python",
            "scheduled_date": "2026-11-20",
            "scheduled_time": "16:00",
            "duration_minutes": 45,
            "learning_objective": "Double booking should fail"
        }
    )
    assert conflict_res.status_code == 409

    # 6. Complete and Review workflow
    complete_res = client.post(
        f"/api/sessions/{session_id}/complete",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    assert complete_res.status_code == 200

    review_res = client.post(
        f"/api/sessions/{session_id}/review",
        headers={"Authorization": f"Bearer {learner_token}"},
        json={"rating": 5, "comment": "Excellent teaching session!"}
    )
    assert review_res.status_code == 201
