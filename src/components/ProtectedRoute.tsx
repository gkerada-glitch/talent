import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Configuration</AlertTitle>
          <AlertDescription>
            Connect Supabase to get started. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/auth/login" />;
  }

  return <>{children}</>;
}
