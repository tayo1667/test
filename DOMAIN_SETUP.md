# Custom Domain Setup for Sentriom

## Option 1: Using Railway Dashboard (Recommended)

### Step-by-Step Instructions:

1. **Access Railway Dashboard**
   - Go to: https://railway.app/project/5e2d0462-f8b3-4b5f-ac62-a6ef851732f6
   - Click on your **sentriom** service

2. **Add Custom Domain**
   - Navigate to **Settings** tab
   - Scroll to **Domains** section
   - Click **+ Add Domain**
   - Enter your domain name (e.g., `sentriom.com`)

3. **Get DNS Configuration**
   - Railway will show you the DNS records to add
   - Copy these records

4. **Configure DNS at Your Domain Registrar**
   
   **For Root Domain (example.com):**
   ```
   Type: A
   Name: @
   Value: [IP provided by Railway]
   TTL: 3600
   ```
   
   **For WWW Subdomain (www.example.com):**
   ```
   Type: CNAME
   Name: www
   Value: [CNAME provided by Railway]
   TTL: 3600
   ```
   
   **Alternative - Using CNAME for Root (if supported):**
   ```
   Type: CNAME
   Name: @
   Value: [CNAME provided by Railway]
   TTL: 3600
   ```

5. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours
   - Usually propagates within 1-2 hours
   - Check status: https://dnschecker.org

6. **SSL Certificate**
   - Railway automatically provisions SSL certificates
   - Your site will be accessible via HTTPS
   - Certificate is auto-renewed

## Option 2: Using Railway CLI

```bash
# Add custom domain
railway domain add sentriom.com

# Check domain status
railway domain list

# Remove domain (if needed)
railway domain remove sentriom.com
```

## Common Domain Registrars Setup

### Namecheap
1. Login to Namecheap
2. Go to Domain List → Manage
3. Click **Advanced DNS**
4. Add the A/CNAME records provided by Railway
5. Save changes

### GoDaddy
1. Login to GoDaddy
2. Go to My Products → DNS
3. Click **Add** under Records
4. Add the A/CNAME records provided by Railway
5. Save

### Cloudflare
1. Login to Cloudflare
2. Select your domain
3. Go to **DNS** tab
4. Add the A/CNAME records provided by Railway
5. Set Proxy status to **DNS only** (grey cloud)
6. Save

### Google Domains
1. Login to Google Domains
2. Select your domain
3. Go to **DNS** tab
4. Click **Manage custom records**
5. Add the A/CNAME records provided by Railway
6. Save

## Verification Steps

### 1. Check DNS Propagation
```bash
# Check A record
dig sentriom.com

# Check CNAME record
dig www.sentriom.com

# Check from multiple locations
# Visit: https://dnschecker.org
```

### 2. Test Domain Access
```bash
# Test HTTP
curl -I http://sentriom.com

# Test HTTPS (after SSL is provisioned)
curl -I https://sentriom.com
```

### 3. Verify SSL Certificate
- Visit: https://www.ssllabs.com/ssltest/
- Enter your domain
- Check SSL grade

## Troubleshooting

### Domain Not Working
1. **Check DNS Records**
   - Verify records are correct in your registrar
   - Use `dig` or `nslookup` to check

2. **Wait for Propagation**
   - DNS changes take time
   - Check https://dnschecker.org

3. **Check Railway Status**
   - Ensure domain is added in Railway dashboard
   - Check deployment logs

### SSL Certificate Issues
1. **Wait for Provisioning**
   - SSL certificates take 5-15 minutes to provision
   - Railway uses Let's Encrypt

2. **Check Domain Verification**
   - Ensure DNS records are correct
   - Domain must be accessible via HTTP first

### Mixed Content Warnings
1. **Update API URLs**
   - Ensure all API calls use HTTPS
   - Update any hardcoded HTTP URLs

2. **Check External Resources**
   - Verify all external scripts/styles use HTTPS

## Post-Deployment Checklist

- [ ] Domain added in Railway dashboard
- [ ] DNS records configured at registrar
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] Site accessible via HTTP
- [ ] SSL certificate provisioned
- [ ] Site accessible via HTTPS
- [ ] All pages loading correctly
- [ ] API endpoints working
- [ ] Admin dashboard accessible
- [ ] Test login/signup flow
- [ ] Test deposit flow
- [ ] Check mobile responsiveness

## Update Application URLs

After domain is live, update these references:

### 1. Update API Base URL (if needed)
If you're using absolute URLs in your frontend, update them to use your custom domain.

### 2. Update Email Templates
Update any email templates to use your custom domain instead of Railway URL.

### 3. Update Documentation
Update README and other docs with your custom domain.

### 4. Update Social Media
Update social media profiles with your custom domain.

## Multiple Domains

You can add multiple domains:
- `sentriom.com` (primary)
- `www.sentriom.com` (redirect to primary)
- `app.sentriom.com` (for web app)
- `admin.sentriom.com` (for admin dashboard)

To add multiple domains, repeat the process for each domain.

## Domain Redirect (WWW to Non-WWW or vice versa)

Railway automatically handles redirects. You can configure:
1. Add both domains in Railway
2. Set one as primary
3. Railway will redirect the other to primary

## Support

If you encounter issues:
1. Check Railway documentation: https://docs.railway.app/deploy/custom-domains
2. Railway Discord: https://discord.gg/railway
3. Railway Support: https://help.railway.app

---

**Current Status:**
- Railway URL: https://sentriom-production.up.railway.app ✅
- Custom Domain: Pending setup

**Next Steps:**
1. Add your domain in Railway dashboard
2. Configure DNS records
3. Wait for propagation
4. Test and verify
