import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleSignIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await googleSignIn();
      // Navigation will be handled by the useEffect when user state changes
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ShoppingCart className="h-12 w-12 text-lavender-400" />
            <span className="text-4xl font-bold bg-gradient-to-r from-lavender-400 to-lavender-600 bg-clip-text text-transparent">
              ThrifCart
            </span>
          </div>
          <p className="text-gray-400 text-lg">Smart Comparison Platform</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6">Sign in to your account</p>
          {error && (
            <div className="mb-4 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-lavender-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-lavender-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
