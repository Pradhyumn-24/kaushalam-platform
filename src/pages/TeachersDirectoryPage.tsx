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
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Directory Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-[#37352F]" />
          <span>Peer Faculty & Student Mentors</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352F]">Teachers Directory</h1>
        <p className="text-xs text-[#787774] max-w-2xl leading-relaxed">
          Browse verified senior peers ready to teach algorithms, web dev, design, debating, and machine learning. Request 1-on-1 tutoring sessions tailored to your pace.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-md bg-[#EDF3EC] border border-[#D3E5D2] text-[#2B6E38] text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#2B6E38] font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Notion Database Filter Bar */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-3.5 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#9B9A97] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mentor name, skill (e.g. React, C++, Machine Learning, Figma)..."
              className="w-full bg-[#FAF9F6] border border-[#E9E9E7] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#2F2E2A] hover:bg-[#191918] text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#E9E9E7] text-xs">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#787774] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#9B9A97]" />
              Category:
            </span>
            {['All', 'Technical', 'Creative Arts', 'Academic', 'Public Speaking', 'Languages', 'Career Prep'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  category === cat
                    ? 'bg-[#2F2E2A] text-white border-[#2F2E2A]'
                    : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:text-[#37352F] hover:bg-[#EAE9E6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Experience Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#787774] font-medium">Level:</span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-[#F1F1EF] border border-[#E9E9E7] rounded-md px-2 py-0.5 text-[#37352F] text-xs focus:outline-none focus:border-[#2383E2]"
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
        <div className="text-center py-16 text-[#787774] text-xs">
          Loading student mentors...
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-10 text-center text-xs text-[#787774]">
          <GraduationCap className="w-8 h-8 text-[#9B9A97] mx-auto mb-2" />
          <p className="text-sm text-[#37352F] font-semibold">No registered student mentors yet.</p>
          <p className="text-[#787774] mt-1 max-w-md mx-auto">
            This directory only displays genuine students who have registered as peer teachers. Are you ready to mentor campus peers?
          </p>
          <button
            onClick={onGoToRegister}
            className="mt-3 px-3.5 py-1.5 bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium rounded-md text-xs transition-colors"
          >
            Register as a Teacher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5 shadow-xs hover:border-[#D3D1CB] hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Info */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={teacher.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt={teacher.full_name}
                    className="w-12 h-12 rounded-md object-cover border border-[#E9E9E7] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-[#37352F] text-sm truncate">{teacher.full_name}</h3>
                      {teacher.is_verified && (
                        <span title="Verified Campus Mentor" className="text-emerald-600">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#787774] truncate">
                      {teacher.course} ({teacher.branch}) · Year {teacher.year_of_study}
                    </p>
                    <p className="text-[11px] text-[#9B9A97] truncate">{teacher.college}</p>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7] mb-3">
                  <div className="flex items-center gap-1 text-[#37352F] font-medium">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{teacher.average_rating ? teacher.average_rating.toFixed(1) : '5.0'}</span>
                    <button
                      onClick={() => viewReviews(teacher)}
                      className="text-[#787774] hover:text-[#37352F] ml-1 text-[11px] underline"
                    >
                      ({teacher.total_reviews || 0})
                    </button>
                  </div>
                  <span className="text-[#D3D1CB]">|</span>
                  <span className="text-[#787774]">
                    {teacher.total_sessions_taught || 0} taught
                  </span>
                  <span className="text-[#D3D1CB]">|</span>
                  <span className="text-[#37352F] font-medium text-[11px]">{teacher.experience_level}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#787774] leading-relaxed line-clamp-2 mb-3">
                  {teacher.bio || 'Passionate student mentor ready to help peers with coding, coursework, and projects.'}
                </p>

                {/* Skills Chips */}
                <div className="space-y-1 mb-3">
                  <span className="text-[11px] text-[#9B9A97] font-medium block">Skills Taught:</span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] text-[11px] font-medium border border-[#E9E9E7]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability Info */}
                <div className="p-2 rounded bg-[#FAF9F6] border border-[#E9E9E7] text-[11px] text-[#787774] mb-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-[#37352F] font-medium">
                    <Clock className="w-3 h-3 text-[#9B9A97]" />
                    <span>Availability:</span>
                  </div>
                  <p className="line-clamp-2 text-[#787774]">{teacher.availability}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2.5 border-t border-[#E9E9E7] flex items-center justify-between gap-2">
                <span className="text-xs text-[#787774] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#9B9A97]" />
                  {teacher.session_duration} mins
                </span>
                <button
                  onClick={() => handleBookingClick(teacher)}
                  className="px-3 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-lg w-full p-6 shadow-xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedTeacherForReviews(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-[#37352F] mb-0.5">
              Reviews for {selectedTeacherForReviews.full_name}
            </h3>
            <p className="text-xs text-[#787774] mb-4">
              Genuine feedback from fellow college learners who completed peer sessions.
            </p>

            <div className="overflow-y-auto space-y-2.5 flex-1 text-xs">
              {(!selectedTeacherForReviews.reviews || selectedTeacherForReviews.reviews.length === 0) ? (
                <div className="text-center py-8 text-[#9B9A97]">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No reviews submitted yet for this mentor.
                </div>
              ) : (
                selectedTeacherForReviews.reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-md bg-[#FAF9F6] border border-[#E9E9E7] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#37352F]">{r.learner_name}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-[#787774] italic">"{r.comment}"</p>
                    )}
                    <p className="text-[10px] text-[#9B9A97]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#E9E9E7] mt-3 text-right">
              <button
                onClick={() => setSelectedTeacherForReviews(null)}
                className="px-3 py-1 bg-[#F1F1EF] text-[#37352F] rounded-md hover:bg-[#EAE9E6] text-xs font-medium transition-colors"
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
