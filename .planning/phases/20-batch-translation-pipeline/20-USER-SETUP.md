# Phase 20: User Setup Required

**Generated:** 2026-02-02
**Phase:** 20-batch-translation-pipeline
**Status:** Incomplete

This phase introduced external services requiring manual configuration before translation can run.

## Services Required

### Anthropic Claude API

**Purpose:** Claude API for translation
**Why needed:** translate-batch.js uses Anthropic's Message Batches API for 50% cost savings

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | `.env` or `.env.local` |

### Getting Your API Key

1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add to your environment:

```bash
# Create .env file in project root
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

**Important:** Never commit .env to git. It should be in .gitignore.

## Verification

Once environment variables are set, verify the setup:

```bash
# Check that API key is accessible
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY ? 'API key found' : 'API key missing')"

# Test API connection (will be implemented in Plan 03)
# npm run translate:en -- --test-connection
```

## Cost Estimation

Using Message Batches API (50% discount):

- **Model:** Claude 3.5 Sonnet
- **Cost per page:** ~$0.01-0.03 (estimated)
- **Total pages:** 169
- **Estimated total:** $2-5 USD

Actual cost depends on page content length.

## Local Development

For testing without API calls:

```bash
# Dry run (no API calls)
npm run translate:en -- --dry-run

# Test single file (Plan 03 will implement)
npm run translate:en -- --file src/pages/chi-siamo.html --dry-run
```

---

**Once API key is set:** Mark status as "Complete" and proceed with translation execution.
