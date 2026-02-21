"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search, ExternalLink } from "lucide-react";

interface CallLogEntry {
  id: string;
  token: string;
  mint: string;
  server: string;
  policy: string;
  confidence: number;
  triggers: number;
  risks: { high: number; medium: number; low: number };
  timestamp: string;
}

const mockLogs: CallLogEntry[] = [
  {
    id: "CC-M5X9K2-A3B7",
    token: "DEGEN",
    mint: "DGN...4xKp",
    server: "Alpha Hunters",
    policy: "Momentum",
    confidence: 8.2,
    triggers: 4,
    risks: { high: 0, medium: 1, low: 2 },
    timestamp: "2 min ago",
  },
  {
    id: "CC-L4W8J1-C9D2",
    token: "WOJAK",
    mint: "WJK...7mPq",
    server: "Degen Central",
    policy: "Fresh Scanner",
    confidence: 7.5,
    triggers: 3,
    risks: { high: 1, medium: 1, low: 0 },
    timestamp: "8 min ago",
  },
  {
    id: "CC-N6Y3R5-E1F8",
    token: "PEPE2",
    mint: "PP2...3nRs",
    server: "Whale Watchers",
    policy: "Whale Follow",
    confidence: 6.8,
    triggers: 2,
    risks: { high: 0, medium: 2, low: 1 },
    timestamp: "15 min ago",
  },
  {
    id: "CC-P8Z1T7-G5H4",
    token: "BONK2",
    mint: "BNK...9vTu",
    server: "Alpha Hunters",
    policy: "Dip Hunter",
    confidence: 7.9,
    triggers: 5,
    risks: { high: 0, medium: 0, low: 3 },
    timestamp: "23 min ago",
  },
  {
    id: "CC-Q2A4U9-I7J6",
    token: "SHIB3",
    mint: "SHB...2wVx",
    server: "Community Calls",
    policy: "Community Strength",
    confidence: 8.5,
    triggers: 4,
    risks: { high: 0, medium: 1, low: 1 },
    timestamp: "31 min ago",
  },
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 8) return "bg-green-50 text-green-700 border-green-200";
    if (confidence >= 6) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${getColor()}`}
      style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
    >
      {confidence.toFixed(1)}
    </span>
  );
}

function RiskIndicator({ risks }: { risks: { high: number; medium: number; low: number } }) {
  return (
    <div className="flex items-center gap-1.5">
      {risks.high > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-xs font-medium text-red-600 border border-red-200">
          {risks.high}
        </span>
      )}
      {risks.medium > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-xs font-medium text-amber-600 border border-amber-200">
          {risks.medium}
        </span>
      )}
      {risks.low > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-xs font-medium text-green-600 border border-green-200">
          {risks.low}
        </span>
      )}
      {risks.high === 0 && risks.medium === 0 && risks.low === 0 && (
        <span className="text-sm text-muted-foreground">None</span>
      )}
    </div>
  );
}

export function CallLogsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-[32px] overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgb(255, 255, 255), rgb(252, 252, 252))",
        boxShadow:
          "rgba(0, 0, 0, 0.04) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 3px 3px -1.4px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px, rgba(0, 0, 0, 0.04) 0px 12px 12px -6px",
      }}
    >
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3
          className="text-xl font-medium text-[#202020]"
          style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
        >
          Recent Calls
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calls..."
              className="h-10 w-48 bg-[#f5f5f5] border-0 rounded-full pl-9"
              style={{ fontFamily: "var(--font-figtree), Figtree" }}
            />
          </div>
          <Button
            variant="outline"
            className="rounded-full border-[#e5e5e5] hover:border-[#202020] transition-colors bg-transparent"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-[#e5e5e5] text-left bg-[#fafafa]">
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Token
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Server
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Policy
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Confidence
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Triggers
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Risks
              </th>
              <th
                className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
              >
                Time
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, idx) => (
              <tr
                key={log.id}
                className={`border-t border-[#f0f0f0] transition-colors hover:bg-[#fafafa] ${
                  idx === mockLogs.length - 1 ? "" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span
                      className="font-medium text-[#202020]"
                      style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
                    >
                      ${log.token}
                    </span>
                    <span
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
                    >
                      {log.mint}
                    </span>
                  </div>
                </td>
                <td
                  className="px-6 py-4 text-sm text-[#404040]"
                  style={{ fontFamily: "var(--font-figtree), Figtree" }}
                >
                  {log.server}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="secondary"
                    className="font-normal bg-[#f5f5f5] text-[#404040] border-0 rounded-full"
                    style={{ fontFamily: "var(--font-figtree), Figtree" }}
                  >
                    {log.policy}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <ConfidenceBadge confidence={log.confidence} />
                </td>
                <td
                  className="px-6 py-4 text-sm text-[#404040]"
                  style={{ fontFamily: "var(--font-figtree), Figtree" }}
                >
                  {log.triggers}
                </td>
                <td className="px-6 py-4">
                  <RiskIndicator risks={log.risks} />
                </td>
                <td
                  className="px-6 py-4 text-sm text-muted-foreground"
                  style={{ fontFamily: "var(--font-figtree), Figtree" }}
                >
                  {log.timestamp}
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#f5f5f5]">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
