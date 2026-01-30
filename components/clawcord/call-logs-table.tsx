"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (confidence >= 8) return "bg-primary/20 text-primary border-primary/30";
    if (confidence >= 6) return "bg-accent/20 text-accent border-accent/30";
    return "bg-warning/20 text-warning border-warning/30";
  };

  return (
    <Badge variant="outline" className={`font-mono ${getColor()}`}>
      {confidence.toFixed(1)}
    </Badge>
  );
}

function RiskIndicator({ risks }: { risks: { high: number; medium: number; low: number } }) {
  return (
    <div className="flex items-center gap-1.5">
      {risks.high > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded bg-destructive/20 text-xs font-medium text-destructive">
          {risks.high}
        </span>
      )}
      {risks.medium > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded bg-warning/20 text-xs font-medium text-warning">
          {risks.medium}
        </span>
      )}
      {risks.low > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-xs font-medium text-primary">
          {risks.low}
        </span>
      )}
      {risks.high === 0 && risks.medium === 0 && risks.low === 0 && (
        <span className="text-xs text-muted-foreground">None</span>
      )}
    </div>
  );
}

export function CallLogsTable() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Recent Calls</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calls..."
              className="h-9 w-48 bg-secondary pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Token</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Server</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Policy</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Confidence</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Triggers</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Risks</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Time</th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">${log.token}</span>
                      <span className="font-mono text-xs text-muted-foreground">{log.mint}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.server}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-normal">
                      {log.policy}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <ConfidenceBadge confidence={log.confidence} />
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.triggers}</td>
                  <td className="px-6 py-4">
                    <RiskIndicator risks={log.risks} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
