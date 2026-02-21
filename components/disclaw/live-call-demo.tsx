"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink } from "lucide-react";

interface CallResult {
  success: boolean;
  callId?: string;
  token?: {
    symbol: string;
    mint: string;
  };
  confidence?: number;
  triggers?: string[];
  pros?: string[];
  risks?: Array<{ type: "high" | "medium" | "low"; message: string }>;
  invalidation?: string[];
  metrics?: {
    price: number;
    volume24h: number;
    liquidity: number;
    holders: number;
    holderChange: number;
    tokenAge: number;
  };
  error?: string;
}

export function LiveCallDemo() {
  const [tokenInput, setTokenInput] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState("momentum");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CallResult | null>(null);

  const handleGenerateCall = async () => {
    if (!tokenInput) return;

    setLoading(true);
    setResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock result
    const mockResult: CallResult = {
      success: true,
      callId: `CC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      token: {
        symbol: tokenInput.replace("$", "").toUpperCase(),
        mint: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      },
      confidence: Math.round((Math.random() * 3 + 6) * 10) / 10,
      triggers: [
        `Volume +${Math.floor(Math.random() * 150 + 50)}% spike detected`,
        `Holders +${(Math.random() * 15 + 5).toFixed(1)}% growth`,
        "LP stable (locked), age 4.2h",
      ],
      pros: [
        "Strong volume momentum",
        "Healthy holder growth",
        "No mint/freeze authority",
        "Clean deployer history",
      ],
      risks: [
        { type: "medium", message: "Top holder concentration elevated (22.5%)" },
        { type: "low", message: "Low holder count (156)" },
      ],
      invalidation: [
        "Price drops >30% from current level",
        "24h volume drops below $2,500",
        "LP is removed or significantly reduced",
      ],
      metrics: {
        price: Math.random() * 0.001,
        volume24h: Math.random() * 50000 + 5000,
        liquidity: Math.random() * 30000 + 10000,
        holders: Math.floor(Math.random() * 300 + 100),
        holderChange: Math.random() * 20,
        tokenAge: Math.random() * 24,
      },
    };

    setResult(mockResult);
    setLoading(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(2);
  };

  const getRiskIcon = (type: "high" | "medium" | "low") => {
    switch (type) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[32px] overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgb(255, 255, 255), rgb(252, 252, 252))",
        boxShadow:
          "rgba(0, 0, 0, 0.04) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 3px 3px -1.4px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px, rgba(0, 0, 0, 0.04) 0px 12px 12px -6px",
      }}
    >
      <div className="p-6 pb-4">
        <h3
          className="flex items-center gap-2 text-xl font-medium text-[#202020]"
          style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))",
            }}
          >
            <Zap className="h-4 w-4 text-primary" />
          </div>
          Try a Call
        </h3>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Token address or $TICKER"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1 h-12 bg-[#f5f5f5] border-0 rounded-xl"
            style={{ fontFamily: "var(--font-figtree), Figtree" }}
          />
          <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
            <SelectTrigger className="w-40 h-12 bg-[#f5f5f5] border-0 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="fresh-scanner">Fresh Scanner</SelectItem>
              <SelectItem value="momentum">Momentum</SelectItem>
              <SelectItem value="dip-hunter">Dip Hunter</SelectItem>
              <SelectItem value="whale-follow">Whale Follow</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerateCall}
            disabled={!tokenInput || loading}
            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
            style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
          >
            {loading ? "Generating..." : "Generate Call"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {result && result.success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-5"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-medium text-[#202020]"
                      style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "600" }}
                    >
                      ${result.token?.symbol}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs rounded-full bg-white border-[#e5e5e5]"
                      style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                    >
                      {result.token?.mint}
                    </Badge>
                  </div>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-figtree), Figtree" }}
                  >
                    Policy: {selectedPolicy.charAt(0).toUpperCase() + selectedPolicy.slice(1).replace("-", " ")}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: "var(--font-figtree), Figtree" }}
                    >
                      Confidence
                    </span>
                    <span
                      className="text-3xl font-medium text-primary"
                      style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "600" }}
                    >
                      {result.confidence}
                    </span>
                    <span
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: "var(--font-figtree), Figtree" }}
                    >
                      /10
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(result.confidence || 0) * 10}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h4
                    className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                  >
                    TRIGGERS
                  </h4>
                  <ul className="space-y-2">
                    {result.triggers?.map((trigger, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[#404040]"
                        style={{ fontFamily: "var(--font-figtree), Figtree" }}
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4
                    className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                  >
                    RISKS
                  </h4>
                  <ul className="space-y-2">
                    {result.risks?.map((risk, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[#404040]"
                        style={{ fontFamily: "var(--font-figtree), Figtree" }}
                      >
                        {getRiskIcon(risk.type)}
                        {risk.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.metrics && (
                <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[#e5e5e5] pt-5 md:grid-cols-6">
                  {[
                    { label: "Price", value: `$${result.metrics.price.toFixed(8)}` },
                    { label: "Volume 24h", value: `$${formatNumber(result.metrics.volume24h)}` },
                    { label: "Liquidity", value: `$${formatNumber(result.metrics.liquidity)}` },
                    { label: "Holders", value: result.metrics.holders.toString() },
                    { label: "Holder Change", value: `+${result.metrics.holderChange.toFixed(1)}%`, highlight: true },
                    { label: "Age", value: `${result.metrics.tokenAge.toFixed(1)}h` },
                  ].map((metric, i) => (
                    <div key={i}>
                      <span
                        className="text-xs text-muted-foreground"
                        style={{ fontFamily: "var(--font-figtree), Figtree" }}
                      >
                        {metric.label}
                      </span>
                      <p
                        className={`text-sm ${metric.highlight ? "text-green-600" : "text-[#202020]"}`}
                        style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                      >
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-[#e5e5e5] pt-5">
                <code
                  className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-xs text-muted-foreground"
                  style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                >
                  {result.callId}
                </code>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[#e5e5e5] hover:border-[#202020] bg-transparent"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[#e5e5e5] hover:border-[#202020] bg-transparent"
                  >
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    View Full
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#e5e5e5] bg-[#fafafa]">
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-figtree), Figtree" }}
            >
              Enter a token address or ticker to generate a call
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
