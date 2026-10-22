import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'kaushalam.sqlite');

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

// Helper to save SQLite database file to disk
export function persistDb() {
  if (!db) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database:', err);
  }
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing sqlite file, initializing new database', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  initTables(db);
  seedInitialData(db);
  ensureKietClubs(db);
  persistDb();
  return db;
}

function initTables(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT NOT NULL,
      branch TEXT NOT NULL,
      year_of_study INTEGER NOT NULL,
      student_id TEXT,
      bio TEXT,
      skills_wanted TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      skills TEXT NOT NULL,
      category TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      availability TEXT NOT NULL,
      session_duration INTEGER NOT NULL DEFAULT 45,
      is_verified INTEGER NOT NULL DEFAULT 1,
      verification_notes TEXT,
      hourly_credits INTEGER DEFAULT 0,
      total_sessions_taught INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 5.0,
      total_reviews INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      skill TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      learning_objective TEXT NOT NULL,
      learner_message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      teacher_notes TEXT,
      rejection_reason TEXT,
      meeting_link TEXT,
      requested_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (learner_id) REFERENCES users(id),
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER UNIQUE NOT NULL,
      learner_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (learner_id) REFERENCES users(id),
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      activities TEXT NOT NULL,
      coordinator_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      meeting_info TEXT NOT NULL,
      member_count INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      logo_icon TEXT NOT NULL,
      is_sample INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS club_memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      statement_of_purpose TEXT,
      applied_at TEXT NOT NULL,
      approved_at TEXT,
      FOREIGN KEY (club_id) REFERENCES clubs(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      organizer TEXT NOT NULL,
      event_date TEXT,
      venue TEXT,
      registration_url TEXT,
      published_at TEXT NOT NULL,
      is_sample INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS leaderboard_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      activity_name TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      points INTEGER NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS notification_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      body_text TEXT NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      error_message TEXT,
      created_at TEXT NOT NULL,
      sent_at TEXT
    );
  `);

  try { database.run(`ALTER TABLE clubs ADD COLUMN activity_status TEXT DEFAULT 'active'`); } catch (_) {}
  try { database.run(`ALTER TABLE clubs ADD COLUMN focus_domain TEXT`); } catch (_) {}
  try { database.run(`ALTER TABLE clubs ADD COLUMN is_hot INTEGER DEFAULT 0`); } catch (_) {}
  try { database.run(`ALTER TABLE users ADD COLUMN avatar_url TEXT`); } catch (_) {}
  try { database.run(`ALTER TABLE users ADD COLUMN skills_wanted TEXT`); } catch (_) {}
  try { database.run(`ALTER TABLE users ADD COLUMN student_id TEXT`); } catch (_) {}
  try { database.run(`ALTER TABLE users ADD COLUMN bio TEXT`); } catch (_) {}
}

export function ensureKietClubs(database: Database) {
  const kietClubs = [
    {
      name: 'GDG KIET (Google Developer Groups)',
      code: 'GDG',
      category: 'Technical',
      focus_domain: 'Web, Android, Cloud, Google Solutions',
      description: 'Official Google Developer Groups on Campus chapter at KIET. Organizing hands-on code labs, DevFest, Android study jams, and Solution Challenge bootcamps.',
      activities: 'Weekly code labs, Google Cloud Days, Solution Challenge hackathon, Flutter & Android bootcamps.',
      coordinator: 'Kshitij Saxena',
      email: 'gdg@kiet.edu',
      meeting: 'Every Wednesday 4:30 PM, Audi Block Lab 2',
      members: 185,
      score: 950,
      icon: 'Code',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'K3 Club',
      code: 'K3',
      category: 'Technical',
      focus_domain: 'Open Source, Linux Systems & Competitive Tech',
      description: 'High-octane technical student guild focused on low-level system design, Linux kernel scripting, competitive programming, and engineering excellence.',
      activities: 'Terminal speed coding, CTF challenges, Linux installations, system architecture sessions.',
      coordinator: 'Tushar Singhal',
      email: 'k3@kiet.edu',
      meeting: 'Every Monday & Thursday 5:00 PM, IT Block Room 204',
      members: 140,
      score: 920,
      icon: 'Terminal',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'CPBYTE (For Learning DSA)',
      code: 'CPBYTE',
      category: 'Technical',
      focus_domain: 'DSA (Data Structures & Algorithms), LeetCode & CP',
      description: 'The premier DSA and Competitive Programming club at KIET dedicated to breaking down complex algorithm problems, graphs, DP, and interview prep.',
      activities: 'Weekly LeetCode contests, Tree & Graph deep-dives, placement mock coding rounds, Codeforces ladders.',
      coordinator: 'Priya Verma',
      email: 'cpbyte@kiet.edu',
      meeting: 'Every Tuesday & Saturday 4:30 PM, CSE Lab 4',
      members: 195,
      score: 980,
      icon: 'Code',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'KTS (KIET Technical Society)',
      code: 'KTS',
      category: 'Technical',
      focus_domain: 'Technical Innovations, Embedded Tech & Computing',
      description: 'Core institutional technical society driving student tech projects, campus tech fests, inter-college paper presentations, and hardware integration.',
      activities: 'TechFest, Inter-branch Technical Olympiad, IoT & Arduino expos, project showcases.',
      coordinator: 'Rishabh Pant',
      email: 'kts@kiet.edu',
      meeting: 'Every Friday 4:00 PM, Central Audi Lab',
      members: 110,
      score: 840,
      icon: 'Rocket',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'TECHNOCRATS',
      code: 'TECHNOCRATS',
      category: 'Technical',
      focus_domain: 'Hackathons, Full-Stack Web & Software Engineering',
      description: 'Student engineering community building real-world software, web applications, and campus utilities with agile sprint teams.',
      activities: '36-hr Hackathons, Full-Stack MERN bootcamps, API design workshops, GitHub project building.',
      coordinator: 'Aman Sharma',
      email: 'technocrats@kiet.edu',
      meeting: 'Every Wednesday 5:00 PM, CSIT Lab 3',
      members: 125,
      score: 860,
      icon: 'Cpu',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'SCHOOL OF UI/UX',
      code: 'UIUX_SCHOOL',
      category: 'Technical',
      focus_domain: 'UI/UX Design, Figma, Design Systems & Interaction',
      description: 'The dedicated campus design guild for product designers, Figma lovers, interaction specialists, and wireframing enthusiasts.',
      activities: 'Design sprints, Figma component libraries, UX critique sessions, Mobile app redesign challenges.',
      coordinator: 'Devansh Kulkarni',
      email: 'uiux@kiet.edu',
      meeting: 'Every Thursday 4:30 PM, Design Lab Room 302',
      members: 105,
      score: 875,
      icon: 'Palette',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'VOID SOCIETY',
      code: 'VOID',
      category: 'Technical',
      focus_domain: 'Cybersecurity, CTF Competitions & InfoSec',
      description: 'KIET\'s cybersecurity student collective focused on ethical hacking, penetration testing, network defense, and bug bounty hunting.',
      activities: 'Capture The Flag (CTF) tournaments, Kali Linux tools, network packet tracing, web vulnerability scans.',
      coordinator: 'Sankalp Verma',
      email: 'void@kiet.edu',
      meeting: 'Every Saturday 3:00 PM, Cyber Cell Lab',
      members: 115,
      score: 890,
      icon: 'ShieldCheck',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'DSDL (Data Science & Deep Learning)',
      code: 'DSDL',
      category: 'Technical',
      focus_domain: 'Data Analytics, Deep Learning, Pandas & Kaggle',
      description: 'Society dedicated to data analytics, statistical modeling, neural networks, and Kaggle competition sprints. (Moderate/Occasional campus sprints)',
      activities: 'Kaggle sprints, Python pandas workshops, PyTorch deep-dive sessions, data visualization.',
      coordinator: 'Neha Pandey',
      email: 'dsdl@kiet.edu',
      meeting: 'Occasional Bi-weekly Meetups, MCA Lab 1',
      members: 68,
      score: 720,
      icon: 'Database',
      activity_status: 'occasional',
      is_hot: 0
    },
    {
      name: 'FOS (Free & Open Source Society)',
      code: 'FOS',
      category: 'Technical',
      focus_domain: 'FOSS, Linux Kernel, Git & Open Source Contributions',
      description: 'Advocating for free open-source software, Linux operating systems, Git workflow, and Google Summer of Code (GSoC) mentorship. (Occasional meetups)',
      activities: 'Hacktoberfest sprints, Git & GitHub workshops, Open source licensing, GSoC mentoring.',
      coordinator: 'Harshit Tyagi',
      email: 'fos@kiet.edu',
      meeting: 'Bi-weekly Saturday 4:00 PM, IT Seminar Hall',
      members: 72,
      score: 740,
      icon: 'Code',
      activity_status: 'occasional',
      is_hot: 0
    },
    {
      name: 'AI CLUB & AI SECURITY',
      code: 'AICLUB',
      category: 'Technical',
      focus_domain: 'AI & ML Related + Cyber Security & Adversarial AI',
      description: 'Flagship AI and machine learning society at KIET, featuring a specialized AI Security wing protecting machine learning models against adversarial exploits.',
      activities: 'LLM fine-tuning, Model prompt injection defense, Computer Vision labs, AI Security summits.',
      coordinator: 'Aditya Pratap Singh',
      email: 'aiclub@kiet.edu',
      meeting: 'Every Tuesday & Friday 4:30 PM, AI Lab Block A',
      members: 210,
      score: 995,
      icon: 'Sparkles',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'NEXTGEN (ML Related)',
      code: 'NEXTGEN',
      category: 'Technical',
      focus_domain: 'Machine Learning (ML Related), Generative Models & Data Tech',
      description: 'High-impact student ML collective building neural networks, predictive algorithms, recommendation engines, and next-gen intelligent tools.',
      activities: 'ML bootcamps, Generative AI project demos, HuggingFace workshops, Math for ML sprints.',
      coordinator: 'Shreya Rastogi',
      email: 'nextgen@kiet.edu',
      meeting: 'Every Wednesday 4:30 PM, Innovation Lab Room 102',
      members: 180,
      score: 970,
      icon: 'Rocket',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'AWS KIET (AWS Cloud Club)',
      code: 'AWS_KIET',
      category: 'Technical',
      focus_domain: 'AWS Cloud Computing, Serverless & DevOps',
      description: 'Official AWS Cloud Club at KIET helping students get AWS certified, master EC2, Lambda, S3, Docker, and build cloud-native applications.',
      activities: 'AWS Cloud Practitioner prep, Serverless architecture hack days, DevOps CI/CD pipelines.',
      coordinator: 'Ayush Saxena',
      email: 'aws@kiet.edu',
      meeting: 'Every Monday 4:30 PM, Cloud Center of Excellence',
      members: 135,
      score: 885,
      icon: 'Cloud',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'INNOGEEKS',
      code: 'INNOGEEKS',
      category: 'Technical',
      focus_domain: 'Cross-disciplinary Tech, Hackathons & Innovation',
      description: 'Energetic multidisciplinary tech club fostering innovation, hackathon culture, rapid prototyping, and software engineering.',
      activities: 'Smart India Hackathon (SIH) prep, Web & Mobile development marathons, Idea pitching.',
      coordinator: 'Vansh Agarwal',
      email: 'innogeeks@kiet.edu',
      meeting: 'Every Thursday 5:00 PM, TBI Incubator Hall',
      members: 145,
      score: 895,
      icon: 'Zap',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'MLSA KIET (Microsoft Learn Student Ambassadors)',
      code: 'MICROSOFT_KIET',
      category: 'Technical',
      focus_domain: 'Azure, Microsoft Tech, C# .NET & Student Community',
      description: 'Campus Microsoft community connecting students with Azure cloud tools, GitHub Copilot, Microsoft Imagine Cup, and C# development. (Occasional/Periodic)',
      activities: 'Imagine Cup prep, Azure AI studio workshops, Microsoft student certification roadmap.',
      coordinator: 'Divyansh Goel',
      email: 'mlsa@kiet.edu',
      meeting: 'Monthly Meetups & Online Sprints',
      members: 78,
      score: 750,
      icon: 'Globe',
      activity_status: 'occasional',
      is_hot: 0
    },
    {
      name: 'AI SKILL LAB',
      code: 'AI_SKILL_LAB',
      category: 'Technical',
      focus_domain: 'Applied AI Engineering, Practical Model Deployment',
      description: 'Hands-on collegiate lab focused on real-world AI deployment, API integration, vector databases, and edge AI computation.',
      activities: 'RAG architecture workshops, Edge AI on Raspberry Pi, Model quantization and API serving.',
      coordinator: 'Tanmay Gupta',
      email: 'aiskilllab@kiet.edu',
      meeting: 'Every Friday 4:30 PM, Advanced AI Center',
      members: 160,
      score: 935,
      icon: 'Cpu',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'DRONE TECHNOLOGY',
      code: 'DRONE_TECH',
      category: 'Technical',
      focus_domain: 'UAV Aerodynamics, Autonomous Drones & Flight Controllers',
      description: 'Aeronautics and drone engineering society assembling custom quadcopters, hexacopters, autonomous flight controllers, and aerial surveillance systems.',
      activities: 'Drone assembly workshops, FPV drone racing, autonomous waypoint navigation, DGCA guidelines.',
      coordinator: 'Kartik Rawat',
      email: 'dronetech@kiet.edu',
      meeting: 'Every Saturday 2:00 PM, Mechanical Hangar & Ground',
      members: 92,
      score: 810,
      icon: 'Compass',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'ROBOTICS CLUB',
      code: 'ROBOTICS',
      category: 'Technical',
      focus_domain: 'Robotics, Microcontrollers, RoboWars & Line Followers',
      description: 'Hardware and robotics club designing combat robots for RoboWars, maze solvers, line followers, and industrial robotic arms.',
      activities: 'RoboWars bot fabrication, Arduino & ESP32 bootcamps, sensor interfacing, PCB designing.',
      coordinator: 'Mayank Joshi',
      email: 'robotics@kiet.edu',
      meeting: 'Every Wednesday & Friday 4:30 PM, Robotics Lab B-Block',
      members: 118,
      score: 845,
      icon: 'Cpu',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'C CELL (Creative Cell — Video & Photo Editing)',
      code: 'CCELL',
      category: 'Creative Media',
      focus_domain: 'Video Production, Photography, Reels & Creative Editing',
      description: 'The official creative media backbone of KIET campus. Covering college events, producing aftermovies, photo shoots, cinematic trailers, and reel editing.',
      activities: 'Premiere Pro & After Effects editing, Camera & Lighting masterclasses, Fest cinematography, color grading.',
      coordinator: 'Sparsh Jain',
      email: 'ccell@kiet.edu',
      meeting: 'Every Tuesday & Friday 5:00 PM, Media Room Audi Basement',
      members: 155,
      score: 960,
      icon: 'Palette',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'E CELL (Entrepreneurship Cell KIET)',
      code: 'ECELL',
      category: 'Entrepreneurship',
      focus_domain: 'Startups, Venture Incubation, E-Summit & Pitching',
      description: 'Empowering campus founders and young entrepreneurs. Organizing the annual E-Summit, startup pitch nights, angel investor connects, and seed funding support.',
      activities: 'E-Summit flagship, Startup Pitching Bouts, Founder Fireside Chats, Business model canvas coaching.',
      coordinator: 'Rohan Deshmukh',
      email: 'ecell@kiet.edu',
      meeting: 'Every Friday 5:00 PM, Innovation Center 201',
      members: 175,
      score: 965,
      icon: 'Rocket',
      activity_status: 'hot',
      is_hot: 1
    },
    {
      name: 'PRAGMATIC (Fashion Society)',
      code: 'PRAGMATIC',
      category: 'Fashion & Lifestyle',
      focus_domain: 'Fashion Design, Runway Modeling & Theme Styling',
      description: 'Premier campus fashion and lifestyle society representing KIET at inter-college fashion pageants, theme-based runway choreography, and styling.',
      activities: 'Runway walks, theme costume designing, stage makeup workshops, national fashion circuit.',
      coordinator: 'Ishika Garg',
      email: 'pragmatic@kiet.edu',
      meeting: 'Every Monday & Wednesday 5:00 PM, Main Stage Hall',
      members: 88,
      score: 820,
      icon: 'Sparkles',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'SPARKS (Fashion & Glamour)',
      code: 'SPARKS',
      category: 'Fashion & Lifestyle',
      focus_domain: 'Glamour, Event Aesthetics & Stage Presence',
      description: 'Fashion, glamour, and aesthetic coordination society orchestrating campus cultural pageants and student runway showcases. (Occasional seasonal drives)',
      activities: 'Aesthetic styling, campus fashion walks, personality development, photoshoots.',
      coordinator: 'Simran Kaur',
      email: 'sparks@kiet.edu',
      meeting: 'Bi-weekly Thursday 5:00 PM, Cultural Hall',
      members: 55,
      score: 690,
      icon: 'Sparkles',
      activity_status: 'occasional',
      is_hot: 0
    },
    {
      name: 'VPKASH (Vipraksh Dramatic Society)',
      code: 'VPKASH',
      category: 'Dramatic Arts',
      focus_domain: 'Nukkad Natak (Street Plays), Stage Theatre & Acting',
      description: 'Renowned street play and theatre society at KIET. Winning accolades across North India for hard-hitting social satire, nukkad natak, and poignant stage plays.',
      activities: 'Nukkad Natak rehearsals, voice modulation drills, mime performances, scriptwriting workshops.',
      coordinator: 'Abhinav Mishra',
      email: 'vpkash@kiet.edu',
      meeting: 'Daily Evening 5:00 PM, College Amphitheatre',
      members: 130,
      score: 910,
      icon: 'Sparkles',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'KIET MUN (Model United Nations)',
      code: 'KIET_MUN',
      category: 'Public Speaking',
      focus_domain: 'Diplomacy, International Relations & Parliamentary Debate',
      description: 'Collegiate diplomatic forum simulating UN assemblies (UNHRC, UNSC, AIPPM). Developing public policy knowledge, negotiation diplomacy, and oratorical power.',
      activities: 'Annual KIET MUN Conference, Crisis committee simulations, Resolution drafting, Mock embassies.',
      coordinator: 'Shourya Tripathi',
      email: 'mun@kiet.edu',
      meeting: 'Every Saturday 2:30 PM, Conference Room 1',
      members: 140,
      score: 900,
      icon: 'Globe',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'ODYSSEY (Literary & Debating Society)',
      code: 'ODYSSEY',
      category: 'Public Speaking',
      focus_domain: 'Debating, Extempore, Elocution & Creative Writing',
      description: 'The intellectual haven for orators, poets, quizzers, and debaters at KIET. Enhancing stage presence, placement GD skills, and spontaneous thinking.',
      activities: 'Weekly parliamentary debates, Poetry open mics, JAM (Just A Minute), GD practice for placements.',
      coordinator: 'Ananya Sen',
      email: 'odyssey@kiet.edu',
      meeting: 'Every Tuesday & Thursday 4:30 PM, Seminar Hall 2',
      members: 120,
      score: 870,
      icon: 'Mic',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'STEPPERS (Western Dance Crew)',
      code: 'STEPPERS',
      category: 'Dance & Performing Arts',
      focus_domain: 'Western Dance, Hip-Hop, Popping & Street Choreography',
      description: 'KIET\'s powerhouse western dance crew renowned for energetic hip-hop routines, locking & popping, street battles, and cultural fest championships.',
      activities: 'Hip-hop dance choreography, cyphers, battle rounds, annual fest performance prep.',
      coordinator: 'Rajat Chauhan',
      email: 'steppers@kiet.edu',
      meeting: 'Every Monday, Wednesday & Friday 5:00 PM, Dance Studio',
      members: 95,
      score: 855,
      icon: 'Music',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'PHOENIX (Contemporary & Classical Dance)',
      code: 'PHOENIX',
      category: 'Dance & Performing Arts',
      focus_domain: 'Contemporary, Classical & Lyrical Fusion Dance',
      description: 'Expressive dance society bringing classical Indian roots, contemporary lyrical flow, and thematic theatrical dance performances to life.',
      activities: 'Contemporary floorwork, Kathak/Bharatnatyam fusion, flexibility conditioning, stage routines.',
      coordinator: 'Kavya Saxena',
      email: 'phoenix@kiet.edu',
      meeting: 'Every Tuesday & Thursday 5:00 PM, Cultural Hall 1',
      members: 85,
      score: 830,
      icon: 'Music',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'UDDESHYA KIET',
      code: 'UDDESHYA',
      category: 'Social Welfare',
      focus_domain: 'Teaching Underprivileged Children & Education Outreach',
      description: 'Youth-led social initiative providing free evening classes, books, and mentorship to underprivileged children residing near Muradnagar campus.',
      activities: 'Daily evening coaching classes for kids, stationery donation drives, hygiene awareness campaigns.',
      coordinator: 'Pranjal Singh',
      email: 'uddeshya@kiet.edu',
      meeting: 'Monday to Friday 5:00 PM - 6:30 PM, Campus Outreach Center',
      members: 165,
      score: 940,
      icon: 'Users',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'EK PRAYAS (Social Welfare Initiative)',
      code: 'EK_PRAYAS',
      category: 'Social Welfare',
      focus_domain: 'Community Upliftment, Blood Donation & Civic Action',
      description: 'Social welfare club at KIET dedicated to organizing mega blood donation camps, environmental tree plantation drives, and disaster relief campaigns.',
      activities: 'Annual Mega Blood Donation Camp, Green Campus plantation, Old age home visits, Winter clothes drive.',
      coordinator: 'Utkarsh Srivastava',
      email: 'ekprayas@kiet.edu',
      meeting: 'Every Saturday 3:30 PM, Student Activity Center',
      members: 150,
      score: 925,
      icon: 'Users',
      activity_status: 'active',
      is_hot: 0
    },
    {
      name: 'KIET SPORTS COUNCIL (Managed by KIET Sports Dept)',
      code: 'KIET_SPORTS',
      category: 'Sports & Athletics',
      focus_domain: 'Cricket, Football, Basketball, Badminton & Intramural Tournaments',
      description: 'Centrally administered by the KIET Sports Department. Hosting inter-departmental leagues, the annual RANN sports festival, gym facilities, and university athletic meets.',
      activities: 'Inter-branch cricket league, Rann Sports Fest, Basketball tourneys, Badminton championships, Morning training.',
      coordinator: 'Dr. Sports Officer & Arjun Mehta',
      email: 'sports@kiet.edu',
      meeting: 'Every Morning & Evening, Main Sports Complex & Badminton Courts',
      members: 240,
      score: 990,
      icon: 'Trophy',
      activity_status: 'active',
      is_hot: 0
    }
  ];

  for (const c of kietClubs) {
    const existing = database.exec(`SELECT id FROM clubs WHERE code = '${c.code}'`);
    if (existing.length === 0 || existing[0].values.length === 0) {
      database.run(
        `INSERT INTO clubs (name, code, category, description, activities, coordinator_name, contact_email, meeting_info, member_count, score, logo_icon, is_sample, activity_status, focus_domain, is_hot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [c.name, c.code, c.category, c.description, c.activities, c.coordinator, c.email, c.meeting, c.members, c.score, c.icon, c.activity_status, c.focus_domain, c.is_hot]
      );
    } else {
      database.run(
        `UPDATE clubs SET name = ?, category = ?, description = ?, activities = ?, coordinator_name = ?, contact_email = ?, meeting_info = ?, logo_icon = ?, activity_status = ?, focus_domain = ?, is_hot = ?
         WHERE code = ?`,
        [c.name, c.category, c.description, c.activities, c.coordinator, c.email, c.meeting, c.icon, c.activity_status, c.focus_domain, c.is_hot, c.code]
      );
    }
  }
}

