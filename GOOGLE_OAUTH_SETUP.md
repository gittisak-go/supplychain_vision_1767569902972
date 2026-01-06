# Google OAuth Setup Guide for gtsalpha.in.th

## Overview
This guide helps you configure Google OAuth authentication for your Supabase application with the domain **https://gtsalpha.in.th**.

## Step 1: Configure Google Cloud Console

### 1.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**

### 1.2 Configure OAuth Consent Screen
Before creating credentials, you need to configure the OAuth consent screen:

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (or **Internal** if using Google Workspace)
3. Fill in required information:
   - **App name**: Your application name
   - **User support email**: Your support email
   - **Developer contact information**: Your email
   - **Application home page**: `https://gtsalpha.in.th`
   - **Authorized domains**: Add `gtsalpha.in.th`
4. Add required scopes (minimum):
   - `openid`
   - `email`
   - `profile`

### 1.3 Set Authorized Redirect URIs
Get your Supabase callback URL from your Supabase Dashboard:

1. Go to **Supabase Dashboard** > **Authentication** > **Providers**
2. Find Google provider and copy the **Callback URL** (looks like):
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```

In Google Cloud Console, under **Authorized redirect URIs**, add:
- Your Supabase callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Your local development callback (optional): `http://localhost:3000/auth/callback`

### 1.4 Set Authorized JavaScript Origins
Add these origins:
- `https://gtsalpha.in.th`
- `http://localhost:3000` (for local development)
- Your Supabase project URL: `https://[YOUR-PROJECT-REF].supabase.co`

### 1.5 Get Client ID and Secret
After creating the OAuth client, you'll receive:
- **Client ID**: (starts with something like `123456789-abc.apps.googleusercontent.com`)
- **Client Secret**: (a random string)

## Step 2: Configure Supabase

### 2.1 Enable Google Provider
1. Go to **Supabase Dashboard** > **Authentication** > **Providers**
2. Find **Google** in the list
3. Toggle **Enable Sign in with Google**
4. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. Save changes

### 2.2 Configure Redirect URLs
In Supabase Dashboard > **Authentication** > **URL Configuration**, add:
- **Site URL**: `https://gtsalpha.in.th`
- **Redirect URLs**: 
  - `https://gtsalpha.in.th/auth/callback`
  - `https://gtsalpha.in.th/**` (wildcard for all pages)
  - `http://localhost:3000/**` (for local development)

## Step 3: Update Your Application

### 3.1 Add Google Sign-In Button
Your authentication page should already have the AuthContext set up. Add a Google sign-in button to your login/signup pages:

```tsx
import { supabase } from '@/lib/supabase/client';

const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://gtsalpha.in.th/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) {
    console.error('Google sign-in error:', error.message);
  }
};
```

### 3.2 Create Auth Callback Handler
Create a callback page at `src/app/auth/callback/page.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/authentication?error=auth_callback_failed');
        return;
      }

      if (data?.session) {
        // Successful authentication - redirect to dashboard
        router.push('/supply-chain-overview');
      } else {
        router.push('/authentication');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
```

## Step 4: Publishing Configuration

### 4.1 Verify Domain Settings
For successful publishing, ensure:

1. **DNS Configuration**:
   - Your domain `gtsalpha.in.th` should point to your hosting platform
   - Add proper A or CNAME records

2. **SSL Certificate**:
   - Ensure HTTPS is properly configured
   - Most hosting platforms provide automatic SSL

3. **Environment Variables in Production**:
   Ensure these are set in your production environment:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 4.2 Common Publishing Issues & Solutions

#### Issue 1: Build Errors
**Solution**: Check for:
- TypeScript errors: Run `npm run build` locally first
- Missing dependencies: Verify all packages in package.json are installed
- Environment variables: Ensure all required env vars are set

#### Issue 2: Authentication Redirect Issues
**Solution**:
- Verify all callback URLs are added in both Google and Supabase
- Check that your production domain matches exactly (no trailing slashes)
- Ensure HTTPS is working properly

#### Issue 3: CORS Errors
**Solution**:
- Add your domain to Supabase's allowed origins
- Configure Google OAuth authorized origins correctly
- Check your hosting platform's CORS settings

#### Issue 4: Hydration Errors
**Solution** (if you see hydration mismatches):
- Ensure client-side only code uses `'use client'` directive
- Check that localStorage/sessionStorage is accessed only after mount
- Verify no server-side rendering conflicts with client state

## Step 5: Testing

### 5.1 Local Testing
1. Start your development server: `npm run dev`
2. Test Google sign-in flow
3. Verify callback handling
4. Check user session persistence

### 5.2 Production Testing
1. After deployment, test the full authentication flow
2. Verify redirect URLs work correctly
3. Test on different browsers
4. Check mobile responsiveness

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: Google OAuth redirect URI doesn't match configured URIs
**Solution**: 
- Double-check the callback URL in Google Cloud Console
- Ensure no typos or trailing slashes
- Wait 5-10 minutes after making changes for propagation

### Error: "invalid_client"
**Cause**: Client ID or Secret is incorrect
**Solution**:
- Verify credentials in Supabase match Google Cloud Console
- Regenerate credentials if necessary

### Error: "access_denied"
**Cause**: User denied permission or OAuth consent screen not configured
**Solution**:
- Configure OAuth consent screen properly
- Ensure all required scopes are added
- Check if app is in testing mode (needs test users added)

## Security Best Practices

1. **Never commit credentials**: Keep Client ID and Secret in environment variables
2. **Use HTTPS only**: Never use OAuth with HTTP in production
3. **Validate redirect URLs**: Ensure only your domains are authorized
4. **Monitor authentication logs**: Check Supabase logs regularly
5. **Implement rate limiting**: Protect against brute force attacks

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## Next Steps

After completing Google OAuth setup:
1. ✅ Test authentication flow thoroughly
2. ✅ Implement user profile creation/update on first sign-in
3. ✅ Add loading states and error handling
4. ✅ Configure session management
5. ✅ Set up user roles and permissions