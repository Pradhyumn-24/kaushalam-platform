import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Announcement } from '../types';
import {
  Bell,
  Calendar,
  MapPin,
  ExternalLink,
  Filter,
  Sparkles,
  Tag,
  Building
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAnnouncements(category !== 'All' ? category : undefined);
      setAnnouncements(res.announcements);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hackathon':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'Workshop':
        return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'Academic':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Cultural':
        return 'bg-pink-950 text-pink-300 border-pink-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Official Campus Circulars & Events</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Announcements & Campus Events</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Stay informed about upcoming national hackathons, peer skill workshops, faculty seminars, and campus society recruitment drives.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          Category Filter:
        </span>
        {['All', 'Hackathon', 'Workshop', 'Academic', 'Cultural', 'Sports', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              category === cat
                ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading announcements from SQLite database...
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No announcements in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Published: {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>

                {item.registration_url && item.registration_url !== '#' && (
                  <a
                    href={item.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shrink-0 transition-colors"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-400" />
                  <span>Organizer: <strong className="text-slate-300">{item.organizer}</strong></span>
                </div>
                {item.event_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Event Date: <strong className="text-slate-300">{item.event_date}</strong></span>
                  </div>
                )}
                {item.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Venue: <strong className="text-slate-300">{item.venue}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
