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
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-md shadow-amber-500/10">
          🥇 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-400/20 border border-slate-400/50 flex items-center justify-center text-slate-300 font-extrabold text-sm">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700/20 border border-amber-700/50 flex items-center justify-center text-amber-600 font-extrabold text-sm">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Campus Engagement & Activity Index</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Club Activity Leaderboard</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Transparent campus rankings based on verified student workshops conducted, hackathon attendance, peer teaching circles, and inter-collegiate achievements.
        </p>
      </div>

      {/* Transparent Scoring Criteria Explanation Banner (Section 13) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Info className="w-4 h-4 text-teal-400" />
          <span>Documented Point Calculation Model</span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Scores are aggregated exclusively from verified database activity records:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-teal-400 font-bold block">+30 pts</span>
            <span className="text-[11px] text-slate-400">Flagship Campus Event</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-amber-400 font-bold block">+25 pts</span>
            <span className="text-[11px] text-slate-400">Peer Skill Bootcamp</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-emerald-400 font-bold block">+10 pts / 10 att</span>
            <span className="text-[11px] text-slate-400">Student Attendance</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-purple-400 font-bold block">+50 pts</span>
            <span className="text-[11px] text-slate-400">National Competition</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          Category Filter:
        </span>
        {['All', 'Technical', 'Entrepreneurship', 'Public Speaking', 'Creative Arts', 'Cultural', 'Sports'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              category === cat
                ? 'bg-amber-600 text-slate-950 font-bold border-amber-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading rankings and verified activities from SQLite database...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No club records in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((club) => {
            const isExpanded = expandedClubId === club.id;
            return (
              <div
                key={club.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedClubId(isExpanded ? null : club.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getRankBadge(club.rank)}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-base">{club.name}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                          {club.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Coordinator: {club.coordinator_name} · {club.member_count} student members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-amber-400">{club.score}</div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Activity Points
                      </span>
                    </div>

                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Activity Points Breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>Verified Contributing Activities:</span>
                      <span className="text-[11px] text-slate-500">Documented Campus Audits</span>
                    </div>

                    {(!club.activities || club.activities.length === 0) ? (
                      <p className="text-slate-500 italic">No activity entries recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {club.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">{act.activity_name}</span>
                                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-teal-300">
                                  {act.activity_type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-amber-400 text-xs">+{act.points} pts</span>
                              <span className="block text-[10px] text-slate-500">{act.date}</span>
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
