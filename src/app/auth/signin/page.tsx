'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { signInWithCredentials } from '@/shared/actions/auth-actions';
import { cn } from '@/shared/lib/utils';

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-in form state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign-up form state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithCredentials(siEmail, siPassword);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (suPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Sign up failed.');
        return;
      }
      // Auto sign-in after registration
      await signInWithCredentials(suEmail, suPassword);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            GGH <span className="text-primary">Proposal AI</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {tab === 'signin' ? 'Sign in to your account.' : 'Create a free account.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-100">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={cn(
                  'flex-1 py-3.5 text-sm font-bold transition-colors',
                  tab === t
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="p-8 space-y-4">
            {/* Credentials form */}
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email" className="text-sm font-bold">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    placeholder="you@example.com"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password" className="text-sm font-bold">Password</Label>
                  <div className="relative">
                    <Input
                      id="si-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                      required
                      className="h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs font-bold text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </Button>
                <div className="text-center">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name" className="text-sm font-bold">Name</Label>
                  <Input
                    id="su-name"
                    type="text"
                    placeholder="Your name"
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email" className="text-sm font-bold">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="you@example.com"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password" className="text-sm font-bold">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      required
                      className="h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs font-bold text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium">
          By continuing you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
