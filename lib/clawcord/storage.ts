import { createClient } from "@supabase/supabase-js";
import type {
  CallCard,
  CallLog,
  CallPerformance,
  DisplaySettings,
  GuildConfig,
  Policy,
  PolicyPreset,
  WatchlistItem,
} from "./types";
import { createPolicy } from "./policies";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase not configured - using in-memory storage");
}

function mapCallPerformance(row: CallPerformanceRow): CallPerformance {
  return {
    callId: row.call_id,
    guildId: row.guild_id,
    channelId: row.channel_id || "",
    tokenAddress: row.token_address,
    tokenSymbol: row.token_symbol || "UNKNOWN",
    callPrice: parseNumber(row.call_price, 0),
    callAt: row.call_at ? parseDate(row.call_at) : new Date(),
    athPrice: parseNumber(row.ath_price, 0),
    athAt: row.ath_at ? parseDate(row.ath_at) : undefined,
    lastPrice: parseNumber(row.last_price, 0),
    lastCheckedAt: row.last_checked_at ? parseDate(row.last_checked_at) : undefined,
    bonusAlertSent: row.bonus_alert_sent ?? false,
    bonusAlertAt: row.bonus_alert_at ? parseDate(row.bonus_alert_at) : undefined,
  };
}

export interface StorageStats {
  totalGuilds: number;
  totalCalls: number;
  activeGuilds: number;
}

export interface Storage {
  getGuildConfig(guildId: string): Promise<GuildConfig | null>;
  saveGuildConfig(config: GuildConfig): Promise<void>;
  deleteGuildConfig(guildId: string): Promise<void>;
  addCallLog(guildId: string, log: CallLog | (CallCard & Partial<CallLog>)): Promise<void>;
  getCallLogs(guildId: string, limit?: number): Promise<CallLog[]>;
  getCallLogsSince(guildId: string, since: Date, limit?: number): Promise<CallLog[]>;
  upsertCallPerformance(performance: CallPerformance): Promise<void>;
  getCallPerformancesSince(guildId: string, since: Date, limit?: number): Promise<CallPerformance[]>;
  getAllGuilds(): Promise<GuildConfig[]>;
  getStats(): Promise<StorageStats>;
}

type GuildSettingsRow = {
  guild_id: string;
  guild_name: string | null;
  channel_id: string | null;
  channel_name: string | null;
  policy_preset: string | null;
  policy: Policy | null;
  watchlist: WatchlistItem[] | null;
  admin_users: string[] | null;
  require_mention: boolean | null;
  call_count: number | string | null;
  last_call_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  autopost: boolean | null;
  min_score: number | string | null;
  show_volume: boolean | null;
  show_holders: boolean | null;
  show_links: boolean | null;
  show_creator_whale: boolean | null;
};

type CallHistoryRow = {
  id: string;
  guild_id: string;
  channel_id: string | null;
  call_id: string | null;
  call_card: CallCard | null;
  triggered_by: string | null;
  user_id: string | null;
  token_address: string;
  token_symbol: string | null;
  score: number | null;
  market_cap: number | null;
  liquidity: number | null;
  message_id: string | null;
  posted_at: string | null;
};

type CallPerformanceRow = {
  call_id: string;
  guild_id: string;
  channel_id: string | null;
  token_address: string;
  token_symbol: string | null;
  call_price: number | string | null;
  call_at: string | null;
  ath_price: number | string | null;
  ath_at: string | null;
  last_price: number | string | null;
  last_checked_at: string | null;
  bonus_alert_sent: boolean | null;
  bonus_alert_at: string | null;
};

const VALID_POLICY_PRESETS: PolicyPreset[] = [
  "fresh-scanner",
  "momentum",
  "dip-hunter",
  "whale-follow",
  "deployer-reputation",
  "community-strength",
];

function normalizePreset(value?: string | null): PolicyPreset {
  if (!value) return "momentum";
  const preset = value as PolicyPreset;
  return VALID_POLICY_PRESETS.includes(preset) ? preset : "momentum";
}

function parseDate(value?: string | Date | null): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function parseNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function parseWatchlist(raw: unknown): WatchlistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const entry = item as WatchlistItem;
      return {
        ...entry,
        addedAt: entry.addedAt ? parseDate(entry.addedAt) : new Date(),
      };
    });
}

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  minScore: 6.5,
  showVolume: true,
  showHolders: true,
  showLinks: true,
  showCreatorWhale: false,
};

