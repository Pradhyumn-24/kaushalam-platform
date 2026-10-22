import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, ArrowLeft, CheckCircle, Lock, Mail, User, GraduationCap, Building } from 'lucide-react';
import { ImageUploadPicker } from '../components/ImageUploadPicker';

interface LearnerRegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onGoBack: () => void;
}

export const LearnerRegisterPage: React.FC<LearnerRegisterPageProps> = ({ onSuccess, onGoToLogin, onGoBack }) => {
  const { registerLearner } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('KIET Group of Institutions');
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(2);
  const [studentId, setStudentId] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !college.trim() || !course.trim() || !branch.trim()) {
      setError('Please fill in all required fields marked with *');
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
      const parsedSkills = skillsWanted
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await registerLearner({
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
        skills_wanted: parsedSkills,
        avatar_url: avatarUrl.trim() || undefined
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Learner registration failed.');
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
          <div className="text-3xl select-none">📚</div>
          <div>
            <h2 className="text-xl font-bold text-[#37352F]">Register as a Student Learner</h2>
            <p className="text-xs text-[#787774] mt-0.5">
              Connect with senior peer mentors, book 1-on-1 sessions, and achieve your learning goals.
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
                <span>College Email Address</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., student.name@kiet.edu"
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
                placeholder="E.g., KIET Group of Institutions"
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
                placeholder="E.g., 2300970100012"
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* Course, Branch & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#787774]" />
                <span>Course</span> <span className="text-rose-500">*</span>
              </label>
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
                <option value="MBA">MBA</option>
              </select>
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">
                Branch / Specialization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="E.g., Computer Science"
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1">
                Current Year of Study <span className="text-rose-500">*</span>
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
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

          {/* Skills wanted */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Skills You Want to Learn (Comma-separated, Optional)
            </label>
            <input
              type="text"
              value={skillsWanted}
              onChange={(e) => setSkillsWanted(e.target.value)}
              placeholder="E.g., Data Structures, React, Python, Public Speaking"
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell mentors a little about your academic interests and projects..."
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          {/* Profile Photo / Avatar Picker */}
          <ImageUploadPicker
            value={avatarUrl}
            onChange={setAvatarUrl}
            accentColor="teal"
            label="Learner Profile Picture / Avatar"
            helperText="Upload your campus photo, select a student preset, or paste a direct image URL"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Learner Account...' : 'Complete Learner Registration'}
            </button>
          </div>

          <div className="text-center pt-2 text-[#787774]">
            Already have an account?{' '}
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
