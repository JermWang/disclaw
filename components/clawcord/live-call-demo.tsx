"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Zap className="h-4 w-4 text-primary" />
          Try a Call
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Token address or $TICKER"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1 bg-secondary"
          />
          <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
            <SelectTrigger className="w-36 bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresh-scanner">Fresh Scanner</SelectItem>
              <SelectItem value="momentum">Momentum</SelectItem>
              <SelectItem value="dip-hunter">Dip Hunter</SelectItem>
              <SelectItem value="whale-follow">Whale Follow</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateCall} disabled={!tokenInput || loading}>
            {loading ? "Generating..." : "Generate Call"}
          </Button>
        </div>

        {result && result.success && (
          <div className="rounded-lg border border-primary/30 bg-secondary/50 p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">
                    ${result.token?.symbol}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {result.token?.mint}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Policy: {selectedPolicy.charAt(0).toUpperCase() + selectedPolicy.slice(1).replace("-", " ")}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="text-2xl font-bold text-primary">
                    {result.confidence}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(result.confidence || 0) * 10}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                  TRIGGERS
                </h4>
                <ul className="space-y-1">
                  {result.triggers?.map((trigger, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                  RISKS
                </h4>
                <ul className="space-y-1">
                  {result.risks?.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      {getRiskIcon(risk.type)}
                      {risk.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.metrics && (
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/50 pt-4 md:grid-cols-6">
                <div>
                  <span className="text-xs text-muted-foreground">Price</span>
                  <p className="font-mono text-sm text-foreground">
                    ${result.metrics.price.toFixed(8)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Volume 24h</span>
                  <p className="font-mono text-sm text-foreground">
                    ${formatNumber(result.metrics.volume24h)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Liquidity</span>
                  <p className="font-mono text-sm text-foreground">
                    ${formatNumber(result.metrics.liquidity)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Holders</span>
                  <p className="font-mono text-sm text-foreground">
                    {result.metrics.holders}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Holder Change</span>
                  <p className="font-mono text-sm text-primary">
                    +{result.metrics.holderChange.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Age</span>
                  <p className="font-mono text-sm text-foreground">
                    {result.metrics.tokenAge.toFixed(1)}h
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
              <code className="rounded bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
                {result.callId}
              </code>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  View Full
                </Button>
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Enter a token address or ticker to generate a call
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
