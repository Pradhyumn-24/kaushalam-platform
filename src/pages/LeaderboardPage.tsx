import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LeaderboardClub } from '../types';
import {
  Trophy,
  Filter,
  Medal,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  CheckCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardClub[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedClubId, setExpandedClubId] = useState<number | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.getLeaderboard(category !== 'All' ? category : undefined);
      setLeaderboard(res.leaderboard);
      if (res.leaderboard.length > 0 && expandedClubId === null) {
        setExpandedClubId(res.leaderboard[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-md bg-[#FAF3DD] border border-[#F3E7BE] flex items-center justify-center text-[#8F6B00] font-bold text-xs">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] flex items-center justify-center text-[#37352F] font-bold text-xs">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-md bg-[#FBEDD6] border border-[#F5D8A8] flex items-center justify-center text-[#8F4800] font-bold text-xs">
          3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-md bg-white border border-[#E9E9E7] flex items-center justify-center text-[#787774] font-medium text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <Trophy className="w-3.5 h-3.5 text-[#37352F]" />
          <span>Campus Engagement & Activity Index</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352F]">Club Activity Leaderboard</h1>
        <p className="text-xs text-[#787774] max-w-2xl leading-relaxed">
          Transparent campus rankings based on verified student workshops conducted, hackathon attendance, peer teaching circles, and inter-collegiate achievements.
        </p>
      </div>

      {/* Notion Callout: Transparent Scoring Criteria */}
      <div className="bg-[#FAF9F6] border border-[#E9E9E7] rounded-lg p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#37352F] font-semibold text-xs">
          <Info className="w-3.5 h-3.5 text-[#787774]" />
          <span>Documented Point Calculation Model</span>
        </div>
        <p className="text-[#787774] text-xs leading-relaxed">
          Scores are aggregated exclusively from verified database activity records:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-md bg-white border border-[#E9E9E7]">
            <span className="text-[#37352F] font-bold block">+30 pts</span>
            <span className="text-[11px] text-[#787774]">Flagship Campus Event</span>
          </div>
          <div className="p-2.5 rounded-md bg-white border border-[#E9E9E7]">
            <span className="text-[#37352F] font-bold block">+25 pts</span>
            <span className="text-[11px] text-[#787774]">Peer Skill Bootcamp</span>
          </div>
          <div className="p-2.5 rounded-md bg-white border border-[#E9E9E7]">
            <span className="text-[#37352F] font-bold block">+10 pts / 10 att</span>
            <span className="text-[11px] text-[#787774]">Student Attendance</span>
          </div>
          <div className="p-2.5 rounded-md bg-white border border-[#E9E9E7]">
            <span className="text-[#37352F] font-bold block">+50 pts</span>
            <span className="text-[11px] text-[#787774]">National Competition</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-3 flex flex-wrap items-center gap-1.5 text-xs shadow-xs">
        <span className="text-[#787774] font-medium mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#9B9A97]" />
          Category Filter:
        </span>
        {['All', 'Technical', 'Entrepreneurship', 'Public Speaking', 'Creative Arts', 'Cultural', 'Sports'].map((cat) => (
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

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="text-center py-16 text-[#787774] text-xs">
          Loading rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-10 text-center text-xs text-[#787774]">
          <Trophy className="w-8 h-8 text-[#9B9A97] mx-auto mb-2" />
          <p className="text-sm text-[#37352F] font-semibold">No club records in this category.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((club) => {
            const isExpanded = expandedClubId === club.id;
            return (
              <div
                key={club.id}
                className="bg-white border border-[#E9E9E7] rounded-lg shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedClubId(isExpanded ? null : club.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(club.rank)}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#37352F] text-sm">{club.name}</h3>
                        <span className="text-[10px] uppercase font-medium px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
                          {club.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#787774] mt-0.5">
                        Coordinator: {club.coordinator_name} · {club.member_count} student members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#37352F]">{club.score}</div>
                      <span className="text-[10px] text-[#9B9A97] uppercase tracking-wider font-medium">
                        Points
                      </span>
                    </div>

                    <button className="p-1 rounded text-[#9B9A97] hover:text-[#37352F] hover:bg-[#F1F1EF]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Activity Points Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E9E9E7] bg-[#FAF9F6] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-[#37352F] font-medium">
                      <span>Verified Contributing Activities:</span>
                      <span className="text-[11px] text-[#9B9A97]">Documented Audits</span>
                    </div>

                    {(!club.activities || club.activities.length === 0) ? (
                      <p className="text-[#9B9A97] italic">No activity entries recorded.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {club.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-md bg-white border border-[#E9E9E7] flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#37352F]">{act.activity_name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774]">
                                  {act.activity_type}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#787774] mt-0.5">{act.description}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-[#37352F] text-xs">+{act.points} pts</span>
                              <span className="block text-[10px] text-[#9B9A97]">{act.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
