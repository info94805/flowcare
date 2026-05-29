import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeContext';

import Landing from '@/pages/Landing';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Onboarding from '@/pages/Onboarding';
import Calendar from '@/pages/Calendar';
import DailyLogPage from '@/pages/DailyLogPage';
import Learn from '@/pages/Learn';
import Profile from '@/pages/Profile';
import JiaAI from '@/pages/JiaAI';
import Insights from '@/pages/Insights';
import RemindersPage from '@/pages/RemindersPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscribePage from '@/pages/SubscribePage';
import PDFReport from '@/pages/PDFReport';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import TermsPage from '@/pages/legal/TermsPage';
import LegalPage from '@/pages/legal/LegalPage';
import RefundPage from '@/pages/legal/RefundPage';
import SupportPage from '@/pages/legal/SupportPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-heading font-semibold text-muted-foreground">Loading FlowCare...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    // Don't auto-redirect on auth_required — let the landing page handle login
  }

  return (
    <Routes>
      {/* Public routes — no auth required */}
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      {/* Authenticated routes */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/log" element={<DailyLogPage />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/jia" element={<JiaAI />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/report" element={<PDFReport />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;