function buildPolicy(guildId: string, row: GuildSettingsRow): Policy {
  const preset = normalizePreset(row.policy?.preset ?? row.policy_preset);
  const base = createPolicy(guildId, preset);
  const stored = row.policy && typeof row.policy === "object" ? (row.policy as Partial<Policy>) : null;
  const minScore = parseNumber(row.min_score, base.thresholds.minConfidenceScore);
  const storedThresholds = {
    ...base.thresholds,
    ...(stored?.thresholds ?? {}),
  };

  if (stored?.thresholds?.minConfidenceScore === undefined && row.min_score !== null && row.min_score !== undefined) {
    storedThresholds.minConfidenceScore = minScore;
  }

  if (!stored) {
    return {
      ...base,
      thresholds: storedThresholds,
      autopostEnabled: row.autopost ?? base.autopostEnabled,
    };
  }

  return {
    ...base,
    ...stored,
    thresholds: {
      ...storedThresholds,
    },
    enabledSignals: stored.enabledSignals ?? base.enabledSignals,
    autopostEnabled: stored.autopostEnabled ?? row.autopost ?? base.autopostEnabled,
    autopostCadence: stored.autopostCadence ?? base.autopostCadence,
    maxCallsPerDay: stored.maxCallsPerDay ?? base.maxCallsPerDay,
  };
}

function buildDisplaySettings(row: GuildSettingsRow, policy: Policy): DisplaySettings {
  return {
    minScore: parseNumber(row.min_score, policy.thresholds.minConfidenceScore ?? DEFAULT_DISPLAY_SETTINGS.minScore),
    showVolume: row.show_volume ?? DEFAULT_DISPLAY_SETTINGS.showVolume,
    showHolders: row.show_holders ?? DEFAULT_DISPLAY_SETTINGS.showHolders,
    showLinks: row.show_links ?? DEFAULT_DISPLAY_SETTINGS.showLinks,
    showCreatorWhale: row.show_creator_whale ?? DEFAULT_DISPLAY_SETTINGS.showCreatorWhale,
  };
}

function mapGuildRow(row: GuildSettingsRow): GuildConfig {
  const policy = buildPolicy(row.guild_id, row);
  const display = buildDisplaySettings(row, policy);

  return {
    guildId: row.guild_id,
    guildName: row.guild_name || "Unknown Server",
    channelId: row.channel_id || "",
    channelName: row.channel_name || "channel",
    policy,
    watchlist: parseWatchlist(row.watchlist),
    adminUsers: Array.isArray(row.admin_users) ? row.admin_users : [],
    requireMention: row.require_mention ?? true,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
    callCount: parseNumber(row.call_count, 0),
    lastCallAt: row.last_call_at ? parseDate(row.last_call_at) : undefined,
    display,
  };
}

function buildLegacyCallCard(row: CallHistoryRow): CallCard {
  return {
    callId: row.call_id || row.id,
    timestamp: row.posted_at ? new Date(row.posted_at) : new Date(),
    token: {
      symbol: row.token_symbol || "UNKNOWN",
      mint: row.token_address,
      name: row.token_symbol || "Unknown Token",
    },
    policy: {
      name: "Legacy",
      version: "0.0.0",
      hash: "legacy",
    },
    triggers: [],
    pros: [],
    risks: [],
    invalidation: [],
    confidence: row.score ?? 0,
    metrics: {
      mint: row.token_address,
      symbol: row.token_symbol || "UNKNOWN",
      name: row.token_symbol || "Unknown Token",
      price: 0,
      priceChange24h: 0,
      volume24h: 0,
      volumeChange: 0,
      liquidity: row.liquidity ?? 0,
      liquidityChange: 0,
      holders: 0,
      holdersChange: 0,
      topHolderConcentration: 0,
      tokenAgeHours: 0,
      mintAuthority: false,
      freezeAuthority: false,
      lpLocked: false,
      lpAge: 0,
      deployerAddress: "",
      deployerPriorTokens: 0,
      deployerRugCount: 0,
    },
    receipts: {
      inputRefs: [],
      rulesTriggered: [],
      modelVersion: "legacy",
      promptVersion: "legacy",
    },
  };
}

function normalizeCallLog(guildId: string, log: CallLog | (CallCard & Partial<CallLog>)): CallLog {
  if ((log as CallLog).callCard) {
    const entry = log as CallLog;
    return {
      ...entry,
      guildId: entry.guildId || guildId,
      createdAt: parseDate(entry.createdAt),
    };
  }

  const callCard = log as CallCard;
  const partial = log as Partial<CallLog>;

  return {
    id: partial.id || callCard.callId,
    guildId: partial.guildId || guildId,
    channelId: partial.channelId || "",
    callCard,
    triggeredBy: partial.triggeredBy || "manual",
    userId: partial.userId,
    messageId: partial.messageId,
    createdAt: partial.createdAt ? parseDate(partial.createdAt) : new Date(),
  };
}

