import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Club } from '../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Mail,
  Calendar,
  Sparkles,
  Trophy,
  Code,
  Rocket,
  Mic,
  Palette,
  Music,
  UserPlus,
  X,
  Flame,
  Globe,
  Terminal,
  Cpu,
  Camera,
  Bot,
  Compass,
  Star,
  Activity
} from 'lucide-react';

export const ClubsPage: React.FC<{ onGoToLogin: () => void }> = ({ onGoToLogin }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'hot' | 'occasional'>('All');
  const [joiningClub, setJoiningClub] = useState<Club | null>(null);
  const [sop, setSop] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const isHotQuery = category === '🔥 Hot Clubs' || statusFilter === 'hot';
      const actualCategory = (category !== 'All' && category !== '🔥 Hot Clubs') ? category : undefined;
      const actualStatus = (statusFilter !== 'All' && statusFilter !== 'hot') ? statusFilter : undefined;

      const res = await api.getClubs({
        search: search.trim() || undefined,
        category: actualCategory,
        is_hot: isHotQuery || undefined,
        status: actualStatus
      });
      setClubs(res.clubs);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category, statusFilter]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningClub) return;

    try {
      setSubmittingJoin(true);
      const res = await api.joinClub(joiningClub.id, sop);
      setFeedbackMessage(res.message);
      setJoiningClub(null);
      setSop('');
      fetchClubs();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit join request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const getClubIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-teal-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'Camera':
        return <Camera className="w-5 h-5 text-rose-400" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-teal-400" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-amber-400" />;
      case 'Mic':
        return <Mic className="w-5 h-5 text-purple-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-rose-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'Star':
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      default:
        return <Users className="w-5 h-5 text-teal-400" />;
    }
  };

  const categoriesList = [
    'All',
    '🔥 Hot Clubs',
    'Technical',
    'Creative Media',
    'Entrepreneurship',
    'Fashion & Lifestyle',
    'Dramatic Arts',
    'Public Speaking',
    'Dance & Performing Arts',
    'Social Welfare',
    'Sports & Athletics'
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span>KIET Campus Student Societies & Clubs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          College Clubs Directory
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Explore technical guilds, coding societies, creative media, debating cells, dramatics, fashion, and college sports. Connect with student coordinators and peer mentors.
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchClubs();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club name (GDG, NextGen, CPByte, C-Cell...), domain (DSA, ML, UI/UX), or activities..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Clubs</span>
          </button>
        </form>

        {/* Activity Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Activity className="w-3 h-3 text-teal-400" />
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              statusFilter === 'All'
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setStatusFilter('hot')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              statusFilter === 'hot'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-amber-300'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Hot & Trending Clubs</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-emerald-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active Campus Guilds</span>
          </button>
          <button
            onClick={() => setStatusFilter('occasional')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              statusFilter === 'occasional'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-purple-300'
            }`}
          >
            Occasional / Periodic Sprints
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-teal-400" />
            Domain:
          </span>
          {categoriesList.map((cat) => {
            const isHotCat = cat === '🔥 Hot Clubs';
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  isActive
                    ? isHotCat
                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-amber-500 shadow-md'
                      : 'bg-teal-600 text-white border-teal-500 shadow-sm'
                    : isHotCat
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading KIET student societies...</span>
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No clubs found matching your search filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setStatusFilter('All');
            }}
            className="mt-3 text-teal-400 hover:underline font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const isHot = Boolean(club.is_hot) || club.activity_status === 'hot';
            const isOccasional = club.activity_status === 'occasional';

            return (
              <div
                key={club.id}
                className={`rounded-2xl p-6 shadow-md transition-all flex flex-col justify-between ${
                  isHot
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/40 hover:border-amber-400/80 shadow-amber-950/20'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isHot
                          ? 'bg-amber-500/10 border border-amber-500/30'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {getClubIcon(club.logo_icon)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isHot && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/40">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Hot Club</span>
                        </span>
                      )}
                      {isOccasional && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Occasional Sprints
                        </span>
                      )}
                      {!isHot && !isOccasional && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                          Active Guild
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <span>{club.name}</span>
                  </h3>

                  {club.focus_domain && (
                    <div className="mb-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/90 text-amber-300/90 border border-slate-700">
                        Focus: {club.focus_domain}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {club.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] space-y-2 mb-4">
                    <div>
                      <span className="text-slate-400 font-semibold block">Key Activities:</span>
                      <span className="text-slate-300">{club.activities}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Meeting Schedule:</span>
                      <span className="text-teal-300 font-medium">{club.meeting_info}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Coordinator:</span>
                      <span className="text-slate-300">{club.coordinator_name} · <span className="text-teal-400">{club.contact_email}</span></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span><strong>{club.member_count}</strong> members</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">{club.score} pts</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        onGoToLogin();
                      } else {
                        setJoiningClub(club);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shadow-sm transition-all text-xs ${
                      isHot
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-amber-600/20'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-700/20'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Apply / Join</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Club Modal */}
      {joiningClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setJoiningClub(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Apply to Join {joiningClub.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit your motivation or project portfolio link to club coordinator{' '}
              <strong className="text-teal-300">{joiningClub.coordinator_name}</strong>.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">
                  Statement of Purpose / Why do you want to join?
                </label>
                <textarea
                  rows={4}
                  value={sop}
                  onChange={(e) => setSop(e.target.value)}
                  placeholder="Tell the core team about your technical projects, interests, or past events you attended..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoiningClub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJoin}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {submittingJoin ? 'Submitting Application...' : 'Send Membership Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
