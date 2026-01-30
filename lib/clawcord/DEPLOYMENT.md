# ClawCord Deployment Guide

## Prerequisites

- Node.js 18+
- Discord Application with Bot
- Vercel account (recommended) or any Node.js hosting

## Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "ClawCord" or your preferred name
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the **Bot Token** (save securely)
7. Enable these Privileged Gateway Intents:
   - MESSAGE CONTENT INTENT (if reading messages)

### 2. Configure OAuth2

1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
4. Copy the generated URL to invite the bot

### 3. Get Public Key

1. Go to "General Information"
2. Copy the **Application ID** and **Public Key**

## Environment Variables

Create a `.env.local` file:

```bash
# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_APPLICATION_ID=your_application_id

# Data Providers (optional - falls back to mock data)
BIRDEYE_API_KEY=your_birdeye_key
HELIUS_API_KEY=your_helius_key

# Database (optional - uses in-memory by default)
DATABASE_URL=your_database_url
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Configure Discord Interactions URL:**
```
https://your-app.vercel.app/api/discord/interactions
```

### Option 2: Self-Hosted

1. Clone repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start`
5. Use nginx/caddy as reverse proxy

## Register Slash Commands

Run this script to register commands with Discord:

```typescript
// scripts/register-commands.ts
const commands = [
  {
    name: "clawcord",
    description: "ClawCord signal caller commands",
    options: [
      { name: "install", description: "Setup ClawCord", type: 1 },
      { name: "policy", description: "View/set policy", type: 1 },
      { name: "watch", description: "Manage watchlist", type: 1 },
      { name: "call", description: "Generate a call", type: 1 },
      { name: "autopost", description: "Configure autopost", type: 1 },
      { name: "thresholds", description: "Adjust thresholds", type: 1 },
      { name: "logs", description: "View recent calls", type: 1 },
    ],
  },
];

// Register globally
await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }
);
```

## Production Checklist

### Security
- [ ] Bot token stored in environment variables
- [ ] Discord signature verification enabled
- [ ] Rate limiting configured
- [ ] Admin allowlists set up

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Logging configured
- [ ] Uptime monitoring
- [ ] API usage alerts

### Data
- [ ] Database configured (for production)
- [ ] Backup strategy in place
- [ ] Data retention policy set

### Testing
- [ ] Test in development server first
- [ ] Verify all commands work
- [ ] Test autopost functionality
- [ ] Verify rate limits

## Scaling Considerations

### For High-Volume Servers

1. **Database**: Switch from in-memory to PostgreSQL/Supabase
2. **Caching**: Add Redis for token data caching
3. **Queue**: Use job queue for autopost scheduling
4. **CDN**: Cache static dashboard assets

### Rate Limits

Discord API limits:
- 50 requests per second per bot
- 200 application commands per guild
- 5 global application commands updates per day

Data provider limits (vary by plan):
- Birdeye: Check your plan
- Helius: Check your plan

## Troubleshooting

### Bot Not Responding

1. Check bot is online in Discord
2. Verify interactions URL is correct
3. Check Vercel/server logs
4. Ensure public key is correct

### Commands Not Showing

1. Wait up to 1 hour for global command propagation
2. Try re-registering commands
3. Check bot has `applications.commands` scope

### Data Not Loading

1. Verify API keys are set
2. Check rate limits haven't been hit
3. Test API endpoints directly

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discord: [Support Server]
