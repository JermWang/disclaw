import { Client, GatewayIntentBits, Events, REST, Routes, ActivityType } from 'discord.js';
import type { CallPerformance, DexScreenerPair, DisplaySettings, GuildConfig } from '../lib/disclaw/types';
import { createPolicy } from '../lib/disclaw/policies';
import { getStorage } from '../lib/disclaw/storage';
import { getAutopostService } from '../lib/disclaw/autopost-service';
import { DexScreenerProvider } from '../lib/disclaw/dexscreener-provider';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID!;

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

if (!DISCORD_APPLICATION_ID) {
  console.error('❌ DISCORD_APPLICATION_ID is required');
  process.exit(1);
}

const BOT_START_TIME = Date.now();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = [
  {
    name: 'disclaw',
    description: 'DISCLAW whale tracker & signal caller commands',
    options: [
      {
        name: 'scan',
        description: 'Scan for new PumpFun graduations',
        type: 1,
        options: [
          {
            name: 'window',
            description: 'Time window to scan',
            type: 3,
            required: false,
            choices: [
              { name: 'Last 1 hour', value: '1h' },
              { name: 'Last 8 hours', value: '8h' },
              { name: 'Last 24 hours', value: '24h' },
            ],
          },
          {
            name: 'source',
            description: 'Show live scans or posted calls',
            type: 3,
            required: false,
            choices: [
              { name: 'Live scans', value: 'live' },
              { name: 'Posted calls', value: 'posted' },
            ],
          },
        ],
      },
      {
        name: 'leaderboard',
        description: 'Show top calls by ATH performance',
        type: 1,
        options: [
          {
            name: 'period',
            description: 'Time window for rankings',
            type: 3,
            required: false,
            choices: [
              { name: 'Last 24h', value: '24h' },
              { name: 'Last 7d', value: '7d' },
              { name: 'Last 30d', value: '30d' },
            ],
          },
        ],
      },
      {
        name: 'digest',
        description: 'Summarize call performance',
        type: 1,
        options: [
          {
            name: 'period',
            description: 'Digest window',
            type: 3,
            required: false,
            choices: [
              { name: 'Daily (24h)', value: '24h' },
              { name: 'Weekly (7d)', value: '7d' },
            ],
          },
        ],
      },
      {
        name: 'meta',
        description: 'View current meta trends',
        type: 1,
        options: [
          {
            name: 'window',
            description: 'Time window to sample',
            type: 3,
            required: false,
            choices: [
              { name: 'Last 6h', value: '6h' },
              { name: 'Last 24h', value: '24h' },
              { name: 'Last 7d', value: '7d' },
            ],
          },
        ],
      },
      {
        name: 'policy',
        description: 'View or change the active policy',
        type: 1,
        options: [
          {
            name: 'preset',
            description: 'Policy preset to use',
            type: 3,
            required: false,
            choices: [
              { name: 'Default', value: 'default' },
              { name: 'Aggressive', value: 'aggressive' },
              { name: 'Conservative', value: 'conservative' },
            ],
          },
        ],
      },
      {
        name: 'help',
        description: 'Show help information',
        type: 1,
      },
      {
        name: 'status',
        description: 'Show bot health: uptime, last scan, Supabase connection',
        type: 1,
      },
    ],
  },
  {
    name: 'settings',
    description: 'Configure call/signal message settings',
    options: [
      {
        name: 'view',
        description: 'View current settings',
        type: 1,
      },
      {
        name: 'minscore',
        description: 'Set minimum score for calls (1-10)',
        type: 1,
        options: [
          {
            name: 'score',
            description: 'Minimum score threshold',
            type: 4, // INTEGER
            required: true,
            min_value: 1,
            max_value: 10,
          },
        ],
      },
      {
        name: 'autopost',
        description: 'Enable or disable automatic posting',
        type: 1,
        options: [
          {
            name: 'enabled',
            description: 'Enable autopost',
            type: 5, // BOOLEAN
            required: true,
          },
        ],
      },
      {
        name: 'display',
        description: 'Configure what info to show in calls',
        type: 1,
        options: [
          {
            name: 'volume',
            description: 'Show volume data',
            type: 5,
            required: false,
          },
          {
            name: 'holders',
            description: 'Show holder count',
            type: 5,
            required: false,
          },
          {
            name: 'links',
            description: 'Show DexScreener links',
            type: 5,
            required: false,
          },
          {
            name: 'creator_whale',
            description: 'Show creator whale wallets',
            type: 5,
            required: false,
          },
        ],
      },
      {
        name: 'ping',
        description: 'Set who gets pinged on DISCLAW token alerts (@everyone, @here, or none)',
        type: 1,
        options: [
          {
            name: 'type',
            description: 'Ping type for token pump/buy alerts',
            type: 3,
            required: true,
            choices: [
              { name: '@everyone (default)', value: 'everyone' },
              { name: '@here (online only)', value: 'here' },
              { name: 'No ping', value: 'none' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'setchannel',
    description: 'Set which channel DISCLAW posts calls to',
    options: [
      {
        name: 'channel',
        description: 'The channel for call alerts',
        type: 7, // CHANNEL
        required: true,
        channel_types: [0], // Text channels only
      },
    ],
  },
];

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  minScore: 6.5,
  showVolume: true,
  showHolders: true,
  showLinks: true,
  showCreatorWhale: false,
};

const LEADERBOARD_DEFAULT_LIMIT = 5;
const PERFORMANCE_LIMIT = 200;
const META_SAMPLE_LIMIT = 3;

const META_TAGS: Array<{ name: string; keywords: string[]; labels?: string[] }> = [
  { name: 'AI', keywords: ['ai', 'agent', 'gpt', 'llm', 'neural', 'bot'], labels: ['ai'] },
  { name: 'Meme', keywords: ['meme', 'dog', 'cat', 'pepe', 'bonk', 'wif', 'frog'], labels: ['meme'] },
  { name: 'Gaming', keywords: ['game', 'gaming', 'play', 'quest', 'guild', 'arcade'], labels: ['gaming', 'gamefi'] },
  { name: 'DeFi', keywords: ['defi', 'swap', 'dex', 'yield', 'farm', 'stake', 'lending', 'perp'], labels: ['defi', 'dex', 'amm', 'lending', 'perp'] },
  { name: 'Infra', keywords: ['infra', 'oracle', 'data', 'node', 'rpc', 'index', 'sdk', 'bridge'], labels: ['infra', 'oracle', 'bridge'] },
  { name: 'Social', keywords: ['social', 'chat', 'creator', 'fan', 'community', 'club'], labels: ['social'] },
];

function ensureDisplaySettings(config: GuildConfig): DisplaySettings {
  if (!config.display) {
    config.display = {
      minScore: config.policy.thresholds.minConfidenceScore ?? DEFAULT_DISPLAY_SETTINGS.minScore,
      showVolume: DEFAULT_DISPLAY_SETTINGS.showVolume,
      showHolders: DEFAULT_DISPLAY_SETTINGS.showHolders,
      showLinks: DEFAULT_DISPLAY_SETTINGS.showLinks,
      showCreatorWhale: DEFAULT_DISPLAY_SETTINGS.showCreatorWhale,
    };
  }
  return config.display;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatAgeLabel(date: Date): string {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getPerformanceWindow(period: string | null): { minutes: number; label: string } {
  switch (period) {
    case '7d':
      return { minutes: 10080, label: 'last 7d' };
    case '30d':
      return { minutes: 43200, label: 'last 30d' };
    case '24h':
    default:
      return { minutes: 1440, label: 'last 24h' };
  }
}

function getMetaWindow(period: string | null): { minutes: number; label: string } {
  switch (period) {
    case '7d':
      return { minutes: 10080, label: 'last 7d' };
    case '6h':
      return { minutes: 360, label: 'last 6h' };
    case '24h':
    default:
      return { minutes: 1440, label: 'last 24h' };
  }
}

function getRoiPct(performance: CallPerformance): number | null {
  if (!performance.callPrice || performance.callPrice <= 0) return null;
  if (!performance.athPrice || performance.athPrice <= 0) return null;
  return ((performance.athPrice - performance.callPrice) / performance.callPrice) * 100;
}

function classifyMeta(pair: DexScreenerPair): string[] {
  const text = `${pair.baseToken.symbol} ${pair.baseToken.name}`.toLowerCase();
  const labels = (pair.labels || []).map((label) => label.toLowerCase());
  const categories: string[] = [];

  META_TAGS.forEach((tag) => {
    const keywordMatch = tag.keywords.some((keyword) => text.includes(keyword));
    const labelMatch = tag.labels?.some((label) =>
      labels.some((entry) => entry.includes(label))
    );
    if (keywordMatch || labelMatch) {
      categories.push(tag.name);
    }
  });

  return categories;
}

async function getOrCreateGuildConfig(options: {
  guildId: string;
  guildName?: string | null;
  channelId?: string | null;
  channelName?: string | null;
  userId?: string | null;
}): Promise<GuildConfig> {
  const storage = getStorage();
  const existing = await storage.getGuildConfig(options.guildId);

  if (existing) {
    const hadDisplay = Boolean(existing.display);
    ensureDisplaySettings(existing);
    if (!hadDisplay) {
      await storage.saveGuildConfig(existing);
    }
    return existing;
  }

  const config: GuildConfig = {
    guildId: options.guildId,
    guildName: options.guildName || 'Server',
    channelId: options.channelId || '',
    channelName: options.channelName || 'channel',
    policy: createPolicy(options.guildId, 'momentum'),
    watchlist: [],
    adminUsers: options.userId ? [options.userId] : [],
    requireMention: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    callCount: 0,
    display: {
      minScore: DEFAULT_DISPLAY_SETTINGS.minScore,
      showVolume: DEFAULT_DISPLAY_SETTINGS.showVolume,
      showHolders: DEFAULT_DISPLAY_SETTINGS.showHolders,
      showLinks: DEFAULT_DISPLAY_SETTINGS.showLinks,
      showCreatorWhale: DEFAULT_DISPLAY_SETTINGS.showCreatorWhale,
    },
  };

  await storage.saveGuildConfig(config);
  return config;
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(DISCORD_APPLICATION_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

interface GraduationResult {
  tokenAddress: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  pairCreatedAt: number;
  url: string;
  ageMinutes: number;
  socials: SocialLink[];
}

interface SocialLink {
  label: string;
  url: string;
}

const SOCIAL_PRIORITY = ['twitter', 'telegram', 'discord', 'medium', 'github', 'reddit'];
const SOCIAL_LABELS: Record<string, string> = {
  twitter: 'X',
  telegram: 'Telegram',
  discord: 'Discord',
  medium: 'Medium',
  github: 'GitHub',
  reddit: 'Reddit',
};

function normalizeSocialType(type?: string): string {
  const normalized = (type || '').toLowerCase();
  if (normalized === 'x') {
    return 'twitter';
  }
  return normalized;
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
    ordered.push({ label: 'Website', url: websiteUrl });
  }

  return ordered.slice(0, 4);
}

const manualDexProvider = new DexScreenerProvider();

async function scanGraduations(windowMinutes = 60): Promise<GraduationResult[]> {
  try {
    const limit = windowMinutes >= 1440 ? 250 : windowMinutes >= 480 ? 200 : 120;
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    const pairs = await manualDexProvider.getLatestPumpFunGraduations(limit);

    return pairs
      .filter((pair) => pair.pairCreatedAt && pair.pairCreatedAt >= cutoff)
      .filter((pair) => (pair.liquidity?.usd || 0) > 5000)
      .map((pair) => ({
        tokenAddress: pair.baseToken?.address || '',
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        priceUsd: pair.priceUsd || '0',
        marketCap: pair.marketCap || 0,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        pairCreatedAt: pair.pairCreatedAt || 0,
        url: pair.url || `https://dexscreener.com/solana/${pair.baseToken?.address}`,
        ageMinutes: Math.floor((Date.now() - (pair.pairCreatedAt || 0)) / 60000),
        socials: extractSocialLinks(pair),
      }))
      .sort((a, b) => {
        const aHasSocials = a.socials.length > 0 ? 1 : 0;
        const bHasSocials = b.socials.length > 0 ? 1 : 0;
        if (aHasSocials !== bHasSocials) {
          return bHasSocials - aHasSocials;
        }
        return b.pairCreatedAt - a.pairCreatedAt;
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Scan error:', error);
    return [];
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Bot is online as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);
  
  c.user.setActivity('for graduations', { type: ActivityType.Watching });
  
  await registerCommands();

  // Start the autopost service to scan for graduations and post calls automatically
  const autopostService = getAutopostService();
  autopostService.start();
  console.log('🔄 Autopost service started - scanning every 60 seconds');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'disclaw') {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'scan') {
      await interaction.deferReply();
      
      try {
        const window = interaction.options.getString('window') || '1h';
        const source = interaction.options.getString('source') || 'live';
        const windowMinutes = window === '24h' ? 1440 : window === '8h' ? 480 : 60;
        const windowLabel = window === '1h' ? 'last hour' : `last ${windowMinutes / 60} hours`;

        if (source === 'posted') {
          if (!interaction.guildId) {
            await interaction.editReply('❌ Posted call history is only available in a server.');
            return;
          }

          const storage = getStorage();
          const since = new Date(Date.now() - windowMinutes * 60 * 1000);
          const logs = await storage.getCallLogsSince(interaction.guildId, since, 25);

          if (logs.length === 0) {
            await interaction.editReply(`📭 No calls posted in the ${windowLabel}.`);
            return;
          }

          const messages = logs.slice(0, 10).map((log, i) => {
            const card = log.callCard;
            const symbol = card?.token?.symbol || 'UNKNOWN';
            const mint = card?.token?.mint || '';
            const confidence = card?.confidence ?? 0;
            const liquidity = card?.metrics?.liquidity ?? 0;
            const liqFormatted = liquidity >= 1000000
              ? `$${(liquidity / 1000000).toFixed(2)}M`
              : `$${(liquidity / 1000).toFixed(0)}K`;
            const ageMinutes = Math.max(0, Math.floor((Date.now() - log.createdAt.getTime()) / 60000));
            const ageLabel = ageMinutes >= 60
              ? `${Math.floor(ageMinutes / 60)}h`
              : `${ageMinutes}m`;
            const sourceLabel = log.triggeredBy === 'auto'
              ? 'auto'
              : log.triggeredBy === 'mention'
                ? 'mention'
                : 'manual';
            const dexUrl = mint ? `https://dexscreener.com/solana/${mint}` : '';

            return [
              `**${i + 1}. $${symbol}** — ${ageLabel} ago (${sourceLabel})`,
              `   ⭐ Score: ${confidence.toFixed(1)} | 💧 Liq: ${liqFormatted}`,
              dexUrl ? `   📊 [DexScreener](${dexUrl}) | \`${mint.slice(0, 6)}...${mint.slice(-4)}\`` : null,
            ]
              .filter(Boolean)
              .join('\n');
          });

          await interaction.editReply({
            content: [
              `📌 **Posted Calls** (${windowLabel})`,
              '',
              messages.join('\n\n'),
              '',
              `_Found ${logs.length} posted call${logs.length !== 1 ? 's' : ''} in the ${windowLabel}_`,
            ].join('\n'),
          });
          return;
        }

        const graduations = await scanGraduations(windowMinutes);
        
        if (graduations.length === 0) {
          await interaction.editReply(`📭 No graduations found in the ${windowLabel}.`);
          return;
        }
        
        const top5 = graduations.slice(0, 5);
        const messages = top5.map((g, i) => {
          const mcapFormatted = g.marketCap >= 1000000 
            ? `$${(g.marketCap / 1000000).toFixed(2)}M` 
            : `$${(g.marketCap / 1000).toFixed(0)}K`;
          const liqFormatted = `$${(g.liquidity / 1000).toFixed(0)}K`;
          const socialLinks = g.socials
            .map((social) => `[${social.label}](${social.url})`)
            .join(' • ');
          
          return [
            `**${i + 1}. $${g.symbol}** — ${g.ageMinutes}m ago`,
            `   💰 MCap: ${mcapFormatted} | 💧 Liq: ${liqFormatted}`,
            socialLinks ? `   🔗 ${socialLinks}` : null,
            `   📊 [DexScreener](${g.url}) | \`${g.tokenAddress.slice(0, 6)}...${g.tokenAddress.slice(-4)}\``,
          ]
            .filter(Boolean)
            .join('\n');
        });
        
        await interaction.editReply({
          content: [
            `🎓 **Recent Graduations** (${windowLabel})`,
            '',
            messages.join('\n\n'),
            '',
            `_Found ${graduations.length} graduation${graduations.length !== 1 ? 's' : ''} in the ${windowLabel}_`,
          ].join('\n'),
        });
      } catch (error) {
        console.error('Scan error:', error);
        await interaction.editReply('❌ Failed to scan. Please try again.');
      }
    }

    if (subcommand === 'leaderboard') {
      if (!interaction.guildId) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
        return;
      }

      await interaction.deferReply();

      const period = interaction.options.getString('period');
      const { minutes, label } = getPerformanceWindow(period);
      const since = new Date(Date.now() - minutes * 60 * 1000);
      const storage = getStorage();
      const performances = await storage.getCallPerformancesSince(
        interaction.guildId,
        since,
        PERFORMANCE_LIMIT
      );

      const scored = performances
        .map((performance) => {
          const roi = getRoiPct(performance);
          return roi === null ? null : { performance, roi };
        })
        .filter((entry): entry is { performance: CallPerformance; roi: number } => Boolean(entry))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, LEADERBOARD_DEFAULT_LIMIT);

      if (scored.length === 0) {
        await interaction.editReply(`📭 No performance data tracked in the ${label}.`);
        return;
      }

      const lines = scored.map((entry, i) => {
        const perf = entry.performance;
        const symbol = perf.tokenSymbol || 'UNKNOWN';
        const mint = perf.tokenAddress;
        const dexUrl = mint ? `https://dexscreener.com/solana/${mint}` : '';

        return [
          `**${i + 1}. $${symbol}** ${formatPercent(entry.roi)} ATH`,
          `   call ${formatUsd(perf.callPrice)} → ${formatUsd(perf.athPrice)} | ${formatAgeLabel(perf.callAt)} ago`,
          dexUrl ? `   📊 [DexScreener](${dexUrl}) | \`${mint.slice(0, 6)}...${mint.slice(-4)}\`` : null,
        ]
          .filter(Boolean)
          .join('\n');
      });

      await interaction.editReply({
        content: [
          `🏆 **Top Calls (${label})**`,
          '',
          lines.join('\n\n'),
          '',
          `_Tracked ${performances.length} call${performances.length !== 1 ? 's' : ''} in the ${label}_`,
        ].join('\n'),
      });
    }

    if (subcommand === 'digest') {
      if (!interaction.guildId) {
        await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
        return;
      }

      await interaction.deferReply();

      const period = interaction.options.getString('period');
      const { minutes, label } = getPerformanceWindow(period || '24h');
      const since = new Date(Date.now() - minutes * 60 * 1000);
      const storage = getStorage();
      const performances = await storage.getCallPerformancesSince(
        interaction.guildId,
        since,
        PERFORMANCE_LIMIT
      );

      const scored = performances
        .map((performance) => {
          const roi = getRoiPct(performance);
          return roi === null ? null : { performance, roi };
        })
        .filter((entry): entry is { performance: CallPerformance; roi: number } => Boolean(entry))
        .sort((a, b) => b.roi - a.roi);

      if (scored.length === 0) {
        await interaction.editReply(`📭 No performance data tracked in the ${label}.`);
        return;
      }

      const avgRoi = scored.reduce((sum, entry) => sum + entry.roi, 0) / scored.length;
      const best = scored[0];
      const bestLabel = best
        ? `$${best.performance.tokenSymbol} ${formatPercent(best.roi)}`
        : 'N/A';
      const topLines = scored.slice(0, 3).map((entry, i) => {
        const perf = entry.performance;
        return `**${i + 1}. $${perf.tokenSymbol}** ${formatPercent(entry.roi)} | ${formatUsd(perf.callPrice)} → ${formatUsd(perf.athPrice)}`;
      });

      await interaction.editReply({
        content: [
          `📊 **Performance Digest (${label})**`,
          '',
          `Calls tracked: ${performances.length}`,
          `Avg ATH ROI: ${formatPercent(avgRoi)} | Best: ${bestLabel}`,
          '',
          '**Top performers:**',
          topLines.join('\n'),
        ].join('\n'),
      });
    }

    if (subcommand === 'meta') {
      await interaction.deferReply();

      const window = interaction.options.getString('window');
      const { minutes, label } = getMetaWindow(window);
      const cutoff = Date.now() - minutes * 60 * 1000;
      const limit = minutes >= 10080 ? 250 : minutes >= 1440 ? 200 : 120;
      const pairs = await manualDexProvider.getLatestPumpFunGraduations(limit);
      const filtered = pairs
        .filter((pair) => pair.pairCreatedAt && pair.pairCreatedAt >= cutoff)
        .filter((pair) => (pair.liquidity?.usd || 0) > 5000);

      if (filtered.length === 0) {
        await interaction.editReply(`📭 No recent launches found in the ${label}.`);
        return;
      }

      const buckets = new Map<string, { count: number; samples: string[] }>();
      let unclassified = 0;

      filtered.forEach((pair) => {
        const categories = classifyMeta(pair);
        if (categories.length === 0) {
          unclassified += 1;
          return;
        }
        categories.forEach((category) => {
          const entry = buckets.get(category) || { count: 0, samples: [] };
          entry.count += 1;
          const symbol = pair.baseToken.symbol || 'UNKNOWN';
          if (entry.samples.length < META_SAMPLE_LIMIT && !entry.samples.includes(symbol)) {
            entry.samples.push(symbol);
          }
          buckets.set(category, entry);
        });
      });

      const ranked = Array.from(buckets.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 6);

      if (ranked.length === 0) {
        await interaction.editReply(`📭 No dominant themes detected in the ${label}.`);
        return;
      }

      const lines = ranked.map(([category, entry], index) => {
        const samples = entry.samples.length
          ? ` (${entry.samples.map((symbol) => `$${symbol}`).join(', ')})`
          : '';
        return `${index + 1}. **${category}** — ${entry.count} token${entry.count !== 1 ? 's' : ''}${samples}`;
      });

      const tail = unclassified > 0 ? `Unclassified: ${unclassified}` : null;

      await interaction.editReply({
        content: [
          `📈 **Meta Trend Snapshot (${label})**`,
          '',
          lines.join('\n'),
          '',
          `Sampled ${filtered.length} launches${tail ? ` | ${tail}` : ''}`,
        ].join('\n'),
      });
    }
    
    if (subcommand === 'policy') {
      const preset = interaction.options.getString('preset');
      
      if (preset) {
        await interaction.reply(`✅ Policy set to **${preset}**`);
      } else {
        await interaction.reply([
          '📋 **Current Policy: Default**',
          '',
          'Available presets:',
          '• `default` — Balanced settings',
          '• `aggressive` — Early entry, higher risk',
          '• `conservative` — Safer plays',
          '',
          'Use `/disclaw policy preset:<name>` to change.',
        ].join('\n'));
      }
    }
    
    if (subcommand === 'status') {
      await interaction.deferReply({ ephemeral: true });

      const autopostService = getAutopostService();
      const storage = getStorage();

      // Uptime
      const uptimeMs = Date.now() - BOT_START_TIME;
      const uptimeMins = Math.floor(uptimeMs / 60000);
      const uptimeHours = Math.floor(uptimeMins / 60);
      const uptimeLabel = uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMins % 60}m`
        : `${uptimeMins}m`;

      // Supabase check
      let dbStatus = '✅ Connected';
      let totalGuilds = 0;
      let totalCalls = 0;
      try {
        const stats = await storage.getStats();
        totalGuilds = stats.totalGuilds;
        totalCalls = stats.totalCalls;
      } catch {
        dbStatus = '❌ Error';
      }

      // Guild-specific info
      let guildInfo = '';
      if (interaction.guildId) {
        const config = await storage.getGuildConfig(interaction.guildId);
        if (config) {
          const channelMention = config.channelId ? `<#${config.channelId}>` : 'Not set';
          const autopostStatus = config.policy.autopostEnabled ? '✅ On' : '❌ Off';
          const watchlistCount = config.watchlist?.length ?? 0;
          guildInfo = [
            '',
            '**This Server:**',
            `• Channel: ${channelMention}`,
            `• Autopost: ${autopostStatus}`,
            `• Watchlist: ${watchlistCount} item${watchlistCount !== 1 ? 's' : ''}`,
            `• Min score: ${config.display?.minScore ?? config.policy.thresholds.minConfidenceScore}/10`,
          ].join('\n');
        }
      }

      await interaction.editReply({
        content: [
          '🦈 **DISCLAW Bot Status**',
          '',
          `🟢 **Online** | Uptime: ${uptimeLabel}`,
          `🗄️ **Database:** ${dbStatus}`,
          `🔄 **Autopost service:** ${autopostService.isRunning() ? '✅ Running' : '❌ Stopped'}`,
          `📊 **Global:** ${totalGuilds} server${totalGuilds !== 1 ? 's' : ''} | ${totalCalls} call${totalCalls !== 1 ? 's' : ''} logged`,
          guildInfo,
        ].filter(Boolean).join('\n'),
      });
    }

    if (subcommand === 'help') {
      await interaction.reply({
        content: [
          '🦈 **DISCLAW Commands**',
          '`/disclaw status` — Bot health & connection info',
          '',
          '`/disclaw scan` — Scan for new PumpFun graduations',
          '`/disclaw leaderboard` — Top calls by ATH performance',
          '`/disclaw digest` — Daily/weekly performance digest',
          '`/disclaw meta` — Trending themes from new launches',
          '`/disclaw policy` — View or change policy preset',
          '`/disclaw help` — Show this help message',
          '',
          '`/settings view` — View current settings',
          '`/settings minscore` — Set minimum score for calls',
          '`/settings autopost` — Enable/disable auto-posting',
          '`/settings display` — Configure call display options',
          '',
          '`/setchannel` — Set the channel for call alerts',
          'Reminder: Move the DISCLAW bot role above public roles so it can post.',
          '',
          '**Links:**',
          '• Website: https://disclaw.xyz',
          '• Twitter: https://x.com/DisclawSOL',
          '• Discord: https://discord.gg/NZEKBbqj2q',
          '• Telegram: https://t.me/BlueClawCallsBot',
        ].join('\n'),
        ephemeral: true,
      });
    }
  }

  // Handle /settings command
  if (interaction.commandName === 'settings') {
    if (!interaction.guildId) {
      await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      return;
    }

    const storage = getStorage();
    const config = await getOrCreateGuildConfig({
      guildId: interaction.guildId,
      guildName: interaction.guild?.name,
      channelId: interaction.channelId,
      channelName: interaction.channel && 'name' in interaction.channel ? interaction.channel.name : undefined,
      userId: interaction.user?.id,
    });
    const display = ensureDisplaySettings(config);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const channelMention = config.channelId ? `<#${config.channelId}>` : 'Not set';
      const pingLabel = config.alertMention === 'here' ? '@here'
        : config.alertMention === 'none' ? 'No ping'
        : '@everyone';
      await interaction.reply({
        content: [
          '⚙️ **DISCLAW Settings**',
          '',
          `📢 **Call Channel:** ${channelMention}`,
          `📊 **Min Score:** ${display.minScore}/10`,
          `🔄 **Autopost:** ${config.policy.autopostEnabled ? '✅ Enabled' : '❌ Disabled'}`,
          `🔔 **Alert Ping:** ${pingLabel}`,
          '',
          '**Display Options:**',
          `• Volume: ${display.showVolume ? '✅' : '❌'}`,
          `• Holders: ${display.showHolders ? '✅' : '❌'}`,
          `• Links: ${display.showLinks ? '✅' : '❌'}`,
          `• Creator whale: ${display.showCreatorWhale ? '✅' : '❌'}`,
        ].join('\n'),
        ephemeral: true,
      });
    }

    if (subcommand === 'minscore') {
      const score = interaction.options.getInteger('score', true);
      display.minScore = score;
      config.policy.thresholds.minConfidenceScore = score;
      config.updatedAt = new Date();
      await storage.saveGuildConfig(config);
      await interaction.reply({
        content: `✅ Minimum score set to **${score}/10**\n\nOnly calls with score ≥ ${score} will be posted.`,
        ephemeral: true,
      });
    }

    if (subcommand === 'autopost') {
      const enabled = interaction.options.getBoolean('enabled', true);
      config.policy.autopostEnabled = enabled;
      config.updatedAt = new Date();
      await storage.saveGuildConfig(config);
      await interaction.reply({
        content: enabled 
          ? '✅ **Autopost enabled!**\n\nDISCLAW will automatically post graduation calls to your configured channel.'
          : '❌ **Autopost disabled.**\n\nUse `/disclaw scan` to manually scan for graduations.',
        ephemeral: true,
      });
    }

    if (subcommand === 'display') {
      const volume = interaction.options.getBoolean('volume');
      const holders = interaction.options.getBoolean('holders');
      const links = interaction.options.getBoolean('links');
      const creatorWhale = interaction.options.getBoolean('creator_whale');

      if (volume !== null) display.showVolume = volume;
      if (holders !== null) display.showHolders = holders;
      if (links !== null) display.showLinks = links;
      if (creatorWhale !== null) display.showCreatorWhale = creatorWhale;
      config.updatedAt = new Date();
      await storage.saveGuildConfig(config);

      await interaction.reply({
        content: [
          '✅ **Display settings updated!**',
          '',
          `• Volume: ${display.showVolume ? '✅ Shown' : '❌ Hidden'}`,
          `• Holders: ${display.showHolders ? '✅ Shown' : '❌ Hidden'}`,
          `• Links: ${display.showLinks ? '✅ Shown' : '❌ Hidden'}`,
          `• Creator whale: ${display.showCreatorWhale ? '✅ Shown' : '❌ Hidden'}`,
        ].join('\n'),
        ephemeral: true,
      });
    }

    if (subcommand === 'ping') {
      const type = interaction.options.getString('type', true) as 'everyone' | 'here' | 'none';
      config.alertMention = type;
      config.updatedAt = new Date();
      await storage.saveGuildConfig(config);

      const label = type === 'everyone' ? '@everyone' : type === 'here' ? '@here' : 'No ping';
      await interaction.reply({
        content: `✅ **Alert ping set to: ${label}**\n\nDISCLAW token pump/buy alerts will use this setting.`,
        ephemeral: true,
      });
    }
  }

  // Handle /setchannel command
  if (interaction.commandName === 'setchannel') {
    if (!interaction.guildId) {
      await interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel', true);
    const storage = getStorage();
    const config = await getOrCreateGuildConfig({
      guildId: interaction.guildId,
      guildName: interaction.guild?.name,
      channelId: interaction.channelId,
      channelName: interaction.channel && 'name' in interaction.channel ? interaction.channel.name : undefined,
      userId: interaction.user?.id,
    });
    config.channelId = channel.id;
    config.channelName = 'name' in channel && channel.name ? channel.name : config.channelName;
    config.guildName = interaction.guild?.name || config.guildName;
    config.updatedAt = new Date();
    await storage.saveGuildConfig(config);

    await interaction.reply({
      content: [
        `✅ **Call channel set to ${channel}**`,
        '',
        'DISCLAW will post graduation alerts to this channel.',
        '',
        '**Next steps:**',
        '• Use `/settings autopost enabled:true` to enable automatic posting',
        '• Use `/settings minscore` to set minimum score threshold',
        '• Use `/disclaw scan` to manually scan for graduations',
      ].join('\n'),
    });

    console.log(`📢 Channel set for ${interaction.guild?.name}: #${channel.name} (${channel.id})`);
  }
});

client.on(Events.GuildCreate, (guild) => {
  console.log(`➕ Joined server: ${guild.name} (${guild.id})`);
});

client.on(Events.GuildDelete, (guild) => {
  console.log(`➖ Left server: ${guild.name} (${guild.id})`);
});

console.log('🚀 Starting DISCLAW bot...');
client.login(DISCORD_BOT_TOKEN);