// In-memory storage for development/demo
class InMemoryStorage implements Storage {
  private guilds: Map<string, GuildConfig> = new Map();
  private callLogs: Map<string, CallLog[]> = new Map();
  private performances: Map<string, CallPerformance> = new Map();

  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    return this.guilds.get(guildId) || null;
  }

  async saveGuildConfig(config: GuildConfig): Promise<void> {
    this.guilds.set(config.guildId, config);
  }

  async deleteGuildConfig(guildId: string): Promise<void> {
    this.guilds.delete(guildId);
    this.callLogs.delete(guildId);
  }

  async addCallLog(guildId: string, log: CallLog | (CallCard & Partial<CallLog>)): Promise<void> {
    const entry = normalizeCallLog(guildId, log);
    const logs = this.callLogs.get(guildId) || [];
    logs.unshift(entry);
    if (logs.length > 100) {
      logs.pop();
    }
    this.callLogs.set(guildId, logs);
  }

  async getCallLogs(guildId: string, limit: number = 20): Promise<CallLog[]> {
    const logs = this.callLogs.get(guildId) || [];
    return logs.slice(0, limit);
  }

  async getCallLogsSince(guildId: string, since: Date, limit: number = 50): Promise<CallLog[]> {
    const logs = this.callLogs.get(guildId) || [];
    const filtered = logs.filter((log) => log.createdAt >= since);
    return filtered.slice(0, limit);
  }

  async upsertCallPerformance(performance: CallPerformance): Promise<void> {
    this.performances.set(performance.callId, performance);
  }

  async getCallPerformancesSince(guildId: string, since: Date, limit: number = 200): Promise<CallPerformance[]> {
    const items = Array.from(this.performances.values())
      .filter((perf) => perf.guildId === guildId && perf.callAt >= since)
      .sort((a, b) => b.callAt.getTime() - a.callAt.getTime());
    return items.slice(0, limit);
  }

  async getAllGuilds(): Promise<GuildConfig[]> {
    return Array.from(this.guilds.values());
  }

  async getStats(): Promise<StorageStats> {
    const guilds = Array.from(this.guilds.values());
    const totalCalls = Array.from(this.callLogs.values()).reduce(
      (sum, logs) => sum + logs.length,
      0
    );
    const activeGuilds = guilds.filter((g) => g.policy.autopostEnabled).length;

    return {
      totalGuilds: guilds.length,
      totalCalls,
      activeGuilds,
    };
  }
}

class SupabaseStorage implements Storage {
  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("guild_settings")
      .select("*")
      .eq("guild_id", guildId)
      .single();

    if (!data || error) {
      if (error && error.code !== "PGRST116") {
        console.error("Supabase guild lookup failed:", error);
      }
      return null;
    }

