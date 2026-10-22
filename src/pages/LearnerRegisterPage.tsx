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
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <button
        onClick={onGoBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Welcome Page</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Register as a Student Learner</h2>
            <p className="text-xs text-slate-400 mt-1">
              Connect with senior peer mentors, book 1-on-1 sessions, and achieve your learning goals.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('already exists') && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="shrink-0 px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Log In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Full Name</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Enter your full name"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>College Email Address</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., student.name@kiet.edu"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* College and Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>College / Institution</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="E.g., KIET Group of Institutions"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Student ID / Enrollment No.
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="E.g., 2300970100012"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Course, Branch & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>Course</span> <span className="text-rose-400">*</span>
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
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
              <label className="block text-slate-300 font-medium mb-1">
                Branch / Specialization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="E.g., Computer Science"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Current Year of Study <span className="text-rose-400">*</span>
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Password</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Confirm Password</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Skills wanted */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Skills You Want to Learn (Comma-separated, Optional)
            </label>
            <input
              type="text"
              value={skillsWanted}
              onChange={(e) => setSkillsWanted(e.target.value)}
              placeholder="E.g., Data Structures, React, Python, Public Speaking"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell mentors a little about your academic interests and projects..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-700/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Learner Account...' : 'Complete Learner Registration'}
            </button>
          </div>

          <div className="text-center pt-2 text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-teal-400 hover:underline font-semibold"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
