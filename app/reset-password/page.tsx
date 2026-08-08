'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase sends the recovery token in the URL hash.
    // The Supabase client automatically detects this on load.
    supabase.auth.getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Failed to reset password. The reset link may have expired.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </motion.div>

        <motion.div
          layout
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Password updated</h2>
                  <p className="text-sm text-slate-400 mt-2">
                    Redirecting you to login...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Set new password</h2>
                  <p className="text-sm text-slate-400 mt-2">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="At least 8 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          'w-full pl-11 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-500'
                            : 'border-slate-600'
                        )}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </motion.button>
                </form>

                <Link
                  href="/login"
                  className="block text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Back to login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
