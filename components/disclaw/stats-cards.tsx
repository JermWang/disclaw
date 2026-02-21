"use client";

import React from "react"

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, Target, Activity, TrendingUp } from "lucide-react";

interface StatItem {
  title: string;
  value: string;
  description: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  delay: number;
}

const stats: StatItem[] = [
  {
    title: "Connected Servers",
    value: "12",
    description: "4 active autopost",
    change: "+2",
    changeType: "positive",
    icon: <Server className="h-5 w-5" />,
    delay: 0,
  },
  {
    title: "Calls Today",
    value: "47",
    description: "Avg conf: 7.2",
    change: "+18%",
    changeType: "positive",
    icon: <Target className="h-5 w-5" />,
    delay: 0.1,
  },
  {
    title: "Tokens Watched",
    value: "156",
    description: "Across all servers",
    change: "+23",
    changeType: "positive",
    icon: <Activity className="h-5 w-5" />,
    delay: 0.2,
  },
  {
    title: "Avg Confidence",
    value: "7.4",
    description: "Last 7 days",
    change: "+0.3",
    changeType: "positive",
    icon: <TrendingUp className="h-5 w-5" />,
    delay: 0.3,
  },
];

export function StatsCards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={
            isVisible
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : {}
          }
          transition={{
            duration: 0.6,
            delay: stat.delay,
            ease: [0.1, 0, 0.1, 1],
          }}
          className="relative rounded-3xl p-6 transition-all duration-200"
          style={{
            backgroundImage: "linear-gradient(rgb(255, 255, 255), rgb(252, 252, 252))",
            boxShadow:
              "rgba(0, 0, 0, 0.04) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 3px 3px -1.4px, rgba(0, 0, 0, 0.04) 0px 6px 6px -3px",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-primary"
              style={{
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.05))",
              }}
            >
              {stat.icon}
            </div>
            {stat.change && (
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  stat.changeType === "positive"
                    ? "text-green-600 bg-green-50"
                    : stat.changeType === "negative"
                      ? "text-red-600 bg-red-50"
                      : "text-muted-foreground bg-secondary"
                }`}
                style={{ fontFamily: "var(--font-figtree), Figtree" }}
              >
                {stat.change}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              style={{ fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace" }}
            >
              {stat.title}
            </span>
            <span
              className="text-3xl font-medium tracking-tight text-[#202020]"
              style={{ fontFamily: "var(--font-figtree), Figtree", fontWeight: "500" }}
            >
              {stat.value}
            </span>
            <span
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-figtree), Figtree" }}
            >
              {stat.description}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
