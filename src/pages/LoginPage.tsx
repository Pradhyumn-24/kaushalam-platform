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
    <div className="max-w-md mx-auto py-10 animate-fadeIn">
      <button
        onClick={onGoBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Welcome Page</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Log in to Kaushalam</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your personalized Learner or Teacher campus dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>Registered College Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.g., aarav.sharma@kiet.edu"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-slate-800 text-center space-y-2 text-xs text-slate-400">
          <p>Don't have an account yet?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onGoToRegisterLearner}
              className="text-teal-400 hover:underline font-semibold"
            >
              Register as Learner
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={onGoToRegisterTeacher}
              className="text-amber-400 hover:underline font-semibold"
            >
              Register as Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
