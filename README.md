<div align="center">

![ClawCord Banner](public/banner-optimized.gif)

# 🦀 ClawCord

### Policy-Driven Signal Caller for Solana Tokens

[![Discord](https://img.shields.io/badge/Discord-Add%20Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://clawcord.vercel.app/api/discord/invite)
[![Twitter](https://img.shields.io/badge/Twitter-@ClawCordSOL-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/ClawCordSOL)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=flat-square&logo=solana)](https://solana.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

**Automate your Discord calls with real-time PumpFun graduation tracking.**

[🚀 Add to Discord](https://clawcord.vercel.app/api/discord/invite) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/JermWang/ClawCord/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎓 **PumpFun Graduation Tracking** | Monitors tokens graduating from PumpFun to Raydium/PumpSwap in real-time |
| 📊 **Multi-Source Analytics** | Combines DexScreener + Helius data for comprehensive token analysis |
| 🛡️ **Policy Engine** | Configurable thresholds for liquidity, volume, holders, and more |
| 🤖 **Discord Autopost** | Automatically posts high-scoring tokens to your signal channels |
| 📈 **Holder Analysis** | Detects whale concentration and tracks holder growth |
| ⚡ **Real-time Scoring** | 0-10 confidence scores based on multiple on-chain signals |

---

## 🚀 Quick Start

### Add to Discord

1. Click **[Add to Discord](https://clawcord.vercel.app/api/discord/invite)**
2. Select your server and authorize
3. Run `/clawcord install` in any channel
4. Configure your policy with `/clawcord policy`
5. Enable autopost with `/clawcord autopost enabled:true`

### Self-Hosting

```bash
# Clone the repository
git clone https://github.com/JermWang/ClawCord.git
cd ClawCord

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
| `/clawcord scan` | Scan for newly graduated PumpFun tokens |
| `/clawcord call $TICKER` | Generate a full analysis call card |
| `/clawcord policy [preset]` | View or change active policy |
| `/clawcord autopost enabled:true` | Enable automatic posting |
| `/clawcord watch $TOKEN` | Add token to watchlist |
| `/clawcord logs [limit]` | View recent calls |

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
ClawCord
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── discord/        # Discord interactions & OAuth
│   │   ├── graduations/    # Graduation scanning endpoint
│   │   └── autopost/       # Autopost service control
│   └── page.tsx            # Landing page
├── lib/clawcord/           # Core logic
│   ├── dexscreener-provider.ts   # DexScreener API
│   ├── data-providers.ts         # Helius integration
│   ├── autopost-service.ts       # Discord autoposting
│   ├── scoring.ts                # Token scoring engine
│   └── policies.ts               # Policy presets
└── components/             # React components
```

---

## 📊 Scoring System

ClawCord uses a **0-10 scoring system** based on:

- **Volume Momentum** — 5m volume vs 1h average
- **Liquidity Health** — USD liquidity depth
- **Buy/Sell Ratio** — Transaction sentiment
- **Holder Distribution** — Count + concentration
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

- **Website**: [clawcord.vercel.app](https://clawcord.vercel.app)
- **Twitter**: [@ClawCordSOL](https://x.com/ClawCordSOL)
- **Discord**: [Add Bot](https://clawcord.vercel.app/api/discord/invite)
- **GitHub**: [JermWang/ClawCord](https://github.com/JermWang/ClawCord)

---

<div align="center">

**Built with 🦀 by the ClawCord Team**

*Disclaimer: ClawCord is a tool for signal tracking, not financial advice. Always DYOR.*

</div>