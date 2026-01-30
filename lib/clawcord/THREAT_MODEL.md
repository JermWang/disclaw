# ClawCord Threat Model

## Overview

ClawCord is a Discord-integrated signal caller for Solana tokens. This document outlines potential security threats and mitigations.

## Assets

1. **Discord Bot Token** - Allows control of the bot
2. **Guild Configurations** - User settings and watchlists
3. **Call Logs** - Historical call data with reasoning
4. **API Keys** - Data provider credentials (Birdeye, Helius, etc.)

## Threat Categories

### 1. Discord Security

#### T1.1: Bot Token Compromise
- **Risk**: Attacker gains access to bot token
- **Impact**: Full control of bot, can post to all connected servers
- **Mitigations**:
  - Store token in environment variables only
  - Rotate token if suspected compromise
  - Use minimal required permissions

#### T1.2: Malicious Command Injection
- **Risk**: User injects malicious content via commands
- **Impact**: XSS in web dashboard, malformed Discord messages
- **Mitigations**:
  - Sanitize all user inputs
  - Use structured output templates
  - Validate token addresses format

#### T1.3: Unauthorized Configuration Changes
- **Risk**: Non-admin users modify server config
- **Impact**: Policy manipulation, watchlist tampering
- **Mitigations**:
  - Per-server admin allowlists
  - Audit log for config changes
  - Discord role-based permissions

### 2. Data Provider Security

#### T2.1: API Key Exposure
- **Risk**: Data provider API keys leaked
- **Impact**: Unauthorized API usage, billing fraud
- **Mitigations**:
  - Server-side API calls only
  - Environment variable storage
  - Key rotation schedule

#### T2.2: Data Provider Manipulation
- **Risk**: Compromised or malicious data source
- **Impact**: False signals, manipulation of calls
- **Mitigations**:
  - Multiple data source cross-validation
  - Anomaly detection for extreme values
  - Manual override capability

### 3. Call Output Security

#### T3.1: Financial Advice Liability
- **Risk**: Outputs interpreted as financial advice
- **Impact**: Legal liability, user losses
- **Mitigations**:
  - Structured output templates (not free-form)
  - Mandatory risk disclosures
  - Confidence scoring with limitations
  - Clear disclaimers

#### T3.2: Hallucination / False Data
- **Risk**: AI generates false token data
- **Impact**: Users act on incorrect information
- **Mitigations**:
  - **NO HALLUCINATION RULE**: All data must come from verified sources
  - Real-time data fetching only
  - Source attribution in receipts
  - Deterministic scoring rules

### 4. Infrastructure Security

#### T4.1: Rate Limiting Bypass
- **Risk**: Attackers overwhelm API/data providers
- **Impact**: Service degradation, API costs
- **Mitigations**:
  - Per-guild rate limits
  - Global rate limits
  - Caching layer for repeated queries

#### T4.2: Storage Tampering
- **Risk**: Database manipulation
- **Impact**: False logs, config changes
- **Mitigations**:
  - Immutable call logs (append-only)
  - Config change audit trail
  - Database access controls

## Security Defaults

```typescript
const SECURITY_DEFAULTS = {
  requireMention: true,        // Bot only responds when @mentioned
  adminOnlyConfig: true,       // Only admins can change settings
  disableBotToBotLoop: true,   // Prevent bot message loops
  maxCallsPerDay: 50,          // Prevent spam
  autopostOptIn: true,         // Explicit opt-in for auto-posting
  logRetentionDays: 90,        // Auto-delete old logs
};
```

## No Hallucination Rule

**CRITICAL**: ClawCord must NEVER generate fabricated data.

### Allowed
- Data fetched from verified APIs (Birdeye, Helius, on-chain)
- Calculations based on real data
- Pattern matching on real metrics

### NOT Allowed
- Invented token names or symbols
- Fabricated price/volume data
- Made-up deployer histories
- Fictional risk assessments

### Implementation
```typescript
// All token data must pass through verified providers
async function getTokenData(mint: string): Promise<TokenMetrics | null> {
  const data = await verifiedProvider.fetch(mint);
  
  // NEVER fall back to fabricated data
  if (!data) {
    return null; // Return null, not mock data
  }
  
  return data;
}
```

## Incident Response

1. **Token Compromise**: Immediately rotate bot token, revoke OAuth
2. **Data Breach**: Notify affected servers, audit access logs
3. **False Signals**: Halt autopost, issue correction, review scoring
4. **API Abuse**: Enable strict rate limiting, block offending IPs

## Regular Audits

- Weekly: Review call logs for anomalies
- Monthly: Audit configuration changes
- Quarterly: Penetration testing
- Annually: Full security review
