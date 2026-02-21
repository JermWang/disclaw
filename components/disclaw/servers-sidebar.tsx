"use client";

import { motion } from "framer-motion";
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

function ServerCard({ server, index }: { server: ServerItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-start justify-between rounded-2xl p-4 transition-all duration-200 hover:bg-[#f5f5f5] cursor-pointer"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="font-medium text-[#202020]"
            style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
          >
            {server.name}
          </span>
          {server.autopostEnabled && (
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs bg-transparent border-[#e5e5e5] text-[#666666] rounded-full"
            style={{ fontFamily: "var(--font-figtree), Figtree" }}
          >
            {server.policy}
          </Badge>
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: "var(--font-figtree), Figtree" }}
          >
            {server.watchlistCount} watching
          </span>
        </div>
        <span
          className="text-xs text-muted-foreground"
          style={{ fontFamily: "var(--font-figtree), Figtree" }}
        >
          {server.lastActive}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className="text-2xl font-medium text-[#202020]"
          style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
        >
          {server.callsToday}
        </span>
        <span
          className="text-xs text-muted-foreground"
          style={{ fontFamily: "var(--font-figtree), Figtree" }}
        >
          calls today
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  );
}

export function ServersSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
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
          Servers
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-[#e5e5e5] hover:border-[#202020] transition-colors bg-transparent"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Server
        </Button>
      </div>
      <div className="flex flex-col gap-1 p-4 pt-2">
        {mockServers.map((server, idx) => (
          <ServerCard key={server.id} server={server} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
