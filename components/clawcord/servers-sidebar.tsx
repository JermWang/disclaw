"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Circle } from "lucide-react";

interface ServerItem {
  id: string;
  name: string;
  policy: string;
  watchlistCount: number;
  callsToday: number;
  autopostEnabled: boolean;
  lastActive: string;
}

const mockServers: ServerItem[] = [
  {
    id: "1",
    name: "Alpha Hunters",
    policy: "Momentum",
    watchlistCount: 24,
    callsToday: 12,
    autopostEnabled: true,
    lastActive: "Active now",
  },
  {
    id: "2",
    name: "Degen Central",
    policy: "Fresh Scanner",
    watchlistCount: 45,
    callsToday: 8,
    autopostEnabled: true,
    lastActive: "5 min ago",
  },
  {
    id: "3",
    name: "Whale Watchers",
    policy: "Whale Follow",
    watchlistCount: 12,
    callsToday: 5,
    autopostEnabled: false,
    lastActive: "1 hour ago",
  },
  {
    id: "4",
    name: "Community Calls",
    policy: "Community Strength",
    watchlistCount: 67,
    callsToday: 3,
    autopostEnabled: false,
    lastActive: "2 hours ago",
  },
];

function ServerCard({ server }: { server: ServerItem }) {
  return (
    <div className="group flex items-start justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:border-border hover:bg-secondary/50">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{server.name}</span>
          {server.autopostEnabled && (
            <Circle className="h-2 w-2 fill-primary text-primary" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {server.policy}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {server.watchlistCount} watching
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{server.lastActive}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-lg font-semibold text-foreground">{server.callsToday}</span>
        <span className="text-xs text-muted-foreground">calls today</span>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ServersSidebar() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Servers</CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Server
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {mockServers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </CardContent>
    </Card>
  );
}
