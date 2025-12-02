# Resend Setup Guide for LostLink

This guide will walk you through setting up Resend to enable email notifications for your LostLink application. Resend offers a generous free tier (3,000 emails/month, 100/day) that should be sufficient for this project.

## 1. Create a Resend Account (2 minutes)

1. **Go to the Resend Website:**
   Visit [https://resend.com](https://resend.com) and sign up for a free account.

2. **Verify Your Email:**
   Check your email inbox and click the verification link.

## 2. Get Your API Key

1. **Navigate to API Keys:**
   After logging in, go to **API Keys** in the dashboard.

2. **Create API Key:**
   - Click **Create API Key**
   - Give it a name (e.g., `LostLink_Dev_Key`)
   - Select **Full Access** (or restrict to "Send Email" only)
   - Click **Add**
   - **IMPORTANT:** Copy your API Key immediately. It starts with `re_` and will only be shown once.

## 3. Verify Sender Email

### Option A: Use Test Email (Recommended for Development/Demo)
**No DNS setup needed!**

1. **Use Resend's Test Domain:**
   - Resend provides `onboarding@resend.dev` for testing
   - **No domain verification required** - works immediately
   - Perfect for development, testing, and portfolio demos
   - Set `FROM_EMAIL=onboarding@resend.dev` in your `.env`

### Option B: Verify Your Own Domain (For Production)

**You need to own a domain** (e.g., `lostlink.app`, `yourdomain.com`)

1. **Add Domain in Resend:**
   - Go to **Domains** in Resend dashboard
   - Click **Add Domain**
   - Enter your domain (e.g., `lostlink.app`)

2. **Add DNS Records:**
   Resend will show you DNS records to add. You need to add these to your domain's DNS settings:

   **SPF Record:**
   ```
   Type: TXT
   Name: @ (or your domain)
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM Record:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [Resend will provide this - looks like: p=...]
   ```

   **DMARC Record (Optional but recommended):**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:your-email@yourdomain.com
   ```

3. **Where to Add DNS Records:**
   - **If you own a domain:** Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - **If using free domain:** Freenom, No-IP, etc. (may have limitations)
   - **If using subdomain:** Add records to your DNS provider

4. **Wait for Verification:**
   - DNS propagation can take 5 minutes to 48 hours
   - Resend will verify automatically when DNS records are detected
   - Check status in Resend dashboard → Domains

**Note:** If you don't own a domain, use `onboarding@resend.dev` - it works perfectly for demos!

## 4. Configure Environment Variables

Add your Resend API Key to your `.env` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your-actual-api-key-here
FROM_EMAIL=rackoon1030@gmail.com
```

**Note:** 
- `FROM_EMAIL` can be any email address for testing
- For production, use a verified domain email
- Resend's test domain `onboarding@resend.dev` works without verification

## 5. Update docker-compose.yml

The `docker-compose.yml` already has Resend configuration:

```yaml
- RESEND_API_KEY=${RESEND_API_KEY:-re_your-resend-api-key-here}
- FROM_EMAIL=rackoon1030@gmail.com
```

Make sure your `.env` file has `RESEND_API_KEY` set.

## 6. Restart Your Backend Service

```bash
docker-compose restart backend
```

## 7. Verify Resend Initialization

Check your backend Docker logs:

```bash
docker-compose logs backend | grep Resend
```

You should see:
```
✅ Resend initialized successfully
📧 FROM_EMAIL configured: rackoon1030@gmail.com
ℹ️ Resend free tier: 3,000 emails/month, 100/day
```

## 8. Test Email Functionality

When a user submits a claim for an item, an email notification should be sent to the item owner's email address.

Check the backend logs for:
```
✅ Resend email sent successfully in XXXms
📧 Email ID: [email-id]
```

## Resend vs SendGrid

| Feature | Resend | SendGrid |
|---------|--------|----------|
| Free Tier | 3,000/month, 100/day | Ended (trial expired) |
| Setup | Simple, no domain verification needed for testing | Requires sender verification |
| API | Modern, simple | More complex |
| Best For | Modern projects, quick setup | Enterprise, high volume |

## Troubleshooting

### Email not sending

1. **Check API Key:**
   - Verify `RESEND_API_KEY` is set correctly in `.env`
   - Make sure it starts with `re_`

2. **Check Logs:**
   ```bash
   docker-compose logs backend | grep -i resend
   ```

3. **Verify FROM_EMAIL:**
   - For testing, use `onboarding@resend.dev`
   - For production, verify your domain in Resend dashboard

### Rate Limits

Resend free tier limits:
- **100 emails per day**
- **3,000 emails per month**

If you hit the limit, you'll see an error in the logs. Wait until the next day/month or upgrade your plan.

## Production Notes

For production deployment:
1. Verify your domain in Resend dashboard
2. Use a verified email address for `FROM_EMAIL`
3. Monitor your email usage in Resend dashboard
4. Set up webhooks for delivery tracking (optional)

