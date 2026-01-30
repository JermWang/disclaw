"use client";

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, Wallet, Shield, Users, ChevronRight } from "lucide-react";

interface PolicyPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  usage: number;
  signals: string[];
}

const presets: PolicyPreset[] = [
  {
    id: "fresh-scanner",
    name: "Fresh Scanner",
    description: "Ultra-new launches (0-2h)",
    icon: <Sparkles className="h-4 w-4" />,
    usage: 3,
    signals: ["volume-spike", "holder-growth", "deployer-activity"],
  },
  {
    id: "momentum",
    name: "Momentum",
    description: "Volume + social velocity",
    icon: <TrendingUp className="h-4 w-4" />,
    usage: 5,
    signals: ["volume-spike", "price-momentum", "social-velocity"],
  },
  {
    id: "dip-hunter",
    name: "Dip Hunter",
    description: "Drawdown reclaim patterns",
    icon: <Target className="h-4 w-4" />,
    usage: 2,
    signals: ["drawdown-reclaim", "lp-stability", "holder-growth"],
  },
  {
    id: "whale-follow",
    name: "Whale Follow",
    description: "Accumulation patterns",
    icon: <Wallet className="h-4 w-4" />,
    usage: 1,
    signals: ["whale-accumulation", "volume-spike", "liquidity-change"],
  },
  {
    id: "deployer-rep",
    name: "Deployer Rep",
    description: "Deployer history focus",
    icon: <Shield className="h-4 w-4" />,
    usage: 0,
    signals: ["deployer-activity", "distribution-pattern", "lp-stability"],
  },
  {
    id: "community",
    name: "Community",
    description: "Holder retention focus",
    icon: <Users className="h-4 w-4" />,
    usage: 1,
    signals: ["holder-growth", "social-velocity", "distribution-pattern"],
  },
];

function PresetCard({ preset }: { preset: PolicyPreset }) {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-all hover:border-primary/30 hover:bg-secondary/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary">
          {preset.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{preset.name}</span>
          <span className="text-xs text-muted-foreground">{preset.description}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {preset.usage > 0 && (
          <Badge variant="secondary" className="text-xs">
            {preset.usage} servers
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function PolicyPresets() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Policy Presets</CardTitle>
        <Button variant="outline" size="sm">
          Create Custom
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {presets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </CardContent>
    </Card>
  );
}
