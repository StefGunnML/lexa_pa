# 🚀 Quick Start: Get Gmail Working in 10 Minutes

## What I Just Built

✅ **Direct Gmail OAuth** - No Nango, no complexity
✅ **Secure token storage** - Encrypted in your PostgreSQL database
✅ **Auto-refresh** - Tokens refresh automatically when they expire
✅ **Simple UI** - One button to connect, one button to sync

## What You Need To Do (5 steps)

### Step 1: Google Cloud Console (3 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project (or use existing)
3. Enable **Gmail API**:
   - APIs & Services > Library
   - Search "Gmail API" > Enable
4. Create **OAuth Client ID**:
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Configure consent screen if needed (External, add your email as test user)
   - Application type: **Web application**
   - Authorized redirect URIs: `https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback`
   - Copy **Client ID** and **Client Secret**

### Step 2: DigitalOcean Environment Variables (1 minute)

Add these to your **Backend** app in DigitalOcean:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback
FRONTEND_URL=https://lexa-pa-2rwqf.ondigitalocean.app
```

### Step 3: Deploy (automatic)

DigitalOcean will auto-deploy from `develop` branch. Wait ~5 minutes.

### Step 4: Connect Gmail (1 minute)

1. Go to **Settings** in Project Compass
2. Click **Connect Gmail**
3. Authorize the app (you may need to click "Advanced > Go to Project Compass (unsafe)" since it's in testing mode)
4. You'll be redirected back to Settings with "✅ Gmail connected successfully!"

### Step 5: Sync Emails (instant)

1. Go to **Staging Area**
2. Click **SYNC_GMAIL_NOW**
3. Your emails will appear immediately!

## How It Works (No More Nango!)

```
User clicks "Connect Gmail"
        ↓
Backend generates Google OAuth URL
        ↓
Google OAuth consent screen
        ↓
User authorizes
        ↓
Google redirects back with code
        ↓
Backend exchanges code for tokens
        ↓
Tokens stored in PostgreSQL
        ↓
User clicks "Sync Gmail Now"
        ↓
Backend fetches latest 50 emails from Gmail API
        ↓
Agent processes each email
        ↓
Actions appear in Staging Area
```

## Troubleshooting

### "This app is blocked"
- Add your email as a Test User in Google Cloud Console
- OR click "Advanced > Go to Project Compass (unsafe)"

### "redirect_uri_mismatch"
- Double-check your redirect URI is exactly:
  `https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback`

### "Gmail sync failed"
- Check backend logs in DigitalOcean for errors
- Verify environment variables are set correctly

## What's Next?

Once this works, we can:
- Add **automatic background syncing** (every hour)
- Add **Slack** (same pattern, direct OAuth)
- Add **Calendar** (Google Calendar API)

**No more fighting with Nango. This is how it should have been from the start.**

