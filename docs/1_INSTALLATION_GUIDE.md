# Installation Guide - Sharik CRM SaaS Platform

## System Requirements
- Node.js: >= 18.17.0 (LTS recommended)
- Package Manager: npm (>= 9.0.0)
- Database: Supabase PostgreSQL (>= 15.0)
- OS: Windows, macOS, Linux

## Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-org/sharik-crm.git
cd sharik-crm
npm install
```

## Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Meta WhatsApp, Resend, and Razorpay API keys.

## Step 3: Run Database Migrations
Apply Supabase migrations in chronological order:
```bash
npx supabase db push
```

## Step 4: Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
