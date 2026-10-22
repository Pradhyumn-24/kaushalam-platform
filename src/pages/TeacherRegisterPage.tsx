import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle, ArrowLeft, Lock, Mail, User, Building, Clock, Plus, X } from 'lucide-react';
import { ImageUploadPicker } from '../components/ImageUploadPicker';

interface TeacherRegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onGoBack: () => void;
}

export const TeacherRegisterPage: React.FC<TeacherRegisterPageProps> = ({ onSuccess, onGoToLogin, onGoBack }) => {
  const { registerTeacher } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('KIET Group of Institutions');
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(3);
  const [studentId, setStudentId] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>(['Data Structures & Algorithms', 'C++']);
  const [newSkill, setNewSkill] = useState('');
  const [category, setCategory] = useState('Technical');
  const [experienceLevel, setExperienceLevel] = useState('Advanced');
  const [availability, setAvailability] = useState('Mon, Wed, Fri: 4:30 PM - 7:00 PM | Sat: 2:00 PM - 6:00 PM');
  const [duration, setDuration] = useState(45);
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
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

    if (!fullName.trim() || !email.trim() || !password || !college.trim() || !branch.trim() || !availability.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    if (skills.length === 0) {
      setError('Please add at least one teaching skill.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await registerTeacher({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        college: college.trim(),
        course: course.trim(),
        branch: branch.trim(),
        year_of_study: Number(yearOfStudy),
        student_id: studentId.trim() || undefined,
        bio: bio.trim() || undefined,
        skills,
        category,
        experience_level: experienceLevel,
        availability: availability.trim(),
        session_duration: Number(duration),
        avatar_url: avatarUrl.trim() || undefined
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Teacher registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <button
        onClick={onGoBack}
        className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Welcome Page</span>
      </button>

      <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E9E9E7]">
          <div className="text-3xl select-none">🎓</div>
          <div>
            <h2 className="text-xl font-bold text-[#37352F]">Register as a Student Teacher</h2>
            <p className="text-xs text-[#787774] mt-0.5">
              Offer your skills, accept peer session requests, and mentor fellow college students.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('already exists') && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="shrink-0 px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded font-medium transition-colors text-[11px]"
              >
                Go to Log In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#787774]" />
                <span>Full Name</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Enter your full name"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#787774]" />
                <span>Registered College Email</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., priya.verma@kiet.edu"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* College and Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#787774]" />
                <span>College / Institution</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">
                Student ID / Enrollment No.
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="E.g., 2100970130088"
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* Course, Branch & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Course <span className="text-rose-500">*</span></label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Branch <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Year of Study <span className="text-rose-500">*</span></label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Skills You Can Teach <span className="text-rose-500">*</span> (Press Enter to add)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="E.g., Dynamic Programming, React.js, Figma, Debating"
                className="flex-1 bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-white hover:bg-[#F7F6F3] text-[#37352F] border border-[#D3D1CB] rounded-md flex items-center gap-1 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] text-[#37352F] text-xs font-medium"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-600 ml-1 text-[#787774]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Skill Category & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Primary Category <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value="Technical">Technical (Coding, Web, ML, Cloud)</option>
                <option value="Creative Arts">Creative Arts (UI/UX, 3D, Design)</option>
                <option value="Academic">Academic (Maths, Physics, Electronics)</option>
                <option value="Public Speaking">Public Speaking & Debating</option>
                <option value="Career Prep">Career Prep (Interviews, Resumes)</option>
                <option value="Languages">Languages & Writing</option>
              </select>
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Proficiency Level <span className="text-rose-500">*</span></label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value="Intermediate">Intermediate (Project experience)</option>
                <option value="Advanced">Advanced (Hackathons, open-source)</option>
                <option value="Expert">Expert (Incoming SDE, National Finalist)</option>
              </select>
            </div>
          </div>

          {/* Availability and Session Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#787774]" />
                <span>Weekly Availability <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="E.g., Mon, Wed: 5-7 PM | Weekends: 10 AM-1 PM"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">Session Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#787774]" />
                <span>Password</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#787774]" />
                <span>Confirm Password</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Short Biography / Teaching Experience
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your relevant course grades, projects, and how you approach teaching peers..."
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          {/* Profile Photo / Avatar Picker */}
          <ImageUploadPicker
            value={avatarUrl}
            onChange={setAvatarUrl}
            accentColor="amber"
            label="Teacher Profile Picture / Avatar"
            helperText="Upload your campus photo, select a mentor preset, or paste a direct image URL"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering Teacher Account...' : 'Complete Teacher Registration'}
            </button>
          </div>

          <div className="text-center pt-2 text-[#787774]">
            Already registered?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-[#37352F] hover:underline font-semibold"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
