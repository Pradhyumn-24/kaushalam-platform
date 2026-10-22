import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OutboxModal } from './components/OutboxModal';
import { WelcomePage } from './pages/WelcomePage';
import { LearnerRegisterPage } from './pages/LearnerRegisterPage';
import { TeacherRegisterPage } from './pages/TeacherRegisterPage';
import { LoginPage } from './pages/LoginPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeachersDirectoryPage } from './pages/TeachersDirectoryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ClubsPage } from './pages/ClubsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { BookSessionPage } from './pages/BookSessionPage';

function MainApp() {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);

  // If user just logged in or is logged in and on welcome, guide to their respective dashboard
  React.useEffect(() => {
    if (user && activeTab === 'welcome') {
      setActiveTab(user.role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Kaushalam Campus Engine...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'welcome':
        return (
          <WelcomePage
            onSelectAction={(action) => {
              if (action === 'register-learner') setActiveTab('register-learner');
              else if (action === 'register-teacher') setActiveTab('register-teacher');
              else if (action === 'login') setActiveTab('login');
              else if (action === 'teachers') setActiveTab('teachers');
              else if (action === 'clubs') setActiveTab('clubs');
              else if (action === 'book-session') setActiveTab('book-session');
            }}
          />
        );

      case 'register-learner':
        return (
          <LearnerRegisterPage
            onSuccess={() => setActiveTab('learner-dashboard')}
            onGoToLogin={() => setActiveTab('login')}
            onGoBack={() => setActiveTab('welcome')}
          />
        );

      case 'register-teacher':
        return (
          <TeacherRegisterPage
            onSuccess={() => setActiveTab('teacher-dashboard')}
            onGoToLogin={() => setActiveTab('login')}
            onGoBack={() => setActiveTab('welcome')}
          />
        );

      case 'login':
        return (
          <LoginPage
            onSuccess={(userRole) => {
              setActiveTab(userRole === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard');
            }}
            onGoToRegisterLearner={() => setActiveTab('register-learner')}
            onGoToRegisterTeacher={() => setActiveTab('register-teacher')}
            onGoBack={() => setActiveTab('welcome')}
          />
        );

      case 'learner-dashboard':
        if (!user) {
          return (
            <LoginPage
              onSuccess={(userRole) => setActiveTab(userRole === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
              onGoToRegisterLearner={() => setActiveTab('register-learner')}
              onGoToRegisterTeacher={() => setActiveTab('register-teacher')}
              onGoBack={() => setActiveTab('welcome')}
            />
          );
        }
        if (role === 'teacher') {
          return <TeacherDashboard setActiveTab={setActiveTab} openOutbox={() => setIsOutboxOpen(true)} />;
        }
        return <LearnerDashboard setActiveTab={setActiveTab} openOutbox={() => setIsOutboxOpen(true)} />;

      case 'teacher-dashboard':
        if (!user) {
          return (
            <LoginPage
              onSuccess={(userRole) => setActiveTab(userRole === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
              onGoToRegisterLearner={() => setActiveTab('register-learner')}
              onGoToRegisterTeacher={() => setActiveTab('register-teacher')}
              onGoBack={() => setActiveTab('welcome')}
            />
          );
        }
        if (role === 'learner') {
          return <LearnerDashboard setActiveTab={setActiveTab} openOutbox={() => setIsOutboxOpen(true)} />;
        }
        return <TeacherDashboard setActiveTab={setActiveTab} openOutbox={() => setIsOutboxOpen(true)} />;

      case 'book-session':
        return (
          <BookSessionPage
            onGoToDashboard={() => setActiveTab(role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
            onGoToTeachers={() => setActiveTab('teachers')}
          />
        );

      case 'teachers':
        return (
          <TeachersDirectoryPage
            onGoToRegister={() => setActiveTab('welcome')}
            onGoToLogin={() => setActiveTab('login')}
          />
        );

      case 'history':
        if (!user) {
          return (
            <LoginPage
              onSuccess={(userRole) => setActiveTab(userRole === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
              onGoToRegisterLearner={() => setActiveTab('register-learner')}
              onGoToRegisterTeacher={() => setActiveTab('register-teacher')}
              onGoBack={() => setActiveTab('welcome')}
            />
          );
        }
        return <HistoryPage />;

      case 'clubs':
        return <ClubsPage onGoToLogin={() => setActiveTab('login')} />;

      case 'announcements':
        return <AnnouncementsPage />;

      case 'leaderboard':
        return <LeaderboardPage />;

      default:
        return (
          <WelcomePage
            onSelectAction={(action) => {
              if (action === 'register-learner') setActiveTab('register-learner');
              else if (action === 'register-teacher') setActiveTab('register-teacher');
              else if (action === 'login') setActiveTab('login');
              else if (action === 'teachers') setActiveTab('teachers');
              else if (action === 'clubs') setActiveTab('clubs');
              else if (action === 'book-session') setActiveTab('book-session');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openOutbox={() => setIsOutboxOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {renderContent()}
      </main>

      <Footer
        openOutbox={() => setIsOutboxOpen(true)}
        setActiveTab={setActiveTab}
      />

      <OutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
