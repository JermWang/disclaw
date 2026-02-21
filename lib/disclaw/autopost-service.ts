import type {
  GraduationCandidate,
  GuildConfig,
  CallLog,
  DexScreenerPair,
  CallPerformance,
  DisplaySettings,
  TokenMetrics,
} from "./types";
import { DexScreenerProvider, GraduationWatcher, DEFAULT_GRADUATION_FILTER } from "./dexscreener-provider";
import { scoreToken } from "./scoring";
import { generateCallCard } from "./call-card";
import { getStorage } from "./storage";

interface AutopostConfig {
  enabled: boolean;
  intervalMs: number;
  minScore: number;
}

const DEFAULT_AUTOPOST_CONFIG: AutopostConfig = {
  enabled: false,
  intervalMs: 60_000, // 1 minute
  minScore: 6.5,
};

const DEDUPE_WINDOW_HOURS = 24;
const DEDUPE_LOG_LIMIT = 200;

const PERFORMANCE_INTERVAL_MS = 5 * 60 * 1000;
const PERFORMANCE_LOOKBACK_DAYS = 30;
const PERFORMANCE_LOG_LIMIT = 200;

const BONUS_MIN_GAIN_PCT = 30;
const BONUS_MIN_PRICE_CHANGE_M5 = 10;
const BONUS_MIN_BUY_SELL_RATIO = 2;
const BONUS_MIN_VOLUME_M5 = 5000;

const DISCORD_SUPPRESS_EMBEDS_FLAG = 1 << 2;

const DISCLAW_MINT = "8JFUtwhEzSmrVa56re8rZdathHc9fqmr2em9XMQMpump";
const WSOL_MINT = "So11111111111111111111111111111111111111112";
const DISCLAW_ALERT_INTERVAL_MS = 60_000;
const DISCLAW_ALERT_COOLDOWN_MS = 30 * 60 * 1000;
const DISCLAW_PUMP_PRICE_CHANGE_M5 = 25;
const DISCLAW_PUMP_MIN_VOLUME_M5 = 5000;
const DISCLAW_MAJOR_BUY_SOL = 8;
const DISCLAW_MAJOR_BUY_MIN_BUYS = 1;
const DISCLAW_MAJOR_BUY_MIN_BUY_SELL_RATIO = 1.2;
const SOL_PRICE_CACHE_MS = 5 * 60 * 1000;
const SOL_PRICE_FALLBACK_USD = 150;

type DisclawAlertType = "pump" | "major_buy";
type DisclawAlertTimes = {
  pump?: number;
  major_buy?: number;
};

interface SocialLink {
  label: string;
  url: string;
}

const SOCIAL_PRIORITY = ["twitter", "telegram", "discord", "medium", "github", "reddit"];
const SOCIAL_LABELS: Record<string, string> = {
  twitter: "X",
  telegram: "Telegram",
  discord: "Discord",
  medium: "Medium",
  github: "GitHub",
  reddit: "Reddit",
};

function normalizeSocialType(type?: string): string {
  const normalized = (type || "").toLowerCase();
  return normalized === "x" ? "twitter" : normalized;
}

function extractSocialLinks(pair: DexScreenerPair): SocialLink[] {
  const socials = pair.info?.socials ?? [];
  const websites = pair.info?.websites ?? [];
  const byType = new Map<string, string>();

  socials.forEach((social) => {
    const type = normalizeSocialType(social.type);
    if (!type || !social.url) {
      return;
    }
    if (!byType.has(type)) {
      byType.set(type, social.url);
    }
  });

  const ordered: SocialLink[] = [];
  SOCIAL_PRIORITY.forEach((type) => {
    const url = byType.get(type);
    if (!url) {
      return;
    }
    ordered.push({ label: SOCIAL_LABELS[type] || type, url });
    byType.delete(type);
  });

  byType.forEach((url, type) => {
    ordered.push({ label: SOCIAL_LABELS[type] || type, url });
  });

  const websiteUrl = websites.find((site) => Boolean(site?.url))?.url;
  if (websiteUrl) {
    ordered.push({ label: "Website", url: websiteUrl });
  }

  return ordered.slice(0, 4);
}

function hasTwitterLink(pair: DexScreenerPair): boolean {
  const socials = pair.info?.socials ?? [];
  return socials.some((social) => {
    const type = normalizeSocialType(social.type);
    if (type === "twitter") {
      return true;
    }
    const url = social.url?.toLowerCase() || "";
    return url.includes("twitter.com") || url.includes("x.com");
  });
}

