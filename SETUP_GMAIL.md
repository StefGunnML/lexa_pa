# Gmail Direct OAuth Setup Guide

This guide will walk you through setting up direct Gmail integration (no Nango required).

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Gmail API:
   - Go to **APIs & Services > Library**
   - Search for "Gmail API"
   - Click **Enable**

## Step 2: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **Project Compass**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
4. Add Scopes:
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Click **Update** and **Save and Continue**
5. Add Test Users (for development):
   - Click **Add Users**
   - Add your Gmail address
   - Click **Save and Continue**
6. Go back to **Credentials** and create OAuth client ID:
   - Application type: **Web application**
   - Name: **Project Compass Gmail**
   - Authorized redirect URIs:
     - For production: `https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback`
     - For local: `http://127.0.0.1:8000/auth/gmail/callback`
   - Click **Create**
7. Copy your **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Add these to your DigitalOcean App Platform environment variables (Backend):

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback
FRONTEND_URL=https://lexa-pa-2rwqf.ondigitalocean.app
```

## Step 4: Deploy and Test

1. Push code to DigitalOcean
2. Wait for deployment to complete
3. Go to **Settings** in Project Compass
4. Click **Connect Gmail**
5. Authorize the app
6. You'll be redirected back to Settings with a success message
7. Go to **Staging Area** and click **Sync Gmail Now**
8. Your emails will appear in the Staging Area!

## Step 5: (Optional) Publish Your App

When you're ready for production:
1. Go to Google Cloud Console > OAuth consent screen
2. Click **Publish App**
3. Submit for verification (takes ~1-2 weeks)
4. Once verified, any Gmail user can connect

## Troubleshooting

### "This app is blocked"
- Make sure you added your email as a Test User
- Click "Advanced > Go to Project Compass (unsafe)"

### "redirect_uri_mismatch"
- Verify your redirect URI in Google Cloud Console matches exactly:
  `https://lexa-pa-api-l5lm3.ondigitalocean.app/auth/gmail/callback`

### No emails syncing
- Check backend logs in DigitalOcean
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Make sure Gmail API is enabled in Google Cloud Console

## What This Does

1. User clicks "Connect Gmail" in Settings
2. Backend generates Google OAuth URL
3. User authorizes Project Compass to read their Gmail
4. Google redirects back with authorization code
5. Backend exchanges code for access token + refresh token
6. Tokens are stored securely in PostgreSQL
7. When user clicks "Sync Gmail Now", backend:
   - Fetches latest 50 emails from Gmail API
   - Processes each email through the Compass Agent
   - Generates summaries and action items
   - Displays in Staging Area

**No more Nango. No more complexity. Just clean, direct OAuth.**

