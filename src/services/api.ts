import {
  User,
  Teacher,
  SessionRequest,
  Club,
  Announcement,
  LeaderboardClub,
  NotificationLog,
  PlatformStats
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('kaushalam_token');
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('kaushalam_token', token);
    } else {
      localStorage.removeItem('kaushalam_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    let data: any = {};
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || `Request failed with status ${response.status}` };
    }

    if (!response.ok) {
      const errorMessage = data?.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`);
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- Auth ---
  async registerLearner(payload: any): Promise<{ token: string; user: User; message: string }> {
    return this.request('/auth/register-learner', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async registerTeacher(payload: any): Promise<{ token: string; user: User; message: string }> {
    return this.request('/auth/register-teacher', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async login(payload: { email: string; password: string }): Promise<{ token: string; user: User; message: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // --- Teachers ---
  async getTeachers(params: { search?: string; category?: string; experience?: string; availability?: string } = {}): Promise<{ teachers: Teacher[] }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.experience && params.experience !== 'All') query.set('experience', params.experience);
    if (params.availability) query.set('availability', params.availability);

    const queryString = query.toString();
    return this.request(`/teachers${queryString ? `?${queryString}` : ''}`);
  }

  async getTeacherById(id: number): Promise<{ teacher: Teacher }> {
    return this.request(`/teachers/${id}`);
  }

  async updateTeacherProfile(payload: {
    skills?: string[];
    category?: string;
    experience_level?: string;
    availability?: string;
    session_duration?: number;
    bio?: string;
  }): Promise<{ message: string }> {
    return this.request('/teacher-profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // --- Sessions & Workflow ---
  async requestSession(payload: {
    teacher_id: number;
    skill: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    learning_objective: string;
    learner_message?: string;
  }): Promise<{ message: string; session_id: number; emailStatus?: string }> {
    return this.request('/sessions/request', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPendingSessions(): Promise<{ sessions: SessionRequest[] }> {
    return this.request('/sessions/pending');
  }

  async getUpcomingSessions(): Promise<{ sessions: SessionRequest[] }> {
    return this.request('/sessions/upcoming');
  }

  async getSessionHistory(status: string = 'all'): Promise<{ sessions: SessionRequest[] }> {
    return this.request(`/sessions/history?status=${encodeURIComponent(status)}`);
  }

  async approveSession(id: number, payload: { meeting_link?: string; teacher_notes?: string }): Promise<{ message: string; meeting_link?: string }> {
    return this.request(`/sessions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async confirmSession(id: number, payload: { meeting_link?: string; teacher_notes?: string }): Promise<{ message: string; meeting_link?: string }> {
    return this.request(`/sessions/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async rejectSession(id: number, reason: string): Promise<{ message: string }> {
    return this.request(`/sessions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async cancelSession(id: number): Promise<{ message: string }> {
    return this.request(`/sessions/${id}/cancel`, {
      method: 'POST'
    });
  }

  async completeSession(id: number): Promise<{ message: string }> {
    return this.request(`/sessions/${id}/complete`, {
      method: 'POST'
    });
  }

  async reviewSession(id: number, payload: { rating: number; comment?: string }): Promise<{ message: string }> {
    return this.request(`/sessions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Add custom peer teacher to directory
  async addCustomTeacher(payload: {
    full_name: string;
    email: string;
    branch?: string;
    year_of_study?: number;
    skills: string[];
    bio?: string;
    avatar_url?: string;
    availability?: string;
  }): Promise<{ message: string; teacher_id: number }> {
    return this.request('/teachers/add-custom', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Book session with existing teacher or new teacher
  async bookSessionWithTeacher(payload: {
    teacher_id?: number;
    new_teacher?: {
      full_name: string;
      email: string;
      department?: string;
      branch?: string;
      year_of_study?: number;
      skills?: string[];
      bio?: string;
      availability?: string;
      avatar_url?: string;
    };
    skill: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    learning_objective: string;
    learner_message?: string;
    guest_learner?: {
      full_name: string;
      email: string;
      branch?: string;
      year_of_study?: number;
    };
  }): Promise<{ message: string; session_id: number; teacher_name: string }> {
    return this.request('/sessions/book-with-teacher', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // --- Clubs ---
  async getClubs(params: { category?: string; search?: string; is_hot?: boolean; status?: string } = {}): Promise<{ clubs: Club[] }> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.is_hot) query.set('is_hot', 'true');
    if (params.status && params.status !== 'All') query.set('status', params.status);
    const queryString = query.toString();
    return this.request(`/clubs${queryString ? `?${queryString}` : ''}`);
  }

  async joinClub(clubId: number, statementOfPurpose?: string): Promise<{ message: string }> {
    return this.request(`/clubs/${clubId}/join`, {
      method: 'POST',
      body: JSON.stringify({ statement_of_purpose: statementOfPurpose })
    });
  }

  // --- Announcements ---
  async getAnnouncements(category?: string): Promise<{ announcements: Announcement[] }> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/announcements${query}`);
  }

  // --- Leaderboard ---
  async getLeaderboard(category?: string): Promise<{ leaderboard: LeaderboardClub[] }> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/leaderboard${query}`);
  }

  // --- Outbox & Stats ---
  async getOutbox(): Promise<{ outbox: NotificationLog[] }> {
    return this.request('/outbox');
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return this.request('/stats');
  }

  // --- Gemini AI Services ---
  async sendChatMessage(payload: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    systemInstruction?: string;
    enableSearch?: boolean;
  }): Promise<{ reply: string; groundingChunks: Array<{ uri: string; title: string }>; modelUsed: string }> {
    return this.request('/gemini/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async searchGrounding(prompt: string): Promise<{
    query: string;
    text: string;
    sources: Array<{ uri: string; title: string }>;
    modelUsed: string;
  }> {
    return this.request('/gemini/search', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }

  async sendVoiceTurn(prompt: string): Promise<{ replyText: string; voice: string }> {
    return this.request('/gemini/voice-turn', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }
}

export const api = new ApiService();
