import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  CheckCircle,
  ShieldCheck,
  Cpu,
  Mail,
  Database,
  ExternalLink,
  PlayCircle,
  HelpCircle
} from 'lucide-react';

export const SetupInstructionsPage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const steps = [
    {
      title: 'Step 1: Clone or Navigate to the Project Root in PowerShell',
      description: 'Open Windows PowerShell as standard user and navigate to your Kaushalam project folder.',
      code: `cd path\\to\\Kaushalam`
    },
    {
      title: 'Step 2: Create & Activate the Python Virtual Environment',
      description: 'Creates an isolated virtual environment named backend_venv using Python 3.10+ and activates it.',
      code: `# Create virtual environment\npython -m venv backend_venv\n\n# Activate the environment in Windows PowerShell\n.\\backend_venv\\Scripts\\Activate.ps1\n\n# Note: If script execution is restricted on Windows, enable current user scripts once:\n# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
    },
    {
      title: 'Step 3: Install Backend Dependencies',
      description: 'Installs Flask, Flask-SQLAlchemy, Flask-JWT-Extended, bcrypt, python-dotenv, and pytest.',
      code: `pip install -r backend/requirements.txt`
    },
    {
      title: 'Step 4: Configure Backend Environment Variables (.env)',
      description: 'Copy the sample configuration template to create your active .env file.',
      code: `Copy-Item backend\\.env.example backend\\.env\n\n# Inspect and edit backend\\.env using Notepad or VS Code:\nnotepad backend\\.env`
    },
    {
      title: 'Step 5: Initialize & Seed the SQLite Relational Database',
      description: 'Initializes the database schema and populates verified student teachers, college clubs, and campus announcements.',
      code: `python backend/seed.py`
    },
    {
      title: 'Step 6: Run Automated Backend Tests (Pytest)',
      description: 'Executes the automated test suite against an isolated in-memory test database, validating registration, password hashing, role permissions, conflict checks, and workflows.',
      code: `pytest backend/tests/test_auth_and_booking.py -v`
    },
    {
      title: 'Step 7: Start the Flask Backend REST API Server',
      description: 'Launches the Flask application server on port 5000 with CORS and endpoints active.',
      code: `python backend/run.py`
    },
    {
      title: 'Step 8: Start the Frontend Vite Server (In a 2nd PowerShell Window)',
      description: 'Open a second PowerShell window, install npm packages, and launch Vite dev server on port 3000.',
      code: `npm install\nnpm run dev`
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-teal-300 text-xs font-semibold">
          <Terminal className="w-3.5 h-3.5 text-teal-400" />
          <span>Local Development & College Evaluation Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Windows PowerShell Setup & Testing</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Step-by-step instructions to run the Python Flask backend with SQLAlchemy SQLite, run automated tests, configure Gmail SMTP credentials, and launch the Vite frontend.
        </p>
      </div>

      {/* Feature Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Works Immediately (Zero External Setup Required)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Learner & Teacher registration and login</li>
            <li>Bcrypt password hashing and JWT session tokens</li>
            <li>Role-based dashboards & permission guards</li>
            <li>Conflict-free session booking & time slot checks</li>
            <li>Teacher request approvals and rejections</li>
            <li>Completion workflows and 5-star peer reviews</li>
            <li>Clubs directory, join requests, announcements, and leaderboards</li>
            <li>Notification Outbox database queue</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>Requires Configurable SMTP Credentials</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direct inbox email delivery requires setting up Gmail App Password or college SMTP in <code className="text-amber-300">.env</code>.
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
            <strong className="text-slate-200">How to get Gmail App Password:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1 text-slate-400">
              <li>Turn on 2-Step Verification in Google Account.</li>
              <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-teal-400 underline">myaccount.google.com/apppasswords</a>.</li>
              <li>Generate an App Password named "Kaushalam".</li>
              <li>Copy the 16-character code into <code className="text-amber-300">MAIL_PASSWORD</code>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step by Step Execution Instructions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-teal-400" />
          <span>Execution Commands</span>
        </h2>

        {steps.map((step, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm">{step.title}</h3>
              <button
                onClick={() => copyToClipboard(step.code, idx)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400">{step.description}</p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-teal-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {step.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
