import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { Sparkles } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();
  const hideJia = location.pathname === '/jia';

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      {!hideJia && (
        <Link
          to="/jia"
          className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="Chat with Jia"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </Link>
      )}
    </div>
  );
}