// ClawCord Core Types
// Signal Caller as a Policy Engine for Solana Tokens

export type PolicyPreset =
  | "fresh-scanner"
  | "momentum"
  | "dip-hunter"
  | "whale-follow"
  | "deployer-reputation"
  | "community-strength";

export interface PolicyThresholds {
  minLiquidity: number; // in USD
  minVolume24h: number; // in USD
  maxTokenAge: number; // in hours
  minHolders: number;
  maxTopHolderConcentration: number; // percentage
  minConfidenceScore: number; // 0-10
}

export interface Policy {
  id: string;
  name: string;
  preset: PolicyPreset;
  description: string;
  thresholds: PolicyThresholds;
  enabledSignals: SignalType[];
  autopostEnabled: boolean;
  autopostCadence: number; // minutes
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  maxCallsPerDay: number;
}

export type SignalType =
  | "volume-spike"
  | "liquidity-change"
  | "holder-growth"
  | "whale-accumulation"
  | "deployer-activity"
  | "social-velocity"
  | "price-momentum"
  | "drawdown-reclaim"
  | "lp-stability"
  | "distribution-pattern";

export interface TokenMetrics {
  mint: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange: number;
  liquidity: number;
  liquidityChange: number;
  holders: number;
  holdersChange: number;
  topHolderConcentration: number;
  tokenAgeHours: number;
  mintAuthority: boolean;
  freezeAuthority: boolean;
  lpLocked: boolean;
  lpAge: number;
  deployerAddress: string;
  deployerPriorTokens: number;
  deployerRugCount: number;
}

export interface RiskFlag {
  type: "high" | "medium" | "low";
  message: string;
  signal: SignalType | "general";
}

export interface CallCard {
  callId: string;
  timestamp: Date;
  token: {
    symbol: string;
    mint: string;
    name: string;
  };
  policy: {
    name: string;
    version: string;
    hash: string;
  };
  triggers: string[];
  pros: string[];
  risks: RiskFlag[];
  invalidation: string[];
  confidence: number; // 0-10
  metrics: TokenMetrics;
  receipts: {
    dataSnapshotUrl?: string;
    inputRefs: string[];
    rulesTriggered: string[];
    modelVersion: string;
    promptVersion: string;
  };
}

export interface GuildConfig {
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  policy: Policy;
  watchlist: WatchlistItem[];
  adminUsers: string[];
  requireMention: boolean;
  createdAt: Date;
  updatedAt: Date;
  callCount: number;
  lastCallAt?: Date;
}

export interface WatchlistItem {
  type: "token" | "wallet" | "deployer" | "ticker";
  value: string; // address or ticker
  label?: string;
  addedBy: string;
  addedAt: Date;
}

export interface CallLog {
  id: string;
  guildId: string;
  channelId: string;
  callCard: CallCard;
  triggeredBy: "manual" | "auto" | "mention";
  userId?: string;
  messageId?: string;
  createdAt: Date;
}

// Discord Command Types
export type CommandName =
  | "install"
  | "policy"
  | "watch"
  | "call"
  | "autopost"
  | "thresholds"
  | "logs";

export interface CommandContext {
  guildId: string;
  channelId: string;
  userId: string;
  userName: string;
  args: string[];
}

// Data Provider Interfaces
export interface TokenDataProvider {
  getTokenMetrics(mint: string): Promise<TokenMetrics | null>;
  resolveTickerToMint(ticker: string): Promise<string | null>;
  getDeployerHistory(address: string): Promise<DeployerHistory>;
}

export interface DeployerHistory {
  address: string;
  totalTokens: number;
  rugCount: number;
  successfulTokens: number;
  avgTokenLifespan: number;
  recentTokens: Array<{
    mint: string;
    symbol: string;
    outcome: "success" | "rug" | "abandoned" | "active";
  }>;
}

// Scoring Types
export interface SignalScore {
  signal: SignalType;
  score: number; // 0-10
  weight: number;
  triggered: boolean;
  reason: string;
}

export interface ScoringResult {
  overallScore: number;
  signals: SignalScore[];
  passesThresholds: boolean;
  failedThresholds: string[];
}
