# 🌐 Custom Domain Configuration Guide
## Domain: https://gtsalpha.in.th

---

## ✅ Configuration Checklist

### 1️⃣ **Supabase Authentication Configuration**

#### A. Update Site URL Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

```
Site URL: https://gtsalpha.in.th
```

#### B. Configure Redirect URLs
Add these **Authorized Redirect URLs** (one per line):

```
https://gtsalpha.in.th/auth/callback
https://gtsalpha.in.th/signup-confirmation
https://gtsalpha.in.th/authentication
https://gtsalpha.in.th/**
```

**Important Notes:**
- The `/**` wildcard allows authentication from any route in your app
- Each URL must be added as a separate entry
- URLs are case-sensitive

#### C. Email Template Configuration
Update email templates to use your custom domain:

1. Navigate to **Authentication** → **Email Templates**
2. Update each template (Confirm signup, Invite user, Magic Link, etc.):
   - Replace `{{ .ConfirmationURL }}` base URL with `https://gtsalpha.in.th`
   - Example: `https://gtsalpha.in.th/auth/confirm?token={{ .Token }}`

---

### 2️⃣ **OAuth Provider Configuration (If Using Google/Facebook/etc.)**

#### For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Update **Authorized redirect URIs**:

```
https://gtsalpha.in.th/auth/callback
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

6. Update **Authorized JavaScript origins**:

```
https://gtsalpha.in.th
```

#### For Other OAuth Providers:
Follow similar steps for each provider:
- GitHub: Repository Settings → Developer settings → OAuth Apps
- Facebook: Facebook Developers → Your App → Settings → Basic
- Twitter: Developer Portal → Your App → Settings

---

### 3️⃣ **Next.js Deployment Configuration**

#### A. Vercel Deployment (Recommended)
If deploying to Vercel:

1. **Add Custom Domain:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Domains**
   - Add `gtsalpha.in.th`
   - Add `www.gtsalpha.in.th` (if needed)

2. **Configure DNS Records:**
   Add these DNS records at your domain registrar:

   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: Auto

   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Wait 24-48 hours for DNS propagation
   - Verify HTTPS is working: https://gtsalpha.in.th

#### B. Other Hosting Providers
For other platforms, ensure:
- Domain points to your hosting provider
- SSL certificate is configured for HTTPS
- Environment variables are properly set

---

### 4️⃣ **Environment Variables Verification**

Verify your `.env` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI Services (Optional)
GEMINI_API_KEY=your-gemini-key-here
OPENAI_API_KEY=your-openai-key-here

# Other Services (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id-here
```

**Important:** 
- Never commit `.env` to git
- Set these as environment variables in your hosting platform
- For Vercel: **Settings** → **Environment Variables**

---

### 5️⃣ **Next.js Configuration Update**

No changes needed to `next.config.mjs` - your current configuration already supports custom domains.

The existing redirect from `/` to `/supply-chain-overview` will work automatically on your custom domain.

---

### 6️⃣ **Testing Your Configuration**

#### A. Test Authentication Flow
1. Visit: https://gtsalpha.in.th/authentication
2. Try signing up/logging in
3. Verify email confirmation links work
4. Check OAuth login (if configured)

#### B. Test API Connections
1. Open browser DevTools (F12)
2. Navigate to **Network** tab
3. Visit any page with Supabase data
4. Verify API calls succeed (Status 200)
5. Check for CORS errors (should be none)

#### C. Verify All Routes
Test these key routes:
- ✅ https://gtsalpha.in.th/supply-chain-overview
- ✅ https://gtsalpha.in.th/authentication
- ✅ https://gtsalpha.in.th/admin-dashboard
- ✅ https://gtsalpha.in.th/real-time-tracking
- ✅ https://gtsalpha.in.th/performance-analytics

---

### 7️⃣ **Security Best Practices**

#### A. Row Level Security (RLS)
Your Supabase tables already have RLS policies enabled. Verify they work correctly with:

```sql
-- Test in Supabase SQL Editor
SELECT * FROM user_profiles WHERE id = auth.uid();
SELECT * FROM vehicles WHERE is_available = true;
```

#### B. CORS Configuration
Supabase automatically handles CORS for your domain. No additional configuration needed.

#### C. Rate Limiting
Monitor your Supabase dashboard for:
- API request usage
- Database connections
- Storage bandwidth

---

### 8️⃣ **Troubleshooting Common Issues**

#### Issue: "Invalid Redirect URL" Error
**Solution:**
1. Double-check redirect URLs in Supabase Dashboard
2. Ensure URLs match exactly (including `https://`)
3. Wait 5-10 minutes for changes to propagate

#### Issue: OAuth Login Fails
**Solution:**
1. Verify OAuth provider redirect URIs
2. Check that both Supabase callback URL and your domain are added
3. Clear browser cache and cookies

#### Issue: DNS Not Resolving
**Solution:**
1. Verify DNS records at your registrar
2. Use [DNS Checker](https://dnschecker.org) to verify propagation
3. Wait up to 48 hours for full global propagation

#### Issue: SSL Certificate Error
**Solution:**
1. Ensure HTTPS is configured on your hosting platform
2. For Vercel: Certificate auto-provisions after domain verification
3. Check certificate status in hosting dashboard

---

## 📝 Post-Deployment Checklist

After completing all steps above:

- [ ] Supabase Site URL updated to `https://gtsalpha.in.th`
- [ ] All redirect URLs added in Supabase
- [ ] OAuth providers updated (if applicable)
- [ ] DNS records configured
- [ ] SSL certificate active (HTTPS working)
- [ ] Environment variables set in hosting platform
- [ ] Authentication flow tested
- [ ] All routes accessible
- [ ] No console errors in browser
- [ ] API calls working correctly
- [ ] Email links use custom domain

---

## 🚀 Your Application is Ready!

Your supply chain management system is now configured for **https://gtsalpha.in.th**

### Key Features Available:
- ✅ Real-time supply chain tracking
- ✅ Performance analytics dashboard
- ✅ Admin management system
- ✅ Team collaboration hub
- ✅ AI assistant integration
- ✅ Vehicle fleet management
- ✅ Secure authentication with Supabase

### Next Steps:
1. Share the domain with your team
2. Monitor Supabase dashboard for usage
3. Set up monitoring/analytics (Google Analytics recommended)
4. Configure backups if not already done

---

## 🆘 Need Help?

- **Supabase Support:** https://supabase.com/docs
- **Vercel Support:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Last Updated:** January 6, 2026
**Domain:** gtsalpha.in.th
**Status:** ✅ Ready for Production