'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Settings,
  Palette,
  Globe,
  LogOut,
  ChevronDown,
  Check,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

export function UserDropdown() {
  const { user, profile, signOut, updateProfile, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  if (!user) return null;

  const currentTheme = profile?.theme || 'system';
  const currentLocale = profile?.locale || 'en';

  const handleThemeChange = async (theme: string) => {
    await updateProfile({ theme: theme as 'light' | 'dark' | 'system' });
    setShowThemeMenu(false);
  };

  const handleLanguageChange = async (locale: string) => {
    await updateProfile({ locale });
    setShowLanguageMenu(false);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  const roleLabel = hasRole('super_admin')
    ? 'Super Admin'
    : hasRole('owner')
    ? 'Owner'
    : hasRole('admin')
    ? 'Admin'
    : hasRole('manager')
    ? 'Manager'
    : 'Member';

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-medium">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-tight">{profile?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground hidden md:block transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setShowThemeMenu(false);
                setShowLanguageMenu(false);
              }}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* User info header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-lg font-medium">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <MenuLink href="/settings/profile" icon={User} label="Profile" onClick={() => setIsOpen(false)} />
                <MenuLink href="/settings/company" icon={Building2} label="Company" onClick={() => setIsOpen(false)} />
                <MenuLink href="/settings/notifications" icon={Bell} label="Notifications" onClick={() => setIsOpen(false)} />
                <MenuLink href="/settings/security" icon={Shield} label="Security" onClick={() => setIsOpen(false)} />
                <MenuLink href="/settings/sessions" icon={Key} label="Sessions" onClick={() => setIsOpen(false)} />
                <MenuLink href="/settings" icon={Settings} label="Settings" onClick={() => setIsOpen(false)} />
              </div>

              {/* Theme submenu */}
              <div className="border-t border-border">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors rounded-lg mx-2 mt-1"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span>Theme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">{currentTheme}</span>
                    <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', showThemeMenu && 'rotate-180')} />
                  </div>
                </button>
                <AnimatePresence>
                  {showThemeMenu && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      {themes.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handleThemeChange(theme.value)}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <theme.icon className="w-4 h-4 text-muted-foreground" />
                            <span>{theme.label}</span>
                          </div>
                          {currentTheme === theme.value && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language submenu */}
              <div className="border-t border-border">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors rounded-lg mx-2"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>Language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {languages.find(l => l.value === currentLocale)?.label || 'English'}
                    </span>
                    <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', showLanguageMenu && 'rotate-180')} />
                  </div>
                </button>
                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => handleLanguageChange(lang.value)}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                          <span>{lang.label}</span>
                          {currentLocale === lang.value && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Help & Logout */}
              <div className="border-t border-border p-2">
                <MenuLink href="/help" icon={HelpCircle} label="Help & Support" onClick={() => setIsOpen(false)} />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-border bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">WebHoster AI Business OS v2.0.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors rounded-lg"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span>{label}</span>
    </a>
  );
}
