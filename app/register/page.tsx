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
  User,
  Phone,
  MapPin,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const percentage = (strength / 6) * 100;
  const label = strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong';
  const color = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500';

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400">Password strength</span>
        <span className={cn(
          strength <= 2 && 'text-red-400',
          strength > 2 && strength <= 4 && 'text-yellow-400',
          strength > 4 && 'text-green-400'
        )}>{label}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

// Validation check component
function ValidationCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {valid ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-slate-500" />
      )}
      <span className={valid ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
    </div>
  );
}

const countries = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'UAE', 'Singapore', 'Japan', 'Other'
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Consulting', 'Marketing', 'Real Estate', 'Other'
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'India',
    state: '',
    city: '',
    gstNumber: '',
    industry: '',
    referralCode: '',
    acceptPrivacy: false,
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.acceptPrivacy || !formData.acceptTerms) {
      setError('Please accept the privacy policy and terms of service');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.ownerName,
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create user account');
        setIsLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          org_name: formData.businessName,
          legal_name: formData.businessName,
          gstin: formData.gstNumber || null,
          is_active: true,
        })
        .select('id')
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        // Continue without organization for now
      }

      // 3. Update user profile with organization
      if (orgData) {
        await supabase
          .from('auth_profiles')
          .upsert({
            id: userId,
            organization_id: orgData.id,
            full_name: formData.ownerName,
            phone: formData.phone,
          });

        // 3.5. Create security user
        await supabase
          .from('security_users')
          .insert({
            id: userId,
            email: formData.email,
            full_name: formData.ownerName,
            phone: formData.phone,
            tenant_id: orgData.id,
            status: 'active',
          });

        // 4. Create user role
        await supabase
          .from('user_role_assignments')
          .insert({
            user_id: userId,
            role_id: null, // Will need to handle roles properly
            tenant_id: orgData.id,
            is_active: true,
          });
      }

      // 5. Redirect to onboarding or dashboard
      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const passwordValidations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const canProceedStep1 = formData.businessName && formData.ownerName && formData.email && formData.phone;
  const canProceedStep2 = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const canProceedStep3 = formData.country && formData.city && formData.acceptPrivacy && formData.acceptTerms;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%)',
            top: '10%',
            right: '-10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              WebHoster AI
            </h1>
            <p className="text-xs text-slate-400">Business OS</p>
          </div>
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {['Account', 'Security', 'Details'].map((label, i) => (
            <div key={label} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span className={cn(
                'ml-2 text-sm hidden sm:block',
                step >= i + 1 ? 'text-slate-300' : 'text-slate-500'
              )}>{label}</span>
              {i < 2 && (
                <div className={cn(
                  'w-12 sm:w-20 h-0.5 mx-2 rounded',
                  step > i + 1 ? 'bg-green-500' : 'bg-slate-700'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <motion.div
          layout
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Create your workspace</h2>
                    <p className="text-sm text-slate-400 mt-1">Tell us about your business</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Business Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Company Ltd"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Owner Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Security */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Secure your account</h2>
                    <p className="text-sm text-slate-400 mt-1">Create a strong password</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Create a strong password"
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
                    <PasswordStrength password={formData.password} />
                  </div>

                  {formData.password && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-700/30 rounded-lg">
                      <ValidationCheck valid={passwordValidations.length} label="8+ characters" />
                      <ValidationCheck valid={passwordValidations.uppercase} label="Uppercase" />
                      <ValidationCheck valid={passwordValidations.lowercase} label="Lowercase" />
                      <ValidationCheck valid={passwordValidations.number} label="Number" />
                      <ValidationCheck valid={passwordValidations.special} label="Special char" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={cn(
                          'w-full pl-11 pr-12 py-3 bg-slate-700/50 border rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-500'
                            : 'border-slate-600'
                        )}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Business details</h2>
                    <p className="text-sm text-slate-400 mt-1">Almost there! Tell us more</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Industry</label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        {industries.map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">State *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">GST Number (Optional)</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="GSTIN-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Referral Code (Optional)</label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="REFERRAL2024"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-slate-400">
                        I accept the <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-slate-400">
                        I accept the <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
                      </span>
                    </label>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all"
                    >
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isLoading || !canProceedStep3}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Workspace
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
