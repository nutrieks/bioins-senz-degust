import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bug, RefreshCw, LogOut, Trash2, Home } from 'lucide-react';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  if (!import.meta.env.DEV) return null;

  const clearCache = () => {
    queryClient.clear();
    console.log('🔄 Cache cleared');
  };

  const clearStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      console.log('🧹 Storage cleared');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  };

  const forceLogout = async () => {
    try {
      clearStorage();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/login';
    } catch (e) {
      console.error('Force logout failed:', e);
      window.location.reload();
    }
  };

  const goToDashboard = () => {
    window.location.href = '/login';
  };

  const reloadApp = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-background border-2 shadow-lg"
        >
          <Bug className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Panel
            </span>
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={clearCache}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              onClick={clearStorage}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Storage
            </Button>
            <Button
              onClick={forceLogout}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Force Logout
            </Button>
            <Button
              onClick={goToDashboard}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Home className="h-3 w-3 mr-1" />
              Go Home
            </Button>
          </div>
          <Button
            onClick={reloadApp}
            size="sm"
            className="w-full text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};