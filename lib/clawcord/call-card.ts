import type { CallCard, TokenMetrics, Policy, ScoringResult, DisplaySettings } from "./types";
import { scoreToken, generateRiskFlags, generateInvalidationConditions } from "./scoring";
import { hashPolicy } from "./policies";

export function generateCallId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CC-${timestamp}-${random}`.toUpperCase();
}

export function generateCallCard(
  metrics: TokenMetrics,
  policy: Policy,
  scoringResult: ScoringResult
): CallCard {
  const triggeredSignals = scoringResult.signals.filter((s) => s.triggered);

  return {
    callId: generateCallId(),
    timestamp: new Date(),
    token: {
      symbol: metrics.symbol,
      mint: metrics.mint,
      name: metrics.name,
    },
    policy: {
      name: policy.name,
      version: "1.0.0",
      hash: hashPolicy(policy),
    },
    triggers: triggeredSignals.map((s) => s.reason),
    pros: generatePros(metrics, triggeredSignals),
    risks: generateRiskFlags(metrics),
    invalidation: generateInvalidationConditions(metrics, policy),
    confidence: Math.round(scoringResult.overallScore * 10) / 10,
    metrics,
    receipts: {
      inputRefs: [`metrics:${metrics.mint}:${Date.now()}`],
      rulesTriggered: triggeredSignals.map((s) => s.signal),
      modelVersion: "clawcord-v1.0",
      promptVersion: "1.0.0",
    },
  };
}

function generatePros(
  metrics: TokenMetrics,
  triggeredSignals: Array<{ signal: string; reason: string }>
): string[] {
  const pros: string[] = [];

  if (metrics.volumeChange > 100) {
    pros.push(`Strong volume momentum (+${metrics.volumeChange.toFixed(0)}%)`);
  } else if (metrics.volumeChange > 50) {
    pros.push(`Good volume increase (+${metrics.volumeChange.toFixed(0)}%)`);
  }

  if (metrics.holdersChange > 10) {
    pros.push(`Rapid holder growth (+${metrics.holdersChange.toFixed(1)}%)`);
  } else if (metrics.holdersChange > 5) {
    pros.push(`Healthy holder growth (+${metrics.holdersChange.toFixed(1)}%)`);
  }

  if (metrics.lpLocked) {
    pros.push("LP is locked");
  }

  if (!metrics.mintAuthority && !metrics.freezeAuthority) {
    pros.push("No mint/freeze authority (renounced)");
  }

  if (metrics.deployerRugCount === 0 && metrics.deployerPriorTokens > 0) {
    pros.push(`Clean deployer history (${metrics.deployerPriorTokens} prior tokens)`);
  }

  if (metrics.topHolderConcentration < 15) {
    pros.push(`Well-distributed supply (top ${metrics.topHolderConcentration.toFixed(1)}%)`);
  }

  if (metrics.liquidity > 20000) {
    pros.push(`Strong liquidity ($${(metrics.liquidity / 1000).toFixed(1)}k)`);
  }

  if (pros.length === 0) {
    pros.push("Meets minimum threshold requirements");
  }

  return pros.slice(0, 5); // Max 5 pros
}

export function formatCallCardForDiscord(card: CallCard, display?: DisplaySettings): string {
  const riskCount = {
    high: card.risks.filter((r) => r.type === "high").length,
    medium: card.risks.filter((r) => r.type === "medium").length,
    low: card.risks.filter((r) => r.type === "low").length,
  };
  const mint = `${card.token.mint.slice(0, 6)}...${card.token.mint.slice(-4)}`;
  const dexUrl = `https://dexscreener.com/solana/${card.token.mint}`;
  const priceChange = card.metrics.priceChange24h;
  const priceLine = `${formatPrice(card.metrics.price)} (${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(1)}%/24h)`;
  const showVolume = display?.showVolume ?? true;
  const showHolders = display?.showHolders ?? true;
  const showLinks = display?.showLinks ?? true;
  const showCreatorWhale = display?.showCreatorWhale ?? false;
  const metricsLine = [
    `Price ${priceLine}`,
    showVolume ? `Vol ${formatNumber(card.metrics.volume24h)}` : null,
    `Liq ${formatNumber(card.metrics.liquidity)}`,
    showHolders ? `Holders ${card.metrics.holders}` : null,
    `Age ${card.metrics.tokenAgeHours.toFixed(1)}h`,
  ]
    .filter(Boolean)
    .join(" | ");
  const creatorWhaleLine = showCreatorWhale ? formatCreatorWhaleLine(card.metrics) : null;
  const metaLine = `Triggers ${card.triggers.length} | Pros ${card.pros.length} | Risks ${riskCount.high}H/${riskCount.medium}M/${riskCount.low}L | ID ${card.callId}`;
  const contractLine = showLinks
    ? `CA: \`${card.token.mint}\` | 📊 [DexScreener](${dexUrl})`
    : `CA: \`${card.token.mint}\``;

  return [
    `**$${card.token.symbol}** \`${mint}\` | Score ${card.confidence.toFixed(1)}/10 | ${card.policy.name}`,
    metricsLine,
    creatorWhaleLine,
    metaLine,
    contractLine,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatCallCardCompact(card: CallCard, display?: DisplaySettings): string {
  const riskCount = {
    high: card.risks.filter((r) => r.type === "high").length,
    medium: card.risks.filter((r) => r.type === "medium").length,
    low: card.risks.filter((r) => r.type === "low").length,
  };
  const mint = `${card.token.mint.slice(0, 6)}...${card.token.mint.slice(-4)}`;
  const dexUrl = `https://dexscreener.com/solana/${card.token.mint}`;
  const showLinks = display?.showLinks ?? true;
  const showCreatorWhale = display?.showCreatorWhale ?? false;
  const creatorWhaleLine = showCreatorWhale ? formatCreatorWhaleLine(card.metrics) : null;
  const contractLine = showLinks
    ? `CA: \`${card.token.mint}\` | 📊 [DexScreener](${dexUrl}) | ID ${card.callId}`
    : `CA: \`${card.token.mint}\` | ID ${card.callId}`;

  return [
    `**$${card.token.symbol}** \`${mint}\` | Score ${card.confidence.toFixed(1)}/10 | Trig ${card.triggers.length} | Risks ${riskCount.high}H/${riskCount.medium}M/${riskCount.low}L`,
    contractLine,
    creatorWhaleLine,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCreatorWhaleLine(metrics: TokenMetrics): string | null {
  if (!metrics.creatorIsWhale || !metrics.creatorAddress) return null;
  const holdPct = metrics.creatorHoldPct;
  if (holdPct === undefined || !Number.isFinite(holdPct)) return null;
  const shortAddress = `${metrics.creatorAddress.slice(0, 6)}...${metrics.creatorAddress.slice(-4)}`;
  return `🐋 Creator wallet ${holdPct.toFixed(2)}% | \`${shortAddress}\``;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toFixed(2);
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}

export async function processCallRequest(
  mint: string,
  policy: Policy,
  dataProvider: { getTokenMetrics: (mint: string) => Promise<TokenMetrics | null> }
): Promise<{ success: boolean; card?: CallCard; error?: string }> {
  try {
    const metrics = await dataProvider.getTokenMetrics(mint);

    if (!metrics) {
      return { success: false, error: "Could not fetch token metrics" };
    }

    const scoringResult = scoreToken(metrics, policy);

    if (!scoringResult.passesThresholds) {
      return {
        success: false,
        error: `Token fails thresholds:\n${scoringResult.failedThresholds.join("\n")}`,
      };
    }

    if (scoringResult.overallScore < policy.thresholds.minConfidenceScore) {
      return {
        success: false,
        error: `Confidence ${scoringResult.overallScore.toFixed(1)} below minimum ${policy.thresholds.minConfidenceScore}`,
      };
    }

    const card = generateCallCard(metrics, policy, scoringResult);
    return { success: true, card };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
