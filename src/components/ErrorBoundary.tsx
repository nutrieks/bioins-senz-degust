
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to console for debugging
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Clear potentially corrupted auth state
    this.clearCorruptedState();
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  clearCorruptedState = () => {
    try {
      // Clear potentially corrupted storage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage
      const sessionKeys = Object.keys(sessionStorage || {});
      sessionKeys.forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  };

  handleReload = () => {
    this.clearCorruptedState();
    window.location.reload();
  };

  handleReset = () => {
    this.clearCorruptedState();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoToDashboard = async () => {
    try {
      this.clearCorruptedState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/login';
    } catch (e) {
      console.warn('Failed to sign out, redirecting anyway:', e);
      window.location.href = '/login';
    }
  };

  handleRestartApp = () => {
    // NUCLEAR OPTION: Complete app restart
    this.clearCorruptedState();
    // Clear all query cache
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear all storage:', e);
    }
    // Force full page reload
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Dogodila se neočekivana greška</CardTitle>
              <CardDescription>
                Aplikacija je naišla na problem i nije se mogla učitati ispravno.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRestartApp} className="w-full bg-red-600 hover:bg-red-700">
                  <Home className="mr-2 h-4 w-4" />
                  RESTART APLIKACIJE
                </Button>
                <Button onClick={this.handleGoToDashboard} variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Vrati se na prijavu
                </Button>
                <div className="flex gap-2">
                  <Button onClick={this.handleReload} variant="outline" className="flex-1">
                    Osvježi stranicu
                  </Button>
                  <Button onClick={this.handleReset} variant="outline" className="flex-1">
                    Pokušaj ponovno
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
