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
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pt-2">
        <div className="text-4xl select-none mb-1">⚙️</div>
        <h1 className="text-3xl font-bold text-[#37352F]">Setup & Local Execution Guide</h1>
        <p className="text-sm text-[#787774] max-w-2xl leading-relaxed">
          Step-by-step instructions to run the active TypeScript/Node backend or Python environment, run automated tests, and launch the Vite development server.
        </p>
      </div>

      {/* Feature Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Works Immediately (Zero External Setup Required)</span>
          </div>
          <ul className="text-xs text-[#787774] space-y-1.5 list-disc list-inside">
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

        <div className="bg-white border border-[#E9E9E7] rounded-xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>Requires Configurable SMTP Credentials</span>
          </div>
          <p className="text-xs text-[#787774] leading-relaxed">
            Direct inbox email delivery requires setting up Gmail App Password or college SMTP in <code className="text-[#37352F] font-mono">.env</code>.
          </p>
          <div className="text-[11px] text-[#787774] bg-[#FAF9F6] p-2.5 rounded-lg border border-[#E9E9E7] leading-relaxed">
            <strong className="text-[#37352F]">How to get Gmail App Password:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1 text-[#787774]">
              <li>Turn on 2-Step Verification in Google Account.</li>
              <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#37352F] underline font-medium">myaccount.google.com/apppasswords</a>.</li>
              <li>Generate an App Password named "Kaushalam".</li>
              <li>Copy the 16-character code into <code className="text-[#37352F] font-mono">MAIL_PASSWORD</code>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step by Step Execution Instructions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#37352F] flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-[#787774]" />
          <span>Execution Commands</span>
        </h2>

        {steps.map((step, idx) => (
          <div key={idx} className="bg-white border border-[#E9E9E7] rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#37352F] text-sm">{step.title}</h3>
              <button
                onClick={() => copyToClipboard(step.code, idx)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF9F6] hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] text-xs transition-colors border border-[#E9E9E7]"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#787774]">{step.description}</p>

            <div className="bg-[#FAF9F6] rounded-lg p-3.5 border border-[#E9E9E7] font-mono text-xs text-[#37352F] whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {step.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
