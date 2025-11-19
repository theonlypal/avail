# API Keys Setup Guide

## Overview

LEADLY.AI uses the Anthropic Claude API to power the AI Copilot features. This guide walks you through setting up your API keys for both development and production environments.

## Prerequisites

- Node.js 18+ installed
- Access to [Anthropic Console](https://console.anthropic.com/)
- LEADLY.AI repository cloned locally

## Development Setup

### Step 1: Get Your Anthropic API Key

1. Navigate to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign in or create an account
3. Click "Create Key"
4. Name your key (e.g., "LEADLY.AI Development")
5. Copy the API key (starts with `sk-ant-`)

⚠️ **Important**: Store this key securely. You won't be able to see it again.

### Step 2: Configure Environment Variables

1. In your project root, locate `.env.local.example`
2. Copy it to create your own environment file:

```bash
cp .env.local.example .env.local
```

3. Open `.env.local` and add your Anthropic API key:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# Model Configuration (optional, defaults to claude-3-5-sonnet-20241022)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Step 3: Verify Setup

1. Start the development server:

```bash
npm run dev
```

2. Navigate to http://localhost:3000/dashboard
3. Look at the AI Copilot sidebar (right side)
4. Check the API status indicator at the top:
   - 🟢 **Green "Online"** = API configured correctly
   - 🟡 **Yellow "Not Configured"** = API key missing
   - 🔴 **Red "Invalid Key"** = API key is incorrect

You can also manually check the health endpoint:

```bash
curl http://localhost:3000/api/ai/health
```

Expected response when configured correctly:

```json
{
  "anthropicConfigured": true,
  "model": "claude-3-5-sonnet-20241022",
  "status": "ready",
  "message": "AI Copilot is ready",
  "timestamp": "2025-01-16T..."
}
```

## Production Setup

### Vercel Deployment

1. Navigate to your Vercel project settings
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-your-production-key` | Production |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-20241022` | Production (optional) |

4. Redeploy your application for changes to take effect

### Other Platforms

For other hosting platforms (AWS, Azure, Google Cloud, etc.), add the environment variables through their respective configuration interfaces:

**AWS Elastic Beanstalk**:
```bash
eb setenv ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Docker**:
```bash
docker run -e ANTHROPIC_API_KEY=sk-ant-your-key-here leadly-ai
```

**Kubernetes**:
```yaml
env:
  - name: ANTHROPIC_API_KEY
    valueFrom:
      secretKeyRef:
        name: leadly-secrets
        key: anthropic-api-key
```

## Security Best Practices

### ✅ DO

- Store API keys in environment variables only
- Use different keys for development and production
- Rotate keys periodically (every 90 days recommended)
- Add `.env.local` to `.gitignore` (already configured)
- Use secret management services in production (AWS Secrets Manager, Azure Key Vault, etc.)
- Monitor API usage through [Anthropic Console](https://console.anthropic.com/)

### ❌ DON'T

- Commit API keys to version control
- Share API keys in chat, email, or documentation
- Use production keys in development environments
- Expose keys in client-side code
- Leave unused keys active

## Troubleshooting

### "Not Configured" Status

**Problem**: API status indicator shows yellow "Not Configured"

**Solutions**:
1. Verify `.env.local` file exists in project root
2. Confirm `ANTHROPIC_API_KEY` is set in `.env.local`
3. Restart development server (`npm run dev`)
4. Clear browser cache and refresh

### "Invalid Key" Status

**Problem**: API status indicator shows red "Invalid Key"

**Solutions**:
1. Verify API key format (should start with `sk-ant-`)
2. Check for extra spaces or line breaks in `.env.local`
3. Generate a new key from [Anthropic Console](https://console.anthropic.com/settings/keys)
4. Ensure key hasn't been revoked or expired

### API Health Check Fails

**Problem**: `/api/ai/health` returns error

**Solutions**:
1. Check network connectivity
2. Verify Anthropic API status at [status.anthropic.com](https://status.anthropic.com)
3. Check rate limits in Anthropic Console
4. Review server logs for detailed error messages

### Rate Limiting

**Problem**: Getting 429 "Too Many Requests" errors

**Solutions**:
1. Check current usage tier in Anthropic Console
2. Implement request throttling in application code
3. Upgrade to higher tier if needed
4. Consider caching AI responses for repeated queries

## Cost Management

### Token Usage

The AI Copilot uses the following token estimates:

- **Health checks**: ~1 token (minimal cost)
- **Simple queries**: ~100-500 tokens
- **Complex workflows**: ~1000-3000 tokens
- **Document analysis**: ~2000-5000 tokens

### Model Pricing (as of January 2025)

**Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)**:
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

### Cost Optimization Tips

1. **Use health checks sparingly**: Already optimized to run every 5 minutes
2. **Implement response caching**: Cache common queries
3. **Set reasonable max_tokens**: Don't request more tokens than needed
4. **Monitor usage**: Check Anthropic Console weekly
5. **Use streaming**: Enable streaming for better UX without increasing cost

## Support

### Documentation

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [LEADLY.AI Component Documentation](../src/components/chat/README.md)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [Anthropic API Status](https://status.anthropic.com)
2. Review application logs: `npm run dev` output
3. Inspect browser console for client-side errors
4. Contact LEADLY.AI support team

## Next Steps

Once your API keys are configured:

1. ✅ Verify green "Online" status in AI Copilot
2. 🧪 Test AI features in the dashboard
3. 📊 Explore live demos at `/demos-live`
4. 🎨 Customize AI prompts and workflows
5. 🚀 Deploy to production

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained By**: LEADLY.AI Engineering Team
