<div align="center">

# � DISCLAW

### Whale Wallet Tracking & Policy-Driven Signal Calling for Solana

[![Discord](https://img.shields.io/badge/Discord-Add%20Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://disclaw.xyz/api/discord/invite)
[![Twitter](https://img.shields.io/badge/Twitter-@DisclawSOL-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/DisclawSOL)
[![Telegram](https://img.shields.io/badge/Telegram-BlueClawCallsBot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/BlueClawCallsBot)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=flat-square&logo=solana)](https://solana.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

**Follow the smart money. Track whale wallets and automate your Discord calls.**

[🚀 Add to Discord](https://disclaw.xyz/api/discord/invite) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/JermWang/DISCLAW/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🐋 **Whale Wallet Tracking** | Monitor whale wallets and get instant Discord alerts when they buy new tokens |
| 🎓 **PumpFun Graduation Tracking** | Monitors tokens graduating from PumpFun to Raydium/PumpSwap in real-time |
| 📊 **Multi-Source Analytics** | Combines DexScreener + Helius data for comprehensive token analysis |
| 🛡️ **Policy Engine** | Configurable thresholds for liquidity, volume, holders, and more |
| 🤖 **Discord Autopost** | Automatically posts high-scoring tokens to your signal channels |
| 📈 **Holder Analysis** | Detects whale concentration and tracks holder growth |
| ⚡ **Real-time Scoring** | 0-10 confidence scores based on multiple on-chain signals |

---

## 🚀 Quick Start

### Add to Discord

1. Click **[Add to Discord](https://disclaw.xyz/api/discord/invite)**
2. Select your server and authorize
3. Run `/disclaw install` in any channel
4. Add whale wallets to track: `/disclaw watch add <wallet_address>`
5. Configure your policy with `/disclaw policy`
6. Enable autopost with `/disclaw autopost on`

### Self-Hosting

```bash
# Clone the repository
git clone https://github.com/JermWang/DISCLAW.git
cd DISCLAW

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Discord and Helius credentials

# Run development server
pnpm dev
```

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/disclaw watch add <wallet>` | Track a whale wallet for new buys |
| `/disclaw scan` | Scan for newly graduated PumpFun tokens |
| `/disclaw call $TICKER` | Generate a full analysis call card |
| `/disclaw policy [preset]` | View or change active policy |
| `/disclaw autopost on` | Enable automatic posting |
| `/disclaw logs` | View recent calls |
| `/disclaw leaderboard` | Top calls by ATH performance |
| `/disclaw digest` | Daily/weekly performance digest |
| `/disclaw meta` | Trending themes from new launches |

---

## ⚙️ Configuration

### Environment Variables

```env
# Discord
DISCORD_APPLICATION_ID=your_app_id
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key

# Data Providers
HELIUS_API_KEY=your_helius_key
DEXSCREENER_BASE_URL=https://api.dexscreener.com
```

### Default Graduation Filter

| Threshold | Value | Description |
|-----------|-------|-------------|
| Min Liquidity | $12,000 | Post-graduation baseline |
| Min Volume (5m) | $1,000 | Active trading indicator |
| Min Holders | 75 | Healthy distribution |
| Max Age | 45 min | Catch early but stable |
| Max Top 10 Concentration | 50% | Whale risk limit |

---

## 🏗️ Architecture

```
DISCLAW
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── discord/        # Discord interactions & OAuth
│   │   ├── graduations/    # Graduation scanning endpoint
│   │   └── autopost/       # Autopost service control
│   └── page.tsx            # Landing page
├── lib/disclaw/            # Core logic
│   ├── dexscreener-provider.ts   # DexScreener API
│   ├── data-providers.ts         # Helius integration
│   ├── autopost-service.ts       # Discord autoposting + whale alerts
│   ├── scoring.ts                # Token scoring engine
│   └── policies.ts               # Policy presets
└── components/             # React components
```

---

## 📊 Scoring System

DISCLAW uses a **0-10 scoring system** based on:

- **Volume Momentum** — 5m volume vs 1h average
- **Liquidity Health** — USD liquidity depth
- **Buy/Sell Ratio** — Transaction sentiment
- **Holder Distribution** — Count + concentration
- **Whale Accumulation** — Smart money activity
- **Price Action** — Short-term momentum
- **Market Cap** — Sweet spot detection ($100k-$5M)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Website**: [disclaw.xyz](https://disclaw.xyz)
- **Twitter**: [@DisclawSOL](https://x.com/DisclawSOL)
- **Discord**: [Add Bot](https://disclaw.xyz/api/discord/invite)
- **Telegram**: [@BlueClawCallsBot](https://t.me/BlueClawCallsBot)
- **GitHub**: [JermWang/DISCLAW](https://github.com/JermWang/DISCLAW)

---

<div align="center">

**Built with � by the DISCLAW Team**

*Disclaimer: DISCLAW is a tool for signal tracking, not financial advice. Always DYOR.*

</div>