'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Building2,
  Sparkles,
  BarChart3,
  Users,
  Wallet,
  TrendingUp,
  Shield,
  Bot,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Floating particle component
function FloatingParticle({ delay, duration, className, style }: { delay: number; duration: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      style={style}
      className={cn('absolute w-2 h-2 rounded-full bg-primary/20', className)}
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: [0, -100, -200],
        x: [0, Math.random() * 50 - 25, 0],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

// Animated metric card
function MetricCard({ label, value, delay, icon: Icon }: { label: string; value: string; delay: number; icon: typeof TrendingUp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-4 min-w-[140px]"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </motion.div>
  );
}

// Animated chart line
function AnimatedChartLine() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <svg viewBox="0 0 300 100" className="w-full h-full">
        <motion.path
          d="M0,80 Q50,70 100,50 T200,30 T300,20"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(var(--primary-rgb), 0.2)" />
            <stop offset="100%" stopColor="rgba(var(--primary-rgb), 1)" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const {
    signIn,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithGitHub,
    signInWithLinkedIn,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err === 'access_denied') {
        setError('OAuth sign in was cancelled or permission denied.');
      } else if (err === 'expired_code') {
        setError('OAuth session expired. Please try signing in again.');
      } else if (err === 'domain_restricted') {
        setError('Your email domain is restricted by tenant security policy.');
      } else if (err === 'invalid_callback') {
        setError('Invalid authentication callback response.');
      } else if (err === 'server_error') {
        setError('Authentication server error. Please try again.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: signInError } = await signIn(email, password, remember);

    if (signInError) {
      setError(signInError.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    const { error: gError } = await signInWithGoogle();
    if (gError) {
      setError(gError.message || 'Failed to initiate Google sign in');
      setIsGoogleLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setError('');
    setIsMicrosoftLoading(true);
    const { error: mError } = await signInWithMicrosoft();
    if (mError) {
      setError(mError.message || 'Failed to initiate Microsoft sign in');
      setIsMicrosoftLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setIsGitHubLoading(true);
    const { error: ghError } = await signInWithGitHub();
    if (ghError) {
      setError(ghError.message || 'Failed to initiate GitHub sign in');
      setIsGitHubLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setError('');
    setIsLinkedInLoading(true);
    const { error: lError } = await signInWithLinkedIn();
    if (lError) {
      setError(lError.message || 'Failed to initiate LinkedIn sign in');
      setIsLinkedInLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
            top: '-10%',
            left: '-10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, transparent 70%)',
            bottom: '-5%',
            right: '10%',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.3}
            duration={3 + Math.random() * 2}
            className="bg-teal-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
            }}
          />
        ))}
      </div>

      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                WebHoster AI
              </h1>
              <p className="text-xs text-slate-400">Business OS</p>
            </div>
          </motion.div>

          {/* Welcome message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">
              Sign in to your intelligent business operating system
            </p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-teal-500 focus:ring-offset-0"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 px-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </motion.button>
            <motion.button
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={isMicrosoftLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 px-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isMicrosoftLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                </svg>
              )}
              Microsoft
            </motion.button>
            <motion.button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={isGitHubLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 px-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isGitHubLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              GitHub
            </motion.button>
            <motion.button
              type="button"
              onClick={handleLinkedInSignIn}
              disabled={isLinkedInLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 px-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLinkedInLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 0 0-1.6 1.6c0 .88.71 1.6 1.6 1.6a1.6 1.6 0 0 0 1.6-1.6c0-.89-.71-1.6-1.6-1.6z" />
                </svg>
              )}
              LinkedIn
            </motion.button>
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Create workspace
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Premium illustration */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          {/* AI Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative w-full max-w-lg"
          >
            {/* Main dashboard card */}
            <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Dashboard header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-slate-500">WebHoster AI Dashboard</div>
              </div>

              {/* Dashboard content */}
              <div className="p-6">
                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <p className="text-slate-400 text-sm">Good morning, Rahul</p>
                  <p className="text-white text-xl font-semibold">Here&apos;s your business at a glance</p>
                </motion.div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Revenue', value: '₹24.5L', icon: Wallet, change: '+12%' },
                    { label: 'Customers', value: '1,245', icon: Users, change: '+8%' },
                    { label: 'AI Tasks', value: '156', icon: Bot, change: '94%' },
                    { label: 'Growth', value: '23%', icon: TrendingUp, change: '+5%' },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="bg-slate-700/30 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <metric.icon className="w-4 h-4 text-teal-400" />
                        <span className="text-xs text-slate-400">{metric.label}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold text-white">{metric.value}</span>
                        <span className="text-xs text-green-400">{metric.change}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="relative h-24 bg-slate-700/30 rounded-xl overflow-hidden">
                  <AnimatedChartLine />
                  <div className="absolute bottom-2 left-2 flex gap-4">
                    <span className="text-xs text-slate-500">Jan</span>
                    <span className="text-xs text-slate-500">Feb</span>
                    <span className="text-xs text-slate-500">Mar</span>
                    <span className="text-xs text-slate-500">Apr</span>
                    <span className="text-xs text-slate-500">May</span>
                    <span className="text-xs text-slate-500">Jun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating metric cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-12 top-20"
            >
              <MetricCard label="AI Agents" value="27 Active" delay={1} icon={Bot} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-8 bottom-24"
            >
              <MetricCard label="Tasks Done" value="1,234" delay={1.2} icon={CheckCircle} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            >
              <MetricCard label="Global Scale" value="15 Countries" delay={1.4} icon={Globe} />
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span className="text-sm">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              <span className="text-sm">Real-time Analytics</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 text-xs text-slate-500">
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        <Link href="/support" className="hover:text-slate-300 transition-colors">Support</Link>
        <span>v2.0.0</span>
      </div>
    </div>
  );
}
