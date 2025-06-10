
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login');
      return;
    }

    if (code && state) {
      handleAuthCallback(code, state)
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          console.error('Auth callback failed:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, handleAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Building className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Completing Sign In</h2>
          <p className="text-gray-600">Please wait while we process your authentication...</p>
        </CardContent>
      </Card>
    </div>
  );
};
