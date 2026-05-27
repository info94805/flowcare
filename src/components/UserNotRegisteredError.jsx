import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const UserNotRegisteredError = () => {
  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome to FlowCare</h1>
          <p className="text-muted-foreground mb-6 font-body">
            Your account hasn't been set up yet. Please contact support to get started.
          </p>
          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground mb-6 text-left">
            <p className="font-semibold mb-2">Need help?</p>
            <p>Email us at <span className="font-mono text-foreground">support@flowcare.in</span></p>
          </div>
          <Button onClick={handleLogout} className="w-full rounded-xl font-heading font-semibold">
            Try Again with Another Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;