    return mapGuildRow(data as GuildSettingsRow);
  }

  async saveGuildConfig(config: GuildConfig): Promise<void> {
    if (!supabase) return;

    const display = config.display ?? {
      minScore: config.policy.thresholds.minConfidenceScore,
      showVolume: DEFAULT_DISPLAY_SETTINGS.showVolume,
      showHolders: DEFAULT_DISPLAY_SETTINGS.showHolders,
      showLinks: DEFAULT_DISPLAY_SETTINGS.showLinks,
      showCreatorWhale: DEFAULT_DISPLAY_SETTINGS.showCreatorWhale,
    };

    const payload = {
      guild_id: config.guildId,
      guild_name: config.guildName,
      channel_id: config.channelId || null,
      channel_name: config.channelName || null,
      policy_preset: config.policy.preset,
      policy: config.policy,
      watchlist: config.watchlist,
      admin_users: config.adminUsers,
      require_mention: config.requireMention,
      call_count: config.callCount,
      last_call_at: config.lastCallAt ? config.lastCallAt.toISOString() : null,
      autopost: config.policy.autopostEnabled,
      min_score: display.minScore,
      show_volume: display.showVolume,
      show_holders: display.showHolders,
      show_links: display.showLinks,
      show_creator_whale: display.showCreatorWhale,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("guild_settings")
      .upsert(payload, { onConflict: "guild_id" });

    if (error) {
      console.error("Supabase guild upsert failed:", error);
    }
  }

  async deleteGuildConfig(guildId: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from("guild_settings")
      .delete()
      .eq("guild_id", guildId);

    if (error) {
      console.error("Supabase guild delete failed:", error);
    }
  }

  async addCallLog(guildId: string, log: CallLog | (CallCard & Partial<CallLog>)): Promise<void> {
    if (!supabase) return;

    const entry = normalizeCallLog(guildId, log);
    const callCard = entry.callCard;
    const metrics = callCard.metrics;

    const { error } = await supabase
      .from("call_history")
      .insert({
        guild_id: guildId,
        channel_id: entry.channelId || null,
        call_id: entry.id || callCard.callId,
        call_card: callCard,
        triggered_by: entry.triggeredBy,
        user_id: entry.userId || null,
        token_address: callCard.token.mint,
        token_symbol: callCard.token.symbol,
        score: callCard.confidence,
        market_cap: null,
        liquidity: metrics.liquidity,
        message_id: entry.messageId || null,
        posted_at: entry.createdAt ? entry.createdAt.toISOString() : new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase call log insert failed:", error);
    }
  }

  async getCallLogs(guildId: string, limit: number = 20): Promise<CallLog[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("call_history")
      .select("*")
      .eq("guild_id", guildId)
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase call log lookup failed:", error);
      return [];
    }

    return (data || []).map((row) => {
      const entry = row as CallHistoryRow;
      return {
        id: entry.call_id || entry.id,
        guildId: entry.guild_id,
        channelId: entry.channel_id || "",
        callCard: entry.call_card || buildLegacyCallCard(entry),
        triggeredBy: (entry.triggered_by || "manual") as CallLog["triggeredBy"],
        userId: entry.user_id || undefined,
        messageId: entry.message_id || undefined,
        createdAt: entry.posted_at ? parseDate(entry.posted_at) : new Date(),
      };
    });
  }

  async upsertCallPerformance(performance: CallPerformance): Promise<void> {
    if (!supabase) return;

    const payload = {
      call_id: performance.callId,
      guild_id: performance.guildId,
      channel_id: performance.channelId || null,
      token_address: performance.tokenAddress,
      token_symbol: performance.tokenSymbol,
      call_price: performance.callPrice,
      call_at: performance.callAt.toISOString(),
      ath_price: performance.athPrice,
      ath_at: performance.athAt ? performance.athAt.toISOString() : null,
      last_price: performance.lastPrice,
      last_checked_at: performance.lastCheckedAt ? performance.lastCheckedAt.toISOString() : null,
      bonus_alert_sent: performance.bonusAlertSent,
      bonus_alert_at: performance.bonusAlertAt ? performance.bonusAlertAt.toISOString() : null,
    };

    const { error } = await supabase
      .from("call_performance")
      .upsert(payload, { onConflict: "call_id" });

    if (error) {
      console.error("Supabase call performance upsert failed:", error);
    }
  }

  async getCallPerformancesSince(guildId: string, since: Date, limit: number = 200): Promise<CallPerformance[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("call_performance")
      .select("*")
      .eq("guild_id", guildId)
      .gte("call_at", since.toISOString())
      .order("call_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase call performance lookup failed:", error);
      return [];
    }

    return (data || []).map((row) => mapCallPerformance(row as CallPerformanceRow));
  }

  async getCallLogsSince(guildId: string, since: Date, limit: number = 50): Promise<CallLog[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("call_history")
      .select("*")
      .eq("guild_id", guildId)
      .gte("posted_at", since.toISOString())
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase call log lookup failed:", error);
      return [];
    }

    return (data || []).map((row) => {
      const entry = row as CallHistoryRow;
      return {
        id: entry.call_id || entry.id,
        guildId: entry.guild_id,
        channelId: entry.channel_id || "",
        callCard: entry.call_card || buildLegacyCallCard(entry),
        triggeredBy: (entry.triggered_by || "manual") as CallLog["triggeredBy"],
        userId: entry.user_id || undefined,
        messageId: entry.message_id || undefined,
        createdAt: entry.posted_at ? parseDate(entry.posted_at) : new Date(),
      };
    });
  }

  async getAllGuilds(): Promise<GuildConfig[]> {
    if (!supabase) return [];

    const { data, error } = await supabase.from("guild_settings").select("*");

    if (error) {
      console.error("Supabase guild list failed:", error);
      return [];
    }

    return (data || []).map((row) => mapGuildRow(row as GuildSettingsRow));
  }

  async getStats(): Promise<StorageStats> {
    if (!supabase) return { totalGuilds: 0, totalCalls: 0, activeGuilds: 0 };

    const [guildCount, callCount, activeCount] = await Promise.all([
      supabase.from("guild_settings").select("guild_id", { count: "exact", head: true }),
      supabase.from("call_history").select("id", { count: "exact", head: true }),
      supabase.from("guild_settings").select("guild_id", { count: "exact", head: true }).eq("autopost", true),
    ]);

    return {
      totalGuilds: guildCount.count || 0,
      totalCalls: callCount.count || 0,
      activeGuilds: activeCount.count || 0,
    };
  }
}

// Singleton instance
let storageInstance: Storage | null = null;

export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = supabase ? new SupabaseStorage() : new InMemoryStorage();
  }
  return storageInstance;
}
