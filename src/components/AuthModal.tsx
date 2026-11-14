import React, { useState } from 'react';
import { X, Mail, Lock, Plane, AlertCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-sky-600 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">
              {isSignUp ? 'Create Club Account' : 'Sign in to Motueka Aero Club'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Access aircraft bookings, real-time Flightradar telemetry, and Xero invoicing.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or with Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pilot@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium text-sm shadow transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-sky-600 hover:underline font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
