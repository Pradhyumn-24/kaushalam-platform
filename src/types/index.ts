export type UserRole = 'learner' | 'teacher' | 'admin';

export interface User {
  id: number;
  role: UserRole;
  email: string;
  full_name: string;
  college: string;
  course: string;
  branch: string;
  year_of_study: number;
  student_id?: string | null;
  bio?: string;
  skills_wanted?: string[];
  avatar_url?: string;
  teacher_profile?: TeacherProfile | null;
  created_at?: string;
}

export interface TeacherProfile {
  id: number;
  user_id: number;
  skills: string[];
  category: string;
  experience_level: string;
  availability: string;
  session_duration: number;
  is_verified: boolean;
  verification_notes?: string;
  hourly_credits?: number;
  total_sessions_taught: number;
  average_rating: number;
  total_reviews: number;
}

export interface Teacher {
  id: number;
  full_name: string;
  email: string;
  college: string;
  course: string;
  branch: string;
  year_of_study: number;
  bio?: string;
  avatar_url?: string;
  skills: string[];
  category: string;
  experience_level: string;
  availability: string;
  session_duration: number;
  is_verified: boolean;
  verification_notes?: string;
  total_sessions_taught: number;
  average_rating: number;
  total_reviews: number;
  reviews?: Review[];
}

export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface SessionRequest {
  id: number;
  learner_id: number;
  teacher_id: number;
  skill: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  learning_objective: string;
  learner_message?: string;
  status: SessionStatus;
  teacher_notes?: string;
  rejection_reason?: string;
  meeting_link?: string;
  requested_at: string;
  updated_at?: string;
  completed_at?: string;
  learner_name?: string;
  learner_email?: string;
  learner_course?: string;
  learner_branch?: string;
  learner_year?: number;
  learner_avatar?: string;
  teacher_name?: string;
  teacher_email?: string;
  teacher_avatar?: string;
  review_rating?: number;
  review_comment?: string;
  review?: Review;
}

export interface Review {
  id: number;
  session_id: number;
  learner_id: number;
  teacher_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  learner_name?: string;
  learner_course?: string;
}

export interface Club {
  id: number;
  name: string;
  code: string;
  category: string;
  description: string;
  activities: string;
  coordinator_name: string;
  contact_email: string;
  meeting_info: string;
  member_count: number;
  score: number;
  logo_icon: string;
  is_sample: boolean;
  activity_status?: 'active' | 'hot' | 'occasional' | 'inactive';
  focus_domain?: string;
  is_hot?: boolean;
}

export interface LeaderboardActivity {
  id: number;
  club_id: number;
  activity_name: string;
  activity_type: string;
  points: number;
  date: string;
  description: string;
}

export interface LeaderboardClub extends Omit<Club, 'activities'> {
  rank: number;
  activities_description?: string;
  activities?: LeaderboardActivity[];
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  organizer: string;
  event_date?: string;
  venue?: string;
  registration_url?: string;
  published_at: string;
  is_sample: boolean;
}

export interface NotificationLog {
  id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  event_type: string;
  status: 'sent' | 'queued' | 'failed';
  error_message?: string;
  created_at: string;
  sent_at?: string;
}

export interface PlatformStats {
  totalLearners: number;
  totalTeachers: number;
  completedSessions: number;
  activeClubs: number;
}
