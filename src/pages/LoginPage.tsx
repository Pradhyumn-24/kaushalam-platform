import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, ArrowLeft, Lock, Mail, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (role: string) => void;
  onGoToRegisterLearner: () => void;
  onGoToRegisterTeacher: () => void;
  onGoBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoToRegisterLearner,
  onGoToRegisterTeacher,
  onGoBack
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your registered college email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      onSuccess(user.role);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-10 animate-fadeIn">
      <button
        onClick={onGoBack}
        className="flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#37352F] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-9 h-9 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] flex items-center justify-center text-[#37352F] mx-auto mb-3">
            <LogIn className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-[#37352F]">Log in to Kaushalam</h2>
          <p className="text-xs text-[#787774] mt-1">
            Access your campus learning dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#EB5757] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#787774]" />
              <span>Registered College Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@kiet.edu"
              required
              className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#787774]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full bg-white border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <div className="pt-5 mt-5 border-t border-[#E9E9E7] text-center space-y-2 text-xs text-[#787774]">
          <p>Don't have an account yet?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onGoToRegisterLearner}
              className="text-[#37352F] hover:underline font-medium"
            >
              Sign up as Learner
            </button>
            <span className="text-[#D3D1CB]">·</span>
            <button
              onClick={onGoToRegisterTeacher}
              className="text-[#37352F] hover:underline font-medium"
            >
              Sign up as Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
