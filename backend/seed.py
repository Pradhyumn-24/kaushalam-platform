import json
from datetime import datetime
from backend.app import create_app
from backend.app.models import db, User, TeacherProfile, Club, LeaderboardActivity, Announcement, SessionRequest, Review

def seed_database():
    app = create_app()
    with app.app_context():
        # Check if already seeded
        if User.query.first():
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding Kaushalam Flask SQLite Database with verified mentors, campus clubs, and events...")

        # 1. Demo Learner
        learner = User(
            role="learner",
            email="aarav.sharma@kiet.edu",
            full_name="Aarav Sharma",
            college="KIET Group of Institutions",
            course="B.Tech",
            branch="Computer Science & Engineering",
            year_of_study=2,
            student_id="2300970100012",
            bio="Sophomore passionate about dynamic programming, algorithms, and full-stack development.",
            skills_wanted=json.dumps(["Data Structures", "React.js", "System Design"]),
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80"
        )
        learner.set_password("Kaushalam@2025")
        db.session.add(learner)

        # 2. Demo Teachers
        teachers_data = [
            {
                "name": "Priya Verma",
                "email": "priya.verma@kiet.edu",
                "branch": "Information Technology",
                "year": 4,
                "student_id": "2100970130088",
                "bio": "Incoming SDE at Amazon. Taught 50+ students binary search trees, graph algorithms, and LeetCode optimization strategies.",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
                "category": "Technical",
                "skills": ["Data Structures & Algorithms", "C++", "Dynamic Programming", "Graph Theory"],
                "experience": "Expert",
                "availability": "Mon, Wed, Fri: 5:00 PM - 7:30 PM | Weekends: 10:00 AM - 1:00 PM",
                "duration": 60,
                "rating": 4.9,
                "reviews": 18,
                "taught": 32
            },
            {
                "name": "Rohan Deshmukh",
                "email": "rohan.deshmukh@kiet.edu",
                "branch": "Computer Science (AI & ML)",
                "year": 3,
                "student_id": "2200970100142",
                "bio": "Full-stack builder and open-source enthusiast. Specializes in modern React, Tailwind CSS, TypeScript, and Node.js REST APIs.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
                "category": "Technical",
                "skills": ["React.js", "TypeScript", "Node.js & Express", "Tailwind CSS", "REST API Architecture"],
                "experience": "Advanced",
                "availability": "Tue, Thu: 4:30 PM - 7:00 PM | Sat: 2:00 PM - 6:00 PM",
                "duration": 45,
                "rating": 4.8,
                "reviews": 14,
                "taught": 25
            },
            {
                "name": "Ananya Sen",
                "email": "ananya.sen@kiet.edu",
                "branch": "Electronics & Communication",
                "year": 4,
                "student_id": "2100970200054",
                "bio": "President of Campus Toastmasters. National Parliamentary Debate Finalist. Mentoring in stage confidence and placement interview prep.",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                "category": "Public Speaking",
                "skills": ["Public Speaking", "GD & HR Interview Prep", "Debating", "Executive Presence"],
                "experience": "Expert",
                "availability": "Mon to Fri: 6:00 PM - 8:00 PM",
                "duration": 45,
                "rating": 5.0,
                "reviews": 22,
                "taught": 41
            }
        ]

        created_teachers = []
        for t in teachers_data:
            user = User(
                role="teacher",
                email=t["email"],
                full_name=t["name"],
                college="KIET Group of Institutions",
                course="B.Tech",
                branch=t["branch"],
                year_of_study=t["year"],
                student_id=t["student_id"],
                bio=t["bio"],
                avatar_url=t["avatar"]
            )
            user.set_password("Kaushalam@2025")
            db.session.add(user)
            db.session.flush()

            tp = TeacherProfile(
                user_id=user.id,
                skills=json.dumps(t["skills"]),
                category=t["category"],
                experience_level=t["experience"],
                availability=t["availability"],
                session_duration=t["duration"],
                is_verified=True,
                verification_notes="Campus Department Verified Senior Peer Mentor",
                total_sessions_taught=t["taught"],
                average_rating=t["rating"],
                total_reviews=t["reviews"]
            )
            db.session.add(tp)
            created_teachers.append(user)

        # 3. Seed Demo Clubs
        clubs = [
            Club(
                name="ByteCode — The Coding Club",
                code="BYTECODE",
                category="Technical",
                description="Premier collegiate competitive programming and development society organizing weekly peer problem-solving bouts and hackathons.",
                activities="Weekly CP contests, LeetCode sprints, Open Source hack days, and ICPC mentoring circles.",
                coordinator_name="Priya Verma",
                contact_email="bytecode@kiet.edu",
                meeting_info="Every Wednesday 4:30 PM, CSE Lab 4",
                member_count=148,
                score=940,
                logo_icon="Code",
                is_sample=True
            ),
            Club(
                name="E-Cell — Entrepreneurship Cell",
                code="ECELL",
                category="Entrepreneurship",
                description="Incubating student startup ideas, venture workshops, investor pitch simulations, and campus founder networking.",
                activities="E-Summit, Startup Pitch Night, Founder Fireside Chats, Seed Grant mentoring.",
                coordinator_name="Rohan Deshmukh",
                contact_email="ecell@kiet.edu",
                meeting_info="Every Friday 5:00 PM, Innovation Center Room 201",
                member_count=95,
                score=820,
                logo_icon="Rocket",
                is_sample=True
            ),
            Club(
                name="Orators & Toastmasters Society",
                code="ORATORS",
                category="Public Speaking",
                description="Fostering fearless stage confidence, parliamentary debating, impromptu table topics, and campus communication mastery.",
                activities="Weekly Table Topics, Mock Parliamentary Debates, Model UN bootcamps, Placement GD prep.",
                coordinator_name="Ananya Sen",
                contact_email="orators@kiet.edu",
                meeting_info="Every Saturday 3:00 PM, Seminar Hall 1",
                member_count=110,
                score=790,
                logo_icon="Mic",
                is_sample=True
            )
        ]
        for c in clubs:
            db.session.add(c)
            db.session.flush()
            act = LeaderboardActivity(
                club_id=c.id,
                activity_name=f"Campus {c.category} Bootcamp Series",
                activity_type="workshop",
                points=250,
                date="2026-10-01",
                description="Hosted a 3-part intensive peer workshop series."
            )
            db.session.add(act)

        # 4. Announcements
        ann = Announcement(
            title="HackKaushalam 2026: 36-Hour National College Hackathon",
            description="Build real-world campus & civic solutions. 3 tracks: Peer Education, Sustainable Campus, and AI Utilities. Cash prizes worth ₹1,50,000.",
            category="Hackathon",
            organizer="ByteCode Club & CSE Dept",
            event_date="2026-11-12 09:00 AM",
            venue="Main Auditorium & Innovation Labs",
            registration_url="https://hackkaushalam.kiet.edu",
            is_sample=True
        )
        db.session.add(ann)

        db.session.commit()
        print("✓ Database successfully populated with initial sample data!")

if __name__ == "__main__":
    seed_database()
