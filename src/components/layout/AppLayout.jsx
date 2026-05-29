import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideJia = location.pathname === '/jia';

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (!authed) navigate('/');
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full pb-16">
        <Outlet />
      </main>
      <BottomNav />
      {!hideJia && (
        <Link
          to="/jia"
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          title="Chat with Jia"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </Link>
      )}
    </div>
  );
}