function formatUsdPrice(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}

function formatShortNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export class AutopostService {
  private watcher: GraduationWatcher;
  private intervalId: NodeJS.Timeout | null = null;
  private performanceIntervalId: NodeJS.Timeout | null = null;
  private performanceRunning = false;
  private disclawIntervalId: NodeJS.Timeout | null = null;
  private disclawAlertRunning = false;
  private lastDisclawAlertAt = new Map<string, DisclawAlertTimes>();
  private solPriceCache: { value: number; timestamp: number } | null = null;
  private config: AutopostConfig;
  private dexProvider: DexScreenerProvider;

  constructor(config?: Partial<AutopostConfig>) {
    this.watcher = new GraduationWatcher();
    this.config = { ...DEFAULT_AUTOPOST_CONFIG, ...config };
    this.dexProvider = new DexScreenerProvider();
  }

  async sendDiscordMessage(channelId: string, content: string): Promise<boolean> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error("❌ No Discord bot token configured - cannot send messages");
      return false;
    }

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, flags: DISCORD_SUPPRESS_EMBEDS_FLAG }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ Discord API error ${response.status}: ${errorBody}`);
        if (response.status === 403) {
          console.error(`   → Bot lacks permission to post in channel ${channelId}`);
        } else if (response.status === 404) {
          console.error(`   → Channel ${channelId} not found - may have been deleted`);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to send Discord message:", error);
      return false;
    }
  }

  formatGraduationCall(candidate: GraduationCandidate, display?: DisplaySettings): string {
    const { graduation, pair, score, metrics } = candidate;
    const priceChange = pair.priceChange?.m5 || 0;
    const buys = pair.txns?.m5?.buys || 0;
    const sells = pair.txns?.m5?.sells || 0;
    const buySellRatio = sells
      ? (buys / sells).toFixed(2)
      : buys > 0
        ? "∞"
        : "0";
    const price = parseFloat(pair.priceUsd) || 0;
    const priceLine = `${formatUsdPrice(price)} (${priceChange > 0 ? "+" : ""}${priceChange.toFixed(1)}% 5m)`;
    const warnings: string[] = [];
    if ((pair.liquidity?.usd || 0) < 10000) {
      warnings.push("Low liq");
    }
    if (priceChange < -10) {
      warnings.push("Dumping");
    }
    const socialLinks = extractSocialLinks(pair)
      .slice(0, 2)
      .map((social) => `[${social.label}](${social.url})`)
      .join(" • ");
    const mint = `${graduation.mint.slice(0, 6)}...${graduation.mint.slice(-4)}`;
    const warningLine = warnings.length ? ` | Flags ${warnings.join(", ")}` : "";
    const showCreatorWhale = display?.showCreatorWhale ?? false;
    const creatorWhaleLine = showCreatorWhale ? this.formatCreatorWhaleLine(metrics) : null;

    return [
      `🎓 **$${graduation.symbol}** | Score ${score.toFixed(1)} | Price ${priceLine}`,
      `Liq $${formatShortNumber(pair.liquidity?.usd || 0)} | Vol5m $${formatShortNumber(pair.volume?.m5 || 0)} | MCap $${formatShortNumber(pair.marketCap || 0)} | Buys/Sells 5m ${buys}/${sells} (${buySellRatio}x)${warningLine}`,
      creatorWhaleLine,
      `${socialLinks ? `🔗 ${socialLinks} | ` : ""}📊 [DexScreener](${pair.url}) | \`${mint}\``,
    ]
      .filter(Boolean)
      .join("\n");
  }

  private formatCreatorWhaleLine(metrics: TokenMetrics): string | null {
    if (!metrics.creatorIsWhale || !metrics.creatorAddress) return null;
    const holdPct = metrics.creatorHoldPct;
    if (holdPct === undefined || !Number.isFinite(holdPct)) return null;
    const shortAddress = `${metrics.creatorAddress.slice(0, 6)}...${metrics.creatorAddress.slice(-4)}`;
    return `🐋 Creator wallet ${holdPct.toFixed(2)}% | \`${shortAddress}\``;
  }

  private async getSolPriceUsd(): Promise<number> {
    const cached = this.solPriceCache;
    if (cached && Date.now() - cached.timestamp < SOL_PRICE_CACHE_MS) {
      return cached.value;
    }

    const pair = await this.dexProvider.getPairByMint(WSOL_MINT);
    const price = pair?.priceUsd ? parseFloat(pair.priceUsd) : Number.NaN;
    const value = Number.isFinite(price) && price > 0 ? price : SOL_PRICE_FALLBACK_USD;

    this.solPriceCache = { value, timestamp: Date.now() };
    return value;
  }

  private canSendDisclawAlert(guildId: string, type: DisclawAlertType): boolean {
    const last = this.lastDisclawAlertAt.get(guildId)?.[type];
    if (!last) return true;
    return Date.now() - last >= DISCLAW_ALERT_COOLDOWN_MS;
  }

  private markDisclawAlertSent(guildId: string, type: DisclawAlertType): void {
    const entry = this.lastDisclawAlertAt.get(guildId) ?? {};
    entry[type] = Date.now();
    this.lastDisclawAlertAt.set(guildId, entry);
  }

  private formatDisclawAlert(
    pair: DexScreenerPair,
    type: DisclawAlertType,
    avgBuySol?: number,
    mention = "@everyone"
  ): string {
    const price = parseFloat(pair.priceUsd) || 0;
    const priceChangeM5 = pair.priceChange?.m5 ?? 0;
    const volumeM5 = pair.volume?.m5 ?? 0;
    const buys = pair.txns?.m5?.buys ?? 0;
    const sells = pair.txns?.m5?.sells ?? 0;
    const buySellRatio = sells > 0 ? buys / sells : buys > 0 ? Number.POSITIVE_INFINITY : 0;
    const ratioLabel = sells > 0 ? `${buySellRatio.toFixed(2)}x` : buys > 0 ? "∞" : "0x";
    const priceLine = `${formatUsdPrice(price)} (${priceChangeM5 >= 0 ? "+" : ""}${priceChangeM5.toFixed(1)}% 5m)`;
    const dexUrl = pair.url || `https://dexscreener.com/solana/${DISCLAW_MINT}`;
    const title = type === "pump" ? "🚀 **$DISCLAW PUMPING**" : "🐋 **$DISCLAW MAJOR BUY**";
    const extra =
      type === "major_buy" && avgBuySol && Number.isFinite(avgBuySol)
        ? ` | Est. avg buy ${avgBuySol.toFixed(1)} SOL`
        : "";

    return [
      `${mention} ${title} | Price ${priceLine}`,
      `Vol5m $${formatShortNumber(volumeM5)} | Buys/Sells 5m ${buys}/${sells} (${ratioLabel}) | Liq $${formatShortNumber(pair.liquidity?.usd || 0)}${extra}`,
      `CA: \`${DISCLAW_MINT}\` | 📊 [DexScreener](${dexUrl})`,
    ].join("\n");
  }

  private async checkDisclawAlerts(): Promise<void> {
    if (this.disclawAlertRunning) return;
    this.disclawAlertRunning = true;

    try {
      const storage = getStorage();
      const guilds = await storage.getAllGuilds();
      if (guilds.length === 0) return;

      const pair = await this.dexProvider.getPairByMint(DISCLAW_MINT);
      if (!pair || !pair.priceUsd) return;

      const priceChangeM5 = pair.priceChange?.m5 ?? 0;
      const volumeM5 = pair.volume?.m5 ?? 0;
      const buys = pair.txns?.m5?.buys ?? 0;
      const sells = pair.txns?.m5?.sells ?? 0;
      const buySellRatio = sells > 0 ? buys / sells : buys > 0 ? Number.POSITIVE_INFINITY : 0;

      let alertType: DisclawAlertType | null = null;
      let avgBuySol: number | undefined;

      const pumpTriggered =
        priceChangeM5 >= DISCLAW_PUMP_PRICE_CHANGE_M5 &&
        volumeM5 >= DISCLAW_PUMP_MIN_VOLUME_M5;

      if (pumpTriggered) {
        alertType = "pump";
      } else {
        const solPriceUsd = await this.getSolPriceUsd();
        const majorBuyUsd = solPriceUsd * DISCLAW_MAJOR_BUY_SOL;
        const avgBuyUsd = buys > 0 ? volumeM5 / buys : 0;
        avgBuySol = solPriceUsd > 0 ? avgBuyUsd / solPriceUsd : undefined;

        const majorBuyTriggered =
          priceChangeM5 >= 0 &&
          buys >= DISCLAW_MAJOR_BUY_MIN_BUYS &&
          buySellRatio >= DISCLAW_MAJOR_BUY_MIN_BUY_SELL_RATIO &&
          avgBuyUsd >= majorBuyUsd;

        if (majorBuyTriggered) {
          alertType = "major_buy";
        }
      }

      if (!alertType) return;

      for (const guild of guilds) {
        if (!guild.channelId) continue;
        if (!this.canSendDisclawAlert(guild.guildId, alertType)) continue;

        const mention =
          guild.alertMention === "here" ? "@here"
          : guild.alertMention === "none" ? ""
          : "@everyone";
        const message = this.formatDisclawAlert(pair, alertType, avgBuySol, mention);
        const success = await this.sendDiscordMessage(guild.channelId, message);
        if (success) {
          this.markDisclawAlertSent(guild.guildId, alertType);
        }
      }
    } catch (error) {
      console.error("❌ Failed to check DISCLAW alerts:", error);
    } finally {
      this.disclawAlertRunning = false;
    }
  }

  private shouldTriggerBonus(
    performance: CallPerformance,
    pair: DexScreenerPair,
    roiPct: number
  ): boolean {
    if (performance.callPrice <= 0) return false;
    const priceChangeM5 = pair.priceChange?.m5 ?? 0;
    const volumeM5 = pair.volume?.m5 ?? 0;
    const buys = pair.txns?.m5?.buys ?? 0;
    const sells = pair.txns?.m5?.sells ?? 0;
    const buySellRatio = sells > 0 ? buys / sells : buys > 0 ? Number.POSITIVE_INFINITY : 0;

    return (
      roiPct >= BONUS_MIN_GAIN_PCT &&
      priceChangeM5 >= BONUS_MIN_PRICE_CHANGE_M5 &&
      volumeM5 >= BONUS_MIN_VOLUME_M5 &&
      buySellRatio >= BONUS_MIN_BUY_SELL_RATIO
    );
  }

  private formatBonusAlert(
    performance: CallPerformance,
    pair: DexScreenerPair,
    roiPct: number
  ): string {
    const price = parseFloat(pair.priceUsd) || performance.lastPrice;
    const priceChangeM5 = pair.priceChange?.m5 ?? 0;
    const volumeM5 = pair.volume?.m5 ?? 0;
    const buys = pair.txns?.m5?.buys ?? 0;
    const sells = pair.txns?.m5?.sells ?? 0;
    const buySellRatio = sells > 0 ? buys / sells : buys > 0 ? Number.POSITIVE_INFINITY : 0;
    const ratioLabel = sells > 0 ? `${buySellRatio.toFixed(2)}x` : buys > 0 ? "∞" : "0x";

    return [
      `⚡ **BONUS BUYING POWER** | **$${performance.tokenSymbol}** +${roiPct.toFixed(1)}% since call`,
      `Price ${formatUsdPrice(price)} (${priceChangeM5 >= 0 ? "+" : ""}${priceChangeM5.toFixed(1)}% 5m) | Buys/Sells 5m ${buys}/${sells} (${ratioLabel}) | Vol5m $${formatShortNumber(volumeM5)} | ATH ${formatUsdPrice(performance.athPrice || price)}`,
      `📊 [DexScreener](${pair.url}) | \`${performance.callId}\``,
    ].join("\n");
  }

  private async updateCallPerformances(): Promise<void> {
    if (this.performanceRunning) return;
    this.performanceRunning = true;

    try {
      const storage = getStorage();
      const guilds = await storage.getAllGuilds();
      const since = new Date(Date.now() - PERFORMANCE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

      for (const guild of guilds) {
        const performances = await storage.getCallPerformancesSince(
          guild.guildId,
          since,
          PERFORMANCE_LOG_LIMIT
        );

        if (performances.length === 0) {
          continue;
        }

        for (const performance of performances) {
          if (!performance.tokenAddress || performance.callPrice <= 0) {
            continue;
          }

          const pair = await this.dexProvider.getPairByMint(performance.tokenAddress);
          if (!pair || !pair.priceUsd) {
            continue;
          }

          const currentPrice = parseFloat(pair.priceUsd);
          if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
            continue;
          }

          const updated: CallPerformance = {
            ...performance,
            lastPrice: currentPrice,
            lastCheckedAt: new Date(),
          };

          if (currentPrice > performance.athPrice) {
            updated.athPrice = currentPrice;
            updated.athAt = new Date();
          }

          const roiPct = ((currentPrice - performance.callPrice) / performance.callPrice) * 100;

          if (!performance.bonusAlertSent && this.shouldTriggerBonus(performance, pair, roiPct)) {
            const channelId = performance.channelId || guild.channelId;
            if (channelId) {
              const message = this.formatBonusAlert(updated, pair, roiPct);
              const success = await this.sendDiscordMessage(channelId, message);
              if (success) {
                updated.bonusAlertSent = true;
                updated.bonusAlertAt = new Date();
              }
            }
          }

          await storage.upsertCallPerformance(updated);
        }
      }
    } catch (error) {
      console.error("❌ Failed to update call performance:", error);
    } finally {
      this.performanceRunning = false;
    }
  }

  async scanAndNotify(): Promise<{ sent: number; candidates: number }> {
    const scanStart = new Date().toISOString();
    console.log(`\n🔍 [${scanStart}] Starting autopost scan cycle...`);
    
    const storage = getStorage();
    const guilds = await storage.getAllGuilds();
    console.log(`📋 Found ${guilds.length} total guilds in storage`);
    
    // Scan for new graduations
    console.log(`🎓 Scanning for PumpFun graduations...`);
    const candidates = await this.watcher.scanForGraduations(DEFAULT_GRADUATION_FILTER);
    console.log(`📊 Found ${candidates.length} graduation candidates`);
    
    // Filter to high-potential candidates
    const highPotential = candidates.filter(
      (c) => c.passesFilter && c.score >= this.config.minScore
    );
    console.log(`✅ ${highPotential.length} candidates pass filters (minScore: ${this.config.minScore})`);

    const twitterLinked = highPotential.filter((c) => hasTwitterLink(c.pair));
    if (twitterLinked.length !== highPotential.length) {
      console.log(`🐦 ${twitterLinked.length} candidates have Twitter/X links (required)`);
    }
    
    if (twitterLinked.length > 0) {
      console.log(`🏆 High potential tokens:`);
      twitterLinked.forEach((c, i) => {
        console.log(`   ${i + 1}. $${c.graduation.symbol} | Score: ${c.score.toFixed(1)} | MCap: $${(c.pair.marketCap || 0).toLocaleString()} | Liq: $${(c.pair.liquidity?.usd || 0).toLocaleString()}`);
      });
    }

    let sent = 0;
    const autopostGuilds = guilds.filter(g => g.policy.autopostEnabled);
    console.log(`\n📢 ${autopostGuilds.length} guilds have autopost ENABLED`);
    
    if (autopostGuilds.length === 0) {
      console.log(`⚠️  No guilds have autopost enabled. Use /settings autopost enabled:true to enable.`);
    }

    // Send to all subscribed guilds with autopost enabled
    for (const guild of guilds) {
      if (!guild.policy.autopostEnabled) {
        continue;
      }
      
      console.log(`\n🏠 Processing guild: ${guild.guildName} (${guild.guildId})`);
      console.log(`   📍 Channel ID: ${guild.channelId || 'NOT SET'}`);
      
      if (!guild.channelId) {
        console.log(`   ❌ Skipping - no channel configured. Use /setchannel to set one.`);
        continue;
      }
      
      // Check quiet hours
      if (this.isQuietHours(guild)) {
        console.log(`   🌙 Skipping - quiet hours active`);
        continue;
      }

      // Check daily limit
      const today = new Date().toDateString();
      const allLogs = await storage.getCallLogs(guild.guildId);
      const callsToday = allLogs.filter(
        (log: CallLog) => new Date(log.createdAt).toDateString() === today
      ).length;
      
      console.log(`   📈 Calls today: ${callsToday}/${guild.policy.maxCallsPerDay}`);
      
      if (callsToday >= guild.policy.maxCallsPerDay) {
        console.log(`   ⏸️  Skipping - daily limit reached`);
        continue;
      }

      if (twitterLinked.length === 0) {
        console.log(`   📭 No Twitter-linked candidates to post`);
        continue;
      }

      const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
      const recentLogs = await storage.getCallLogsSince(
        guild.guildId,
        dedupeSince,
        DEDUPE_LOG_LIMIT
      );
      const recentMints = new Set(
        recentLogs
          .map((log) => log.callCard?.token?.mint)
          .filter((mint): mint is string => Boolean(mint))
      );
      if (recentMints.size > 0) {
        console.log(`   🔁 Dedupe active: ${recentMints.size} tokens posted in last ${DEDUPE_WINDOW_HOURS}h`);
      }

      for (const candidate of twitterLinked) {
        if (recentMints.has(candidate.graduation.mint)) {
          console.log(`   🔁 Skipping duplicate $${candidate.graduation.symbol} (posted in last ${DEDUPE_WINDOW_HOURS}h)`);
          continue;
        }
        console.log(`   📤 Sending call for $${candidate.graduation.symbol} to channel ${guild.channelId}...`);
        const message = this.formatGraduationCall(candidate, guild.display);
        const success = await this.sendDiscordMessage(guild.channelId, message);
        
        if (success) {
          sent++;
          console.log(`   ✅ Message sent successfully!`);
          // Log the call - use scoring to generate proper ScoringResult
          const scoringResult = scoreToken(candidate.metrics, guild.policy);
          const callCard = generateCallCard(
            candidate.metrics,
            guild.policy,
            scoringResult
          );
          
          await storage.addCallLog(guild.guildId, {
            id: `auto-${Date.now()}-${candidate.graduation.mint}`,
            guildId: guild.guildId,
            channelId: guild.channelId,
            callCard,
            triggeredBy: "auto",
            createdAt: new Date(),
          });
          await storage.upsertCallPerformance({
            callId: callCard.callId,
            guildId: guild.guildId,
            channelId: guild.channelId,
            tokenAddress: callCard.token.mint,
            tokenSymbol: callCard.token.symbol,
            callPrice: callCard.metrics.price,
            callAt: callCard.timestamp,
            athPrice: callCard.metrics.price,
            athAt: callCard.timestamp,
            lastPrice: callCard.metrics.price,
            lastCheckedAt: callCard.timestamp,
            bonusAlertSent: false,
          });
          recentMints.add(candidate.graduation.mint);
        } else {
          console.log(`   ❌ Failed to send message - check bot permissions`);
        }
      }
    }

    console.log(`\n📊 Scan complete: ${sent} messages sent for ${twitterLinked.length} candidates`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    return { sent, candidates: highPotential.length };
  }

  private isQuietHours(guild: GuildConfig): boolean {
    if (guild.policy.quietHoursStart === undefined) return false;
    if (guild.policy.quietHoursEnd === undefined) return false;

    const hour = new Date().getUTCHours();
    const start = guild.policy.quietHoursStart;
    const end = guild.policy.quietHoursEnd;

    if (start < end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  }

  start() {
    if (this.intervalId) {
      console.log('⚠️  Autopost service already running');
      return;
    }
    
    console.log('🚀 Starting Autopost Service...');
    console.log(`   ⏱️  Scan interval: ${this.config.intervalMs / 1000}s`);
    console.log(`   📊 Min score threshold: ${this.config.minScore}`);
    console.log(`   🔑 Discord token: ${process.env.DISCORD_BOT_TOKEN ? 'SET' : 'MISSING'}`);
    
    this.config.enabled = true;
    this.intervalId = setInterval(
      () => this.scanAndNotify(),
      this.config.intervalMs
    );

    this.performanceIntervalId = setInterval(
      () => this.updateCallPerformances(),
      PERFORMANCE_INTERVAL_MS
    );

    this.disclawIntervalId = setInterval(
      () => this.checkDisclawAlerts(),
      DISCLAW_ALERT_INTERVAL_MS
    );
    
    // Run immediately
    console.log('🔄 Running initial scan...');
    this.scanAndNotify();
    console.log('📈 Running initial performance check...');
    this.updateCallPerformances();
    console.log('🐋 Running initial DISCLAW alert check...');
    this.checkDisclawAlerts();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.performanceIntervalId) {
      clearInterval(this.performanceIntervalId);
      this.performanceIntervalId = null;
    }
    if (this.disclawIntervalId) {
      clearInterval(this.disclawIntervalId);
      this.disclawIntervalId = null;
    }
    this.config.enabled = false;
  }

  isRunning(): boolean {
    return this.config.enabled && this.intervalId !== null;
  }
}

// Singleton instance for the app
let autopostInstance: AutopostService | null = null;

export function getAutopostService(): AutopostService {
  if (!autopostInstance) {
    autopostInstance = new AutopostService();
  }
  return autopostInstance;
}
