import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Teacher } from '../types';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Mail,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building,
  Star
} from 'lucide-react';

interface BookSessionPageProps {
  onGoToDashboard: () => void;
  onGoToTeachers: () => void;
  preselectedTeacherId?: number;
}

export const BookSessionPage: React.FC<BookSessionPageProps> = ({
  onGoToDashboard,
  onGoToTeachers,
  preselectedTeacherId
}) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  // Form State
  const [teacherMode, setTeacherMode] = useState<'existing' | 'new'>(
    preselectedTeacherId ? 'existing' : 'existing'
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>(
    preselectedTeacherId || ''
  );
  const [teacherSearch, setTeacherSearch] = useState('');

  // New Teacher Fields
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherBranch, setNewTeacherBranch] = useState('Computer Science & Engineering');
  const [newTeacherYear, setNewTeacherYear] = useState(3);
  const [newTeacherSkill, setNewTeacherSkill] = useState('');
  const [newTeacherBio, setNewTeacherBio] = useState('');
  const [newTeacherAvailability, setNewTeacherAvailability] = useState('Mon-Fri: 4:30 PM - 6:30 PM | Weekends On Request');

  // Session Fields
  const [skill, setSkill] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('17:00');
  const [duration, setDuration] = useState(45);
  const [learningObjective, setLearningObjective] = useState('');
  const [learnerMessage, setLearnerMessage] = useState('');

  // Guest Learner Fields (if not logged in)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestBranch, setGuestBranch] = useState('Computer Science & Engineering');
  const [guestYear, setGuestYear] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    sessionId: number;
    teacherName: string;
  } | null>(null);

  // Standalone Add Teacher Form
  const [activeTab, setActiveTab] = useState<'book' | 'add-teacher-only'>('book');
  const [teacherOnlySuccess, setTeacherOnlySuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await api.getTeachers();
      setTeachers(res.teachers);
      if (preselectedTeacherId && !selectedTeacherId) {
        setSelectedTeacherId(preselectedTeacherId);
        const pt = res.teachers.find(t => t.id === preselectedTeacherId);
        if (pt && pt.skills.length > 0 && !skill) {
          setSkill(pt.skills[0]);
        }
      } else if (!selectedTeacherId && res.teachers.length > 0) {
        setSelectedTeacherId(res.teachers[0].id);
        if (res.teachers[0].skills.length > 0 && !skill) {
          setSkill(res.teachers[0].skills[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load teachers for booking:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const selectedTeacher = teachers.find((t) => t.id === Number(selectedTeacherId));

  // When teacher is selected, prefill skill if available
  const handleSelectTeacher = (id: number) => {
    setSelectedTeacherId(id);
    const t = teachers.find((item) => item.id === id);
    if (t && t.skills.length > 0 && !skill) {
      setSkill(t.skills[0]);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!skill.trim()) {
      setError('Please specify the subject or skill you wish to learn.');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError('Please choose a valid session date and time.');
      return;
    }

    if (!learningObjective.trim()) {
      setError('Please describe your learning objective or topic questions.');
      return;
    }

    if (teacherMode === 'existing' && !selectedTeacherId) {
      setError('Please select a teacher from the list, or switch to "Add a New Teacher".');
      return;
    }

    if (teacherMode === 'new') {
      if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
        setError('Please enter the new teacher\'s full name and email address.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newTeacherEmail.trim())) {
        setError('Please enter a valid email address for the teacher.');
        return;
      }
    }

    if (!user) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setError('Please enter your student name and email to receive the session confirmation.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload: any = {
        skill: skill.trim(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: Number(duration),
        learning_objective: learningObjective.trim(),
        learner_message: learnerMessage.trim() || undefined
      };

      if (teacherMode === 'existing') {
        payload.teacher_id = Number(selectedTeacherId);
      } else {
        payload.new_teacher = {
          full_name: newTeacherName.trim(),
          email: newTeacherEmail.trim(),
          department: newTeacherBranch,
          branch: newTeacherBranch,
          year_of_study: Number(newTeacherYear),
          skills: [newTeacherSkill.trim() || skill.trim()],
          bio: newTeacherBio.trim() || undefined,
          availability: newTeacherAvailability.trim()
        };
      }

      if (!user) {
        payload.guest_learner = {
          full_name: guestName.trim(),
          email: guestEmail.trim(),
          branch: guestBranch,
          year_of_study: Number(guestYear)
        };
      }

      const res = await api.bookSessionWithTeacher(payload);
      setSuccessData({
        message: res.message,
        sessionId: res.session_id,
        teacherName: res.teacher_name
      });
      loadTeachers();
    } catch (err: any) {
      setError(err?.message || 'Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTeacherOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTeacherOnlySuccess(null);

    if (!newTeacherName.trim() || !newTeacherEmail.trim()) {
      setError('Please provide teacher name and email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.addCustomTeacher({
        full_name: newTeacherName.trim(),
        email: newTeacherEmail.trim(),
        branch: newTeacherBranch,
        year_of_study: Number(newTeacherYear),
        skills: [newTeacherSkill.trim() || 'General Engineering Mentorship'],
        bio: newTeacherBio.trim() || undefined,
        availability: newTeacherAvailability.trim()
      });
      setTeacherOnlySuccess(res.message);
      setNewTeacherName('');
      setNewTeacherEmail('');
      setNewTeacherSkill('');
      setNewTeacherBio('');
      loadTeachers();
    } catch (err: any) {
      setError(err?.message || 'Failed to add teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!teacherSearch.trim()) return true;
    const q = teacherSearch.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(q) ||
      t.branch.toLowerCase().includes(q) ||
      t.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Notion Page Title & Icon */}
      <div className="space-y-2 pt-2">
        <div className="text-4xl select-none mb-1">📅</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#37352F] tracking-tight">
          Book a Peer Session
        </h1>
        <p className="text-sm text-[#787774] max-w-2xl leading-relaxed">
          Schedule 1-on-1 tutoring sessions with campus peer mentors. Select from verified student teachers or add a new senior peer mentor to learn with.
        </p>
      </div>

      {/* Notion Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E9E7] pb-3">
        <button
          onClick={() => {
            setActiveTab('book');
            setError(null);
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'book'
              ? 'bg-[#37352F] text-white shadow-xs'
              : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#37352F]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book a Session</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('add-teacher-only');
            setError(null);
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'add-teacher-only'
              ? 'bg-[#37352F] text-white shadow-xs'
              : 'text-[#787774] hover:bg-[#EFEFED] hover:text-[#37352F]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Teacher to Directory</span>
        </button>
      </div>

      {/* Success Notification for Booking */}
      {successData && (
        <div className="bg-white border border-[#D3D1CB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#37352F]">Session Request Dispatched!</h3>
              <p className="text-xs text-[#787774]">{successData.message}</p>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-xs space-y-1.5 text-[#37352F]">
            <p>
              <strong className="text-[#37352F]">Teacher:</strong> {successData.teacherName}
            </p>
            <p>
              <strong className="text-[#37352F]">Date & Time:</strong> {scheduledDate} at {scheduledTime} ({duration} mins)
            </p>
            <p>
              <strong className="text-[#37352F]">Subject / Skill:</strong> {skill}
            </p>
            <p className="text-[#9B9A97] text-[11px] pt-1">
              An invitation and calendar booking notification have been logged to the system outbox queue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={onGoToDashboard}
              className="px-3.5 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>View in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setLearningObjective('');
                setLearnerMessage('');
              }}
              className="px-3.5 py-1.5 rounded-md bg-white hover:bg-[#F7F6F3] text-[#37352F] text-xs font-medium border border-[#D3D1CB] transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </div>
      )}

      {/* Teacher Only Success */}
      {teacherOnlySuccess && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{teacherOnlySuccess}</span>
          </div>
          <button
            onClick={() => setTeacherOnlySuccess(null)}
            className="text-amber-800 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Booking Form */}
      {activeTab === 'book' && !successData && (
        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* Section 1: Teacher Selection / Add Teacher */}
          <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9E9E7] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#37352F] flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#F1F1EF] text-[#37352F] flex items-center justify-center text-xs font-semibold border border-[#D3D1CB]">
                    1
                  </span>
                  <span>Select Teacher</span>
                </h2>
                <p className="text-xs text-[#787774] mt-0.5">
                  Choose a peer mentor from the directory or register a new teacher.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#F1F1EF] p-0.5 rounded-lg border border-[#E9E9E7] text-xs">
                <button
                  type="button"
                  onClick={() => setTeacherMode('existing')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    teacherMode === 'existing'
                      ? 'bg-white text-[#37352F] shadow-xs'
                      : 'text-[#787774] hover:text-[#37352F]'
                  }`}
                >
                  Existing Peer Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherMode('new')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    teacherMode === 'new'
                      ? 'bg-white text-[#37352F] shadow-xs'
                      : 'text-[#787774] hover:text-[#37352F]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add a Teacher</span>
                </button>
              </div>
            </div>

            {/* Mode A: Select Existing Teacher */}
            {teacherMode === 'existing' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9B9A97] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Search teachers by name, subject, or branch..."
                    className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md pl-9 pr-3 py-2 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:bg-white focus:border-[#37352F]"
                  />
                </div>

                {loadingTeachers ? (
                  <div className="p-6 text-center text-xs text-[#787774]">Loading campus teachers...</div>
                ) : filteredTeachers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#787774] bg-[#FAF9F6] rounded-lg border border-[#E9E9E7] space-y-1.5">
                    <p className="font-semibold text-[#37352F]">No registered teachers found.</p>
                    <p>Only registered teachers appear here. You can click <strong>"+ Add a Teacher"</strong> above to add your senior mentor or register as a teacher!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredTeachers.map((t) => {
                      const isSelected = Number(selectedTeacherId) === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTeacher(t.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#F7F6F3] border-[#37352F] shadow-xs ring-1 ring-[#37352F]'
                              : 'bg-white border-[#E9E9E7] hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] overflow-hidden flex items-center justify-center shrink-0">
                              {t.avatar_url ? (
                                <img src={t.avatar_url} alt={t.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-semibold text-xs text-[#37352F]">
                                  {t.full_name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-xs truncate text-[#37352F]">{t.full_name}</h4>
                                <span className="flex items-center gap-0.5 text-[11px] text-[#787774] font-medium">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                  {t.average_rating ? t.average_rating.toFixed(1) : '5.0'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#787774] truncate">
                                {t.branch} · Year {t.year_of_study}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {t.skills.slice(0, 2).map((s) => (
                                  <span
                                    key={s}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-[#F1F1EF] border border-[#E9E9E7] text-[#37352F]"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {t.skills.length > 2 && (
                                  <span className="text-[10px] text-[#9B9A97]">
                                    +{t.skills.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedTeacher && (
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#787774] font-bold uppercase tracking-wider block">
                        Selected Mentor
                      </span>
                      <span className="font-semibold text-[#37352F]">{selectedTeacher.full_name}</span>
                      <span className="text-[#787774] ml-2">({selectedTeacher.email})</span>
                      <p className="text-[11px] text-[#787774] mt-0.5">
                        Availability: {selectedTeacher.availability}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTeacherId('')}
                      className="text-xs text-[#37352F] hover:underline font-medium"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Add a New Teacher Form */}
            {teacherMode === 'new' && (
              <div className="space-y-4 p-4 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#37352F]">
                  <UserPlus className="w-4 h-4 text-[#787774]" />
                  <span>Enter Details of the Peer Teacher you want to book or add:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">
                      Teacher Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="E.g., Senior Student Mentor"
                      required={teacherMode === 'new'}
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">
                      College Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newTeacherEmail}
                      onChange={(e) => setNewTeacherEmail(e.target.value)}
                      placeholder="E.g., ananya.verma@kiet.edu"
                      required={teacherMode === 'new'}
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">Department / Branch</label>
                    <select
                      value={newTeacherBranch}
                      onChange={(e) => setNewTeacherBranch(e.target.value)}
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Computer Science & Information Technology">CSIT</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="MCA / Postgrad">MCA / Postgrad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">Year of Study</label>
                    <select
                      value={newTeacherYear}
                      onChange={(e) => setNewTeacherYear(Number(e.target.value))}
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    >
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year (Senior)</option>
                      <option value={4}>4th Year (Final Year)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">
                      Skill / Subject They Excel At
                    </label>
                    <input
                      type="text"
                      value={newTeacherSkill}
                      onChange={(e) => {
                        setNewTeacherSkill(e.target.value);
                        if (!skill) setSkill(e.target.value);
                      }}
                      placeholder="E.g., Dynamic Programming, System Design, React"
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">Availability Note</label>
                    <input
                      type="text"
                      value={newTeacherAvailability}
                      onChange={(e) => setNewTeacherAvailability(e.target.value)}
                      placeholder="E.g., Mon-Fri 5-7 PM"
                      className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-[#37352F] font-medium mb-1">
                    Teacher Bio / Recommendation (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTeacherBio}
                    onChange={(e) => setNewTeacherBio(e.target.value)}
                    placeholder="E.g., Codeforces Candidate Master, high project expertise"
                    className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-[#37352F] focus:outline-none focus:border-[#37352F]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Session Scheduling Details */}
          <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-semibold text-[#37352F] flex items-center gap-2 border-b border-[#E9E9E7] pb-4">
              <span className="w-5 h-5 rounded bg-[#F1F1EF] text-[#37352F] flex items-center justify-center text-xs font-semibold border border-[#D3D1CB]">
                2
              </span>
              <span>Session Scheduling & Learning Goals</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Subject / Skill to Learn</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="E.g., Dynamic Programming on Trees, React Hooks, Figma Design System"
                  required
                  className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                />
              </div>

              <div>
                <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Duration</span>
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins (Recommended)</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Scheduled Date</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                />
              </div>

              <div>
                <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Scheduled Time Slot</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[#37352F] font-medium mb-1">
                Learning Objective & Questions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="Describe what concepts, homework problems, or placement topics you need guidance with..."
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>

            <div className="text-xs">
              <label className="block text-[#37352F] font-medium mb-1">
                Optional Message for Teacher
              </label>
              <input
                type="text"
                value={learnerMessage}
                onChange={(e) => setLearnerMessage(e.target.value)}
                placeholder="E.g., Looking forward to reviewing code on GitHub repo"
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* Section 3: Student Details */}
          <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-[#37352F] flex items-center gap-2 border-b border-[#E9E9E7] pb-4">
              <span className="w-5 h-5 rounded bg-[#F1F1EF] text-[#37352F] flex items-center justify-center text-xs font-semibold border border-[#D3D1CB]">
                3
              </span>
              <span>Learner Contact Information</span>
            </h2>

            {user ? (
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] flex items-center justify-center text-[#37352F] font-semibold">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#37352F]">{user.full_name}</h4>
                    <p className="text-[#787774] text-[11px]">{user.email} · {user.branch} · Year {user.year_of_study}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F1EF] border border-[#E9E9E7] text-[#37352F]">
                  Logged in as {user.role}
                </span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-[#787774] text-[11px]">
                  You are not logged in. Enter your student information so the peer teacher can send meeting links and notes.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="E.g., Your Full Name"
                      required={!user}
                      className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#37352F] font-medium mb-1">
                      Your College Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="E.g., student@kiet.edu"
                      required={!user}
                      className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Session Request...' : 'Confirm & Request Session'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Standalone Add Teacher Form */}
      {activeTab === 'add-teacher-only' && (
        <form onSubmit={handleAddTeacherOnly} className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#37352F] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#787774]" />
              <span>Add a Peer Teacher to the College Directory</span>
            </h2>
            <p className="text-xs text-[#787774] leading-relaxed">
              Know a talented classmate, senior, or project partner? Add their details here so they are featured in the Teachers Directory and fellow students can book learning sessions with them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#37352F] font-medium mb-1">
                Teacher Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                placeholder="E.g., Senior Student Mentor"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">
                College Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={newTeacherEmail}
                onChange={(e) => setNewTeacherEmail(e.target.value)}
                placeholder="E.g., rohan.deshmukh@kiet.edu"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Department / Branch</label>
              <input
                type="text"
                value={newTeacherBranch}
                onChange={(e) => setNewTeacherBranch(e.target.value)}
                placeholder="E.g., Computer Science & Engineering"
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Year of Study</label>
              <select
                value={newTeacherYear}
                onChange={(e) => setNewTeacherYear(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-[#37352F] font-medium mb-1">
              Skills Taught (Comma-separated) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTeacherSkill}
              onChange={(e) => setNewTeacherSkill(e.target.value)}
              placeholder="E.g., Dynamic Programming, React.js, Python, Figma"
              required
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          <div className="text-xs">
            <label className="block text-[#37352F] font-medium mb-1">
              Availability Note
            </label>
            <input
              type="text"
              value={newTeacherAvailability}
              onChange={(e) => setNewTeacherAvailability(e.target.value)}
              placeholder="E.g., Mon, Wed: 5-7 PM | Weekends On Request"
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          <div className="text-xs">
            <label className="block text-[#37352F] font-medium mb-1">
              Teacher Bio / Achievements (Optional)
            </label>
            <textarea
              rows={2}
              value={newTeacherBio}
              onChange={(e) => setNewTeacherBio(e.target.value)}
              placeholder="E.g., Solved 450+ LeetCode problems, ICPC regionalist, willing to guide juniors..."
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{submitting ? 'Adding Teacher...' : 'Add Teacher to Directory'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
