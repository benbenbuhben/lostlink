# Resend Domain Setup for thomasha.dev

This guide will help you set up `thomasha.dev` domain for Resend email sending.

## Step 1: Add Domain in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `thomasha.dev`
4. Click **"Add"**

## Step 2: Add DNS Records

Resend will show you the DNS records you need to add. You'll need to add these to your domain's DNS settings (wherever you manage `thomasha.dev` - could be Cloudflare, Namecheap, GoDaddy, etc.).

### Required DNS Records:

#### 1. SPF Record (TXT)
```
Type: TXT
Name: @ (or thomasha.dev)
Value: v=spf1 include:resend.com ~all
TTL: 3600 (or default)
```

#### 2. DKIM Record (TXT)
```
Type: TXT
Name: resend._domainkey (or resend._domainkey.thomasha.dev)
Value: [Resend will provide this - it's a long string starting with p=]
TTL: 3600 (or default)
```

#### 3. DMARC Record (TXT) - Optional but Recommended
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:rackoon1030@gmail.com
TTL: 3600 (or default)
```

## Step 3: Where to Add DNS Records

### If using Cloudflare:
1. Go to Cloudflare Dashboard
2. Select `thomasha.dev` domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add each record (SPF, DKIM, DMARC)

### If using other DNS providers:
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: DNS Management
- **Google Domains**: DNS → Custom records
- **AWS Route 53**: Hosted zones → Create record

## Step 4: Wait for Verification

1. DNS propagation can take **5 minutes to 48 hours** (usually 5-30 minutes)
2. Resend will automatically verify when DNS records are detected
3. Check status in Resend dashboard → Domains
4. Status will change from "Pending" to "Verified" ✅

## Step 5: Update Environment Variables

Once verified, update your `.env`:

```bash
FROM_EMAIL=noreply@thomasha.dev
# or
FROM_EMAIL=lostlink@thomasha.dev
# or any subdomain you prefer
```

**Note:** You can use any email address with your verified domain:
- `noreply@thomasha.dev`
- `lostlink@thomasha.dev`
- `contact@thomasha.dev`
- etc.

## Step 6: Restart Backend

```bash
docker-compose restart backend
```

## Troubleshooting

### DNS records not detected?
- Wait a bit longer (DNS propagation can be slow)
- Check if records are correct (copy-paste from Resend exactly)
- Verify TTL is not too high (use 3600 or lower)
- Check DNS propagation: https://dnschecker.org

### Still not working?
- Double-check record names (case-sensitive)
- Make sure you're adding TXT records, not other types
- Verify the DKIM value from Resend is correct (it's very long)

## Quick Test

After verification, test with:
```bash
docker-compose exec backend node test-resend.js
```

You should see:
```
✅ Test email sent successfully!
📧 Email ID: [some-id]
```

