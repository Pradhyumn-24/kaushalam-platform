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
        return 'bg-[#F6F3F9] text-[#6941C6] border-[#E4DCF5]';
      case 'Workshop':
        return 'bg-[#EDF3EC] text-[#2B6E38] border-[#D3E5D2]';
      case 'Academic':
        return 'bg-[#FAF3DD] text-[#8F6B00] border-[#F3E7BE]';
      case 'Cultural':
        return 'bg-[#FAF1F5] text-[#C13875] border-[#F7D8E7]';
      default:
        return 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7]';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <Bell className="w-3.5 h-3.5 text-[#37352F]" />
          <span>Official Campus Circulars & Events</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352F]">Announcements & Campus Events</h1>
        <p className="text-xs text-[#787774] max-w-2xl leading-relaxed">
          Stay informed about upcoming national hackathons, peer skill workshops, faculty seminars, and campus society recruitment drives.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-3 flex flex-wrap items-center gap-1.5 text-xs shadow-xs">
        <span className="text-[#787774] font-medium mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#9B9A97]" />
          Category Filter:
        </span>
        {['All', 'Hackathon', 'Workshop', 'Academic', 'Cultural', 'Sports', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              category === cat
                ? 'bg-[#2F2E2A] text-white border-[#2F2E2A]'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:bg-[#EAE9E6] hover:text-[#37352F]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-16 text-[#787774] text-xs">
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-10 text-center text-xs text-[#787774]">
          <Bell className="w-8 h-8 text-[#9B9A97] mx-auto mb-2" />
          <p className="text-sm text-[#37352F] font-semibold">No announcements in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E9E9E7] rounded-lg p-5 shadow-xs hover:border-[#D3D1CB] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded border ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-[#9B9A97] text-[11px]">
                      Published: {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#37352F]">{item.title}</h3>
                </div>

                {item.registration_url && item.registration_url !== '#' && (
                  <a
                    href={item.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white text-xs font-medium shrink-0 transition-colors"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <p className="text-xs text-[#787774] leading-relaxed mb-3">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-[#E9E9E7] text-[11px] text-[#787774]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-[#9B9A97]" />
                  <span>Organizer: <strong className="text-[#37352F]">{item.organizer}</strong></span>
                </div>
                {item.event_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#9B9A97]" />
                    <span>Event Date: <strong className="text-[#37352F]">{item.event_date}</strong></span>
                  </div>
                )}
                {item.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#9B9A97]" />
                    <span>Venue: <strong className="text-[#37352F]">{item.venue}</strong></span>
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