export function cleanupRandomSeedData(database: Database) {
  try {
    const fakeEmails = [
      'aarav.sharma@kiet.edu',
      'priya.verma@kiet.edu',
      'rohan.deshmukh@kiet.edu',
      'ananya.sen@kiet.edu',
      'devansh.kulkarni@kiet.edu',
      'simran.kaur@kiet.edu'
    ];
    for (const email of fakeEmails) {
      const res = database.exec(`SELECT id FROM users WHERE email = '${email}'`);
      if (res && res.length > 0 && res[0].values.length > 0) {
        const id = res[0].values[0][0];
        database.run(`DELETE FROM reviews WHERE teacher_id = ${id} OR learner_id = ${id}`);
        database.run(`DELETE FROM sessions WHERE teacher_id = ${id} OR learner_id = ${id}`);
        database.run(`DELETE FROM teacher_profiles WHERE user_id = ${id}`);
        database.run(`DELETE FROM users WHERE id = ${id}`);
      }
    }
    // Remove sample mock clubs that were not part of real KIET clubs
    database.run("DELETE FROM clubs WHERE code IN ('BYTECODE', 'ORATORS', 'DESIGNCRAFT', 'RHYTHM', 'STRIKERS')");
  } catch (err) {
    console.warn('Cleanup random seed data notice:', err);
  }
}

function seedInitialData(database: Database) {
  // Only real registered users and teachers are kept.
  // No random or fake mock data is populated.
  cleanupRandomSeedData(database);
}
