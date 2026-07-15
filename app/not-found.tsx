'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex items-center justify-center">
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent/10 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10rem] sm:text-[12rem] font-bold text-muted/20 select-none leading-none"
            >
              404
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <FileQuestion className="h-12 w-12 text-primary" />
              </div>
            </motion.div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Oops! The page you are looking for does not exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="gap-2 rounded-xl w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 rounded-xl w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Try:</span>
            <Link href="/services" className="text-primary hover:underline">Services</Link>
            <span>or</span>
            <Link href="/pricing" className="text-primary hover:underline">Pricing</Link>
            <span>or</span>
            <Link href="/contact" className="text-primary hover:underline">Contact</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
