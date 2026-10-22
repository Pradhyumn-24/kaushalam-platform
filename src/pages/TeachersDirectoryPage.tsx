import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Teacher } from '../types';
import { SessionBookingModal } from '../components/SessionBookingModal';
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  Star,
  CheckCircle,
  ShieldCheck,
  BookOpen,
  Calendar,
  X,
  MessageSquare
} from 'lucide-react';

interface TeachersDirectoryPageProps {
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export const TeachersDirectoryPage: React.FC<TeachersDirectoryPageProps> = ({ onGoToRegister, onGoToLogin }) => {
  const { user, role } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [experience, setExperience] = useState('All');
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<Teacher | null>(null);
  const [selectedTeacherForReviews, setSelectedTeacherForReviews] = useState<Teacher | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.getTeachers({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        experience: experience !== 'All' ? experience : undefined
      });
      setTeachers(res.teachers);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [category, experience]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleBookingClick = (teacher: Teacher) => {
    if (!user) {
      onGoToLogin();
      return;
    }
    if (user.id === teacher.id) {
      setFeedbackMessage('You cannot book a peer session with yourself.');
      return;
    }
    setSelectedTeacherForBooking(teacher);
  };

  const viewReviews = async (teacher: Teacher) => {
    try {
      const res = await api.getTeacherById(teacher.id);
      setSelectedTeacherForReviews(res.teacher);
    } catch (err: any) {
      setFeedbackMessage(err?.message || 'Failed to load mentor reviews');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Directory Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
          <span>Peer Faculty & Student Mentors</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Teachers Directory</h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Browse verified senior peers ready to teach algorithms, web dev, design, debating, and machine learning. Request 1-on-1 tutoring sessions tailored to your pace.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-200 text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-teal-400 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mentor name, skill (e.g. React, C++, Machine Learning, Figma)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-teal-400" />
              Category:
            </span>
            {['All', 'Technical', 'Creative Arts', 'Academic', 'Public Speaking', 'Languages', 'Career Prep'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  category === cat
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Experience Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Level:</span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading student mentors from database...
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No registered student mentors yet.</p>
          <p className="text-slate-500 mt-1 max-w-md mx-auto">
            This directory only displays genuine students who have registered as peer teachers. Are you ready to mentor campus peers?
          </p>
          <button
            onClick={onGoToRegister}
            className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Register as a Teacher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Info */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={teacher.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt={teacher.full_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0 shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-white text-base truncate">{teacher.full_name}</h3>
                      {teacher.is_verified && (
                        <span title="Verified Campus Mentor" className="text-teal-400">
                          <ShieldCheck className="w-4 h-4 fill-teal-400/20" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {teacher.course} ({teacher.branch}) · Year {teacher.year_of_study}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{teacher.college}</p>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{teacher.average_rating ? teacher.average_rating.toFixed(1) : '5.0'}</span>
                    <button
                      onClick={() => viewReviews(teacher)}
                      className="text-slate-400 hover:text-amber-300 ml-1 text-[11px] underline"
                    >
                      ({teacher.total_reviews || 0} reviews)
                    </button>
                  </div>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300 font-medium">
                    {teacher.total_sessions_taught || 0} taught
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-teal-400 font-medium">{teacher.experience_level}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {teacher.bio || 'Passionate student mentor ready to help peers with coding, coursework, and projects.'}
                </p>

                {/* Skills Chips */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] text-slate-400 font-medium block">Skills Taught:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-slate-800/80 text-teal-300 text-[11px] font-medium border border-slate-700/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability Info */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mb-5 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Availability:</span>
                  </div>
                  <p className="line-clamp-2 text-slate-300">{teacher.availability}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {teacher.session_duration} mins
                </span>
                <button
                  onClick={() => handleBookingClick(teacher)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Request Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedTeacherForBooking && (
        <SessionBookingModal
          teacher={selectedTeacherForBooking}
          onClose={() => setSelectedTeacherForBooking(null)}
          onSuccess={(msg) => {
            setFeedbackMessage(msg);
            fetchTeachers();
          }}
        />
      )}

      {/* Reviews Modal */}
      {selectedTeacherForReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedTeacherForReviews(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Reviews for {selectedTeacherForReviews.full_name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Genuine feedback from fellow college learners who completed peer sessions.
            </p>

            <div className="overflow-y-auto space-y-3 flex-1 text-xs">
              {(!selectedTeacherForReviews.reviews || selectedTeacherForReviews.reviews.length === 0) ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No reviews submitted yet for this mentor.
                </div>
              ) : (
                selectedTeacherForReviews.reviews.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{r.learner_name}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-slate-300 italic">"{r.comment}"</p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 text-right">
              <button
                onClick={() => setSelectedTeacherForReviews(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
