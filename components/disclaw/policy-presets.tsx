"use client";

import type React from "react";
import { motion } from "framer-motion";
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

function PresetCard({ preset, index }: { preset: PolicyPreset; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center justify-between rounded-2xl p-3 transition-all duration-200 hover:bg-[#f5f5f5] cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors"
          style={{
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.05))",
          }}
        >
          {preset.icon}
        </div>
        <div className="flex flex-col">
          <span
            className="text-sm font-medium text-[#202020]"
            style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
          >
            {preset.name}
          </span>
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: "var(--font-figtree), Figtree" }}
          >
            {preset.description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {preset.usage > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-[#f5f5f5] text-[#666666] border-0 rounded-full"
            style={{ fontFamily: "var(--font-figtree), Figtree" }}
          >
            {preset.usage} servers
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.div>
  );
}

export function PolicyPresets() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-[32px] overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgb(255, 255, 255), rgb(252, 252, 252))",
        boxShadow:
          "rgba(0, 0, 0, 0.04) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 3px 3px -1.4px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px",
      }}
    >
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h3
          className="text-xl font-medium text-[#202020]"
          style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
        >
          Policy Presets
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-[#e5e5e5] hover:border-[#202020] transition-colors bg-transparent"
        >
          Create Custom
        </Button>
      </div>
      <div className="flex flex-col gap-1 p-4 pt-2">
        {presets.map((preset, idx) => (
          <PresetCard key={preset.id} preset={preset} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
