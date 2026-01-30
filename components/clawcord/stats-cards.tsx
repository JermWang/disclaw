"use client";

import React from "react"

import { Card, CardContent } from "@/components/ui/card";
import { Server, Target, Activity, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

function StatCard({ title, value, change, changeType = "neutral", icon, subtitle }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-semibold text-foreground">{value}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-3 flex items-center gap-1">
            <span
              className={`text-xs font-medium ${
                changeType === "positive"
                  ? "text-primary"
                  : changeType === "negative"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last 24h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Connected Servers"
        value="12"
        change="+2"
        changeType="positive"
        icon={<Server className="h-5 w-5 text-muted-foreground" />}
        subtitle="4 active autopost"
      />
      <StatCard
        title="Calls Today"
        value="47"
        change="+18%"
        changeType="positive"
        icon={<Target className="h-5 w-5 text-muted-foreground" />}
        subtitle="Avg conf: 7.2"
      />
      <StatCard
        title="Tokens Watched"
        value="156"
        change="+23"
        changeType="positive"
        icon={<Activity className="h-5 w-5 text-muted-foreground" />}
        subtitle="Across all servers"
      />
      <StatCard
        title="Avg Confidence"
        value="7.4"
        change="+0.3"
        changeType="positive"
        icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        subtitle="Last 7 days"
      />
    </div>
  );
}
