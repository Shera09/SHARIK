/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Lock,
  Unlock,
  ShieldAlert,
  Activity,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SecurityOverviewPage() {
  const { user } = useAuth();
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartMfaSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user?.email || 'admin@sharik.io' }),
      });
      const data = await res.json();
      if (res.ok && data.mfa_setup) {
        setMfaSetupData(data.mfa_setup);
        setBackupCodes(data.backup_codes || []);
        toast.success('Generated TOTP QR Code & Secret');
      } else {
        toast.error(data.error || 'Failed to start MFA setup');
      }
    } catch {
      toast.error('Network error during MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit TOTP code');
      return;
    }

    try {
      const res = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: mfaSetupData?.secret, code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsMfaEnabled(true);
        toast.success('Multi-Factor Authentication enabled successfully!');
      } else {
        toast.error(data.error || 'MFA Code Verification Failed');
      }
    } catch {
      toast.error('Network error verifying code');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            Enterprise Security Dashboard & MFA Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure Multi-Factor Authentication (TOTP), view security scores, and manage organization security policies.
          </p>
        </div>
        <Badge className={isMfaEnabled ? 'bg-green-500/20 text-green-400 text-sm px-3 py-1' : 'bg-yellow-500/20 text-yellow-400 text-sm px-3 py-1'}>
          {isMfaEnabled ? 'MFA PROTECTED' : 'MFA NOT ENROLLED'}
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Security Rating</CardDescription>
            <CardTitle className="text-2xl text-teal-400 flex items-center gap-2">
              95 / 100 <CheckCircle className="w-5 h-5 text-teal-400" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Password Policy</CardDescription>
            <CardTitle className="text-2xl text-white">Min 12 Chars</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Concurrent Sessions</CardDescription>
            <CardTitle className="text-2xl text-white">Max 3 Active</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Risk Anomaly Detection</CardDescription>
            <CardTitle className="text-2xl text-green-400 flex items-center gap-2">
              ACTIVE <ShieldAlert className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* MFA Wizard Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-400" /> Multi-Factor Authentication (RFC6238 TOTP)
          </CardTitle>
          <CardDescription>Secure your account with Google Authenticator, Authy, or 1Password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isMfaEnabled && !mfaSetupData && (
            <Button onClick={handleStartMfaSetup} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
              <QrCode className="w-4 h-4" /> Setup Authenticator App
            </Button>
          )}

          {mfaSetupData && !isMfaEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-2">1. Scan QR Code using your Authenticator App:</p>
                <img src={mfaSetupData.qr_code_data} alt="TOTP QR Code" className="w-44 h-44 rounded-lg border border-slate-700 p-2 bg-white" />
                <p className="text-[11px] font-mono text-slate-400 mt-2">Secret: {mfaSetupData.secret}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400">2. Enter the 6-digit code from your app:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-36 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-lg"
                  />
                  <Button onClick={handleVerifyCode} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Verify & Enable
                  </Button>
                </div>

                {backupCodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs font-semibold text-teal-300 mb-2 flex items-center gap-1">
                      <KeyRound className="w-4 h-4" /> Emergency Backup Recovery Codes (Save Securely):
                    </p>
                    <div className="grid grid-cols-2 gap-1 font-mono text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {backupCodes.map((code, idx) => (
                        <span key={idx}>{code}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMfaEnabled && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-white text-sm">Multi-Factor Authentication is Active</p>
                  <p className="text-xs text-slate-400">Your account is protected with TOTP Authenticator verification.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsMfaEnabled(false)} className="text-red-400 hover:text-red-300">
                Disable MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
