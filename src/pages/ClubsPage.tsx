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
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <Users className="w-3.5 h-3.5 text-[#37352F]" />
          <span>KIET Campus Student Societies & Clubs</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352F]">
          College Clubs Directory
        </h1>
        <p className="text-xs text-[#787774] max-w-2xl leading-relaxed">
          Explore technical guilds, coding societies, creative media, debating cells, dramatics, fashion, and college sports. Connect with student coordinators and peer mentors.
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-3.5 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchClubs();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#9B9A97] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club name (GDG, NextGen, CPByte, C-Cell...), domain (DSA, ML, UI/UX), or activities..."
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

        {/* Activity Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E9E9E7] text-xs">
          <span className="text-[#787774] font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Activity className="w-3 h-3 text-[#9B9A97]" />
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              statusFilter === 'All'
                ? 'bg-[#2F2E2A] text-white border-[#2F2E2A]'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:text-[#37352F] hover:bg-[#EAE9E6]'
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setStatusFilter('hot')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
              statusFilter === 'hot'
                ? 'bg-[#FBEDD6] text-[#8F4800] border-[#F5D8A8] font-semibold'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:text-[#37352F]'
            }`}
          >
            <Flame className="w-3 h-3 text-[#8F4800]" />
            <span>Hot & Trending</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
              statusFilter === 'active'
                ? 'bg-[#EDF3EC] text-[#2B6E38] border-[#D3E5D2] font-semibold'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:text-[#37352F]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active Guilds</span>
          </button>
          <button
            onClick={() => setStatusFilter('occasional')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              statusFilter === 'occasional'
                ? 'bg-[#F6F3F9] text-[#6941C6] border-[#E4DCF5] font-semibold'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:text-[#37352F]'
            }`}
          >
            Periodic Sprints
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E9E9E7] text-xs">
          <span className="text-[#787774] font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-[#9B9A97]" />
            Domain:
          </span>
          {categoriesList.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  isActive
                    ? 'bg-[#2F2E2A] text-white border-[#2F2E2A]'
                    : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:bg-[#EAE9E6] hover:text-[#37352F]'
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
        <div className="text-center py-16 text-[#787774] text-xs">
          Loading student societies...
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-10 text-center text-xs text-[#787774]">
          <Users className="w-8 h-8 text-[#9B9A97] mx-auto mb-2" />
          <p className="text-sm text-[#37352F] font-semibold">No clubs found matching your search filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setStatusFilter('All');
            }}
            className="mt-2 text-[#37352F] hover:underline font-medium"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => {
            const isHot = Boolean(club.is_hot) || club.activity_status === 'hot';
            const isOccasional = club.activity_status === 'occasional';

            return (
              <div
                key={club.id}
                className="bg-white border border-[#E9E9E7] rounded-lg p-5 shadow-xs hover:border-[#D3D1CB] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] flex items-center justify-center text-[#37352F]">
                      {getClubIcon(club.logo_icon)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isHot && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#FBEDD6] text-[#8F4800] border border-[#F5D8A8]">
                          <Flame className="w-2.5 h-2.5 text-[#8F4800]" />
                          <span>Hot Club</span>
                        </span>
                      )}
                      {isOccasional && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
                          Periodic
                        </span>
                      )}
                      {!isHot && !isOccasional && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#EDF3EC] text-[#2B6E38] border border-[#D3E5D2]">
                          Active Guild
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#37352F] mb-1">
                    {club.name}
                  </h3>

                  {club.focus_domain && (
                    <div className="mb-2.5">
                      <span className="inline-block px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7]">
                        Focus: {club.focus_domain}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[#787774] leading-relaxed mb-3 line-clamp-2">
                    {club.description}
                  </p>

                  <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7] text-[11px] space-y-1.5 mb-3 text-[#787774]">
                    <div>
                      <span className="font-semibold text-[#37352F] block">Activities:</span>
                      <span>{club.activities}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#37352F] block">Schedule:</span>
                      <span>{club.meeting_info}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#37352F] block">Coordinator:</span>
                      <span>{club.coordinator_name} · <span className="text-[#2383E2]">{club.contact_email}</span></span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E9E9E7] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#787774] text-[11px]">
                    <span><strong>{club.member_count}</strong> members</span>
                    <span>·</span>
                    <span className="text-[#37352F] font-semibold">{club.score} pts</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        onGoToLogin();
                      } else {
                        setJoiningClub(club);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium transition-colors text-xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Apply to Join</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Club Modal */}
      {joiningClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-md w-full p-5 shadow-xl relative">
            <button
              onClick={() => setJoiningClub(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-[#37352F] mb-0.5">
              Apply to Join {joiningClub.name}
            </h3>
            <p className="text-xs text-[#787774] mb-3">
              Submit your motivation or project portfolio link to coordinator{' '}
              <strong className="text-[#37352F]">{joiningClub.coordinator_name}</strong>.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div>
                <label className="block text-[#37352F] text-xs font-medium mb-1">
                  Statement of Purpose / Why do you want to join?
                </label>
                <textarea
                  rows={4}
                  value={sop}
                  onChange={(e) => setSop(e.target.value)}
                  placeholder="Tell the core team about your technical projects, interests, or past events..."
                  required
                  className="w-full bg-white border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-[#E9E9E7]">
                <button
                  type="button"
                  onClick={() => setJoiningClub(null)}
                  className="px-3 py-1.5 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJoin}
                  className="px-3.5 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {submittingJoin ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
