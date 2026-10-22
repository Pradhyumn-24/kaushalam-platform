import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { X, Check, AlertCircle, Plus } from 'lucide-react';

interface TeacherProfileModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ user, onClose, onSuccess }) => {
  const profile = user.teacher_profile;
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState<string>('');
  const [category, setCategory] = useState<string>(profile?.category || 'Technical');
  const [experienceLevel, setExperienceLevel] = useState<string>(profile?.experience_level || 'Intermediate');
  const [availability, setAvailability] = useState<string>(profile?.availability || '');
  const [duration, setDuration] = useState<number>(profile?.session_duration || 45);
  const [bio, setBio] = useState<string>(user.bio || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (skills.length === 0) {
      setError('Please list at least one skill you can teach.');
      return;
    }
    if (!availability.trim()) {
      setError('Please provide your availability hours.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.updateTeacherProfile({
        skills,
        category,
        experience_level: experienceLevel,
        availability: availability.trim(),
        session_duration: duration,
        bio: bio.trim()
      });
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-100 mb-1">
          Manage Teacher Profile & Availability
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Update the skills you mentor, your weekly schedule, and session preferences.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Skills Management */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Skills You Can Teach <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="E.g., Graph Algorithms, Docker, Figma"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-lg flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-950/80 border border-teal-800 text-teal-300 text-xs"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-300 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Category & Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Skill Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Technical">Technical</option>
                <option value="Creative Arts">Creative Arts</option>
                <option value="Academic">Academic</option>
                <option value="Public Speaking">Public Speaking</option>
                <option value="Languages">Languages</option>
                <option value="Career Prep">Career Prep</option>
                <option value="Sports/Fitness">Sports/Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Proficiency Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Beginner">Beginner (1-2 years)</option>
                <option value="Intermediate">Intermediate (Project experience)</option>
                <option value="Advanced">Advanced (Internships / Hackathon winners)</option>
                <option value="Expert">Expert (Industry ready / Top ranker)</option>
              </select>
            </div>
          </div>

          {/* Availability string */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Availability Days & Hours <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="E.g., Mon, Wed, Fri: 5:00 PM - 7:30 PM | Weekends: 10:00 AM - 1:00 PM"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Preferred Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-1.5 rounded-lg border text-center font-medium transition-colors ${
                    duration === mins
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Short Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your projects, achievements, internships, and teaching approach..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md shadow-teal-700/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
