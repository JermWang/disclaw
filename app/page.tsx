"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Zap, Shield, BarChart3, Users, Terminal, Play, Bot, TrendingUp, Target, Clock, Wallet } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/disclaw/header";
import { AsciiShader } from "@/components/ascii-shader";


// Command examples for code boxes
const commandExamples = [
  {
    title: "Track Whale Buys",
    command: `/disclaw watch add <wallet>`,
    description: "Monitor whale wallets for new token buys in real-time",
    output: `🐋 Whale Alert: 7k3m...9xQz
Bought $CRAB • $42,000
Entry: $0.00018 | Now: $0.00031
+72% since entry 🔥
🔗 View on DexScreener`,
  },
  {
    title: "Generate a Call",
    command: `/disclaw call $TICKER`,
    description: "Get a full analysis with pros, risks, and confidence score",
    output: `━━━━━━━━━━━━━━━━━━━━━
$CRAB • 8x2f...4k9a
Policy: Whale Follow v1.0
━━━━━━━━━━━━━━━━━━━━━
✅ Pros: Strong volume, LP locked
⚠️ Risks: 🟡 New deployer
📈 Confidence: ████████░░ 8/10`,
  },
  {
    title: "Enable Autopost",
    command: `/disclaw autopost enabled:true`,
    description: "Automatically post high-scoring tokens to your channel",
    output: `✅ Autopost enabled!
Channel: #alpha-calls
Policy: Whale Follow
Min Score: 7.0
Daily Limit: 10 calls`,
  },
];

// Feature blocks data
const features = [
  {
    title: "Whale Wallet Tracking",
    subtitle: "Follow the smart money.",
    description: "Watch any wallet address and get instant Discord alerts when whales buy new tokens. Know what the big players are accumulating before the crowd.",
    icon: Wallet,
    color: "text-[#5865F2]",
    stats: ["Real-time alerts", "Multi-wallet tracking", "Entry price tracking"],
  },
  {
    title: "Policy Engine",
    subtitle: "Configure once, run forever.",
    description: "Set your thresholds for liquidity, volume, holders, and more. DISCLAW applies your rules to every token automatically.",
    icon: Shield,
    color: "text-[#5865F2]",
    stats: ["6 preset policies", "Custom thresholds", "Per-server configs"],
  },
  {
    title: "Real-time Scanning",
    subtitle: "Catch graduations as they happen.",
    description: "Monitor PumpFun → Raydium migrations in real-time. Get notified within minutes of graduation, not hours.",
    icon: Zap,
    color: "text-emerald-400",
    stats: ["45 min max age", "30s cache refresh", "100+ pairs/scan"],
  },
  {
    title: "Deep Analytics",
    subtitle: "Data from multiple sources.",
    description: "Helius for holder data, DexScreener for price action, on-chain for authorities. All combined into one score.",
    icon: BarChart3,
    color: "text-sky-400",
    stats: ["Holder counts", "Whale detection", "Buy/sell ratios"],
  },
  {
    title: "Community First",
    subtitle: "Built for Discord alpha groups.",
    description: "Structured call cards, audit logs, quiet hours, daily limits. Everything you need to run a professional signal channel.",
    icon: Users,
    color: "text-violet-400",
    stats: ["Call receipts", "Full audit trail", "Rate limiting"],
  },
];

export default function DisclawLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-[#12121f] relative overflow-hidden">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* ASCII Shader Background */}
        <div className="absolute inset-0 z-0">
          <AsciiShader
            mode="shimmer"
            color="#5865F2"
            bgColor="#0a0a12"
            density={1.0}
            speed={0.6}
            charRamp=" .·:;+*#%@"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/90 via-[#0a0a12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#12121f]" />
        </div>

        {/* Purple glow blob behind logo */}
        <div
          className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(88,101,242,0.18) 0%, rgba(88,101,242,0.06) 50%, transparent 75%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Hero Content — split layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12 py-24">
          
          {/* Left: Text */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#5865F2] text-xs uppercase tracking-[0.2em] mb-5 font-semibold">
              Solana · Whale Tracking · Signal Calling
            </p>
            <h1
              className="text-6xl md:text-8xl font-bold leading-none mb-6"
              style={{ fontFamily: "var(--font-figtree), Figtree" }}
            >
              <span className="text-[#5865F2]">DIS</span><span className="text-white">CLAW</span>
            </h1>
            <p className="text-lg text-gray-400 mb-3 leading-relaxed">
              Follow whale wallets. Catch PumpFun graduations.
              <br />Automate your Discord alpha calls.
            </p>
            <p className="text-sm text-gray-600 mb-10">
              Policy-driven signal calling for Solana — built for Discord communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/api/discord/invite"
                className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg shadow-[#5865F2]/30"
              >
                <Bot className="w-5 h-5" />
                Add to Discord
              </a>
              <a
                href="#try-commands"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 border border-white/15"
              >
                <Terminal className="w-5 h-5" />
                See Commands
              </a>
            </div>

            {/* Powered by */}
            <motion.a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <span className="text-base">🦞</span>
              <span className="text-white/60 text-xs tracking-wide">
                Powered by <span className="font-medium text-white/80">OpenClaw AI</span>
              </span>
            </motion.a>
          </motion.div>

          {/* Right: Large logo + floating stat pills */}
          <motion.div
            className="flex-shrink-0 relative hidden md:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Image
              src="/disclaw-logo.png"
              alt="DISCLAW Logo"
              width={280}
              height={280}
              className="w-48 h-48 lg:w-64 lg:h-64 drop-shadow-2xl"
            />
            {/* Floating pill — top right */}
            <motion.div
              className="absolute -top-4 -right-8 bg-[#1c1c2e] border border-[#5865F2]/30 rounded-full px-4 py-2 text-xs text-white/80 font-mono shadow-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🐋 Whale buy detected
            </motion.div>
            {/* Floating pill — bottom left */}
            <motion.div
              className="absolute -bottom-4 -left-10 bg-[#1c1c2e] border border-[#5865F2]/30 rounded-full px-4 py-2 text-xs text-white/80 font-mono shadow-lg"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              ✅ Score: 8.4/10
            </motion.div>
            {/* Floating pill — bottom right */}
            <motion.div
              className="absolute bottom-8 -right-12 bg-[#1c1c2e] border border-emerald-500/30 rounded-full px-4 py-2 text-xs text-emerald-400 font-mono shadow-lg"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              🎓 Graduated → Raydium
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <div className="w-0.5 h-1.5 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <div className="relative z-10 bg-[#0e0e1a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-center">
            {[
              { value: "12k+", label: "Tokens Scanned", icon: Target },
              { value: "< 45m", label: "Max Token Age", icon: Clock },
              { value: "75+", label: "Min Holders", icon: Users },
              { value: "8.2", label: "Avg Call Score", icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon className="w-4 h-4 text-[#5865F2] flex-shrink-0" />
                <span className="text-white font-bold text-lg">{stat.value}</span>
                <span className="text-gray-500 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-28 bg-[#12121f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-[#5865F2] text-xs uppercase tracking-[0.2em] font-semibold mb-3">Why DISCLAW</p>
            <h2
              className="text-4xl md:text-5xl font-bold text-white max-w-lg leading-tight"
              style={{ fontFamily: "var(--font-figtree), Figtree" }}
            >
              Everything your alpha group needs.
            </h2>
          </motion.div>

          {/* Numbered feature rows */}
          <div className="space-y-0 divide-y divide-white/5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`flex flex-col md:flex-row items-start md:items-center gap-8 py-10 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Number */}
                <div className="flex-shrink-0 w-16 text-right hidden md:block">
                  <span className="text-5xl font-bold text-white/8 select-none" style={{ fontFamily: "var(--font-figtree), Figtree" }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/8 bg-white/4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3
                      className="text-xl font-semibold text-white"
                      style={{ fontFamily: "var(--font-figtree), Figtree" }}
                    >
                      {feature.title}
                    </h3>
                    <span className="text-[#5865F2] text-sm font-medium">{feature.subtitle}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-lg">{feature.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 md:w-56 md:flex-shrink-0 md:justify-end">
                  {feature.stats.map((stat) => (
                    <span key={stat} className="text-xs bg-white/5 border border-white/8 px-3 py-1 rounded-full text-gray-400">
                      {stat}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRY COMMANDS SECTION ===== */}
      <section id="try-commands" className="py-28 bg-[#0e0e1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-[#5865F2] text-xs uppercase tracking-[0.2em] font-semibold mb-3">Commands</p>
              <h2
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-figtree), Figtree" }}
              >
                Simple commands,<br />powerful results.
              </h2>
            </div>
            <a
              href="/api/discord/invite"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 self-start md:self-auto"
            >
              <Bot className="w-4 h-4" />
              Add Bot — Free
            </a>
          </div>

          {/* Command Cards — middle card offset up */}
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {commandExamples.map((cmd, index) => (
              <motion.div
                key={cmd.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className={`bg-[#1c1c2e] rounded-2xl border border-[#2e2e4a] overflow-hidden group hover:border-[#5865F2]/40 transition-all duration-300 ${
                  index === 1 ? '-mt-6 shadow-xl shadow-[#5865F2]/10' : ''
                }`}
              >
                {/* Card top accent bar */}
                {index === 1 && (
                  <div className="h-0.5 bg-gradient-to-r from-[#5865F2] to-[#7289DA]" />
                )}
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#2e2e4a] flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">{cmd.title}</h3>
                  <span className="text-xs text-gray-600 hidden lg:block">{cmd.description}</span>
                </div>
                {/* Command Input */}
                <div className="px-5 py-3 bg-[#12121f] border-b border-[#2e2e4a] font-mono text-sm">
                  <span className="text-gray-600">/ </span>
                  <span className="text-[#7289DA]">{cmd.command.replace('/', '')}</span>
                </div>
                {/* Output */}
                <div className="px-5 py-4 font-mono text-xs text-gray-500 whitespace-pre-line leading-relaxed min-h-[100px]">
                  {cmd.output}
                </div>
                {/* CTA */}
                <div className="px-5 py-4 border-t border-[#2e2e4a]">
                  <a
                    href="/api/discord/invite"
                    className="flex items-center justify-center gap-2 w-full bg-[#5865F2]/8 hover:bg-[#5865F2]/18 text-[#7289DA] py-2.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Try it
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== JOIN COMMUNITY CTA ===== */}
      <section className="py-28 bg-[#12121f] relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(88,101,242,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#5865F2] text-xs uppercase tracking-[0.2em] font-semibold mb-4">Get Started</p>
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
                style={{ fontFamily: "var(--font-figtree), Figtree" }}
              >
                Your alpha group<br />deserves better tools.
              </h2>
              <p className="text-gray-500 text-base mb-8 max-w-md">
                Add DISCLAW to your server in 2 minutes. No credit card. No setup fees.
                Track whales, catch graduations, automate calls.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/api/discord/invite"
                  className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg shadow-[#5865F2]/25"
                >
                  <Bot className="w-5 h-5" />
                  Add to Discord — It&apos;s Free
                </a>
                <a
                  href="https://discord.gg/fBUBVaaHhF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/6 hover:bg-white/12 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 border border-white/10"
                >
                  Join Community
                </a>
              </div>
              <p className="mt-5 text-gray-600 text-xs">
                No credit card required · Setup in 2 minutes · Works with any server
              </p>
            </motion.div>

            {/* Right: feature checklist */}
            <motion.div
              className="flex-shrink-0 w-full md:w-80 bg-[#1c1c2e] border border-[#2e2e4a] rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-5">What you get</p>
              {[
                { text: 'Whale wallet tracking', color: 'text-[#5865F2]' },
                { text: 'PumpFun graduation alerts', color: 'text-[#5865F2]' },
                { text: 'Policy-driven call scoring', color: 'text-[#5865F2]' },
                { text: 'Per-server configuration', color: 'text-[#5865F2]' },
                { text: 'Autopost to any channel', color: 'text-[#5865F2]' },
                { text: 'Full audit log', color: 'text-[#5865F2]' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className={`text-sm ${item.color}`}>✓</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-[#12121f] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <h3
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-figtree), Figtree" }}
              >
                <span className="text-[#5865F2]">DIS</span><span className="text-white">CLAW</span>
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Whale tracking &amp; signal calling for Solana.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/DisclawSOL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/JermWang/DISCLAW"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Link Sections */}
            {[
              { 
                title: "Product", 
                links: [
                  { name: "Features", href: "#try-commands" },
                  { name: "Commands", href: "/docs/commands" },
                  { name: "API Docs", href: "/docs/api" },
                ] 
              },
              { 
                title: "Resources", 
                links: [
                  { name: "Documentation", href: "/docs" },
                  { name: "Discord", href: "https://discord.gg/fBUBVaaHhF" },
                  { name: "Telegram", href: "https://t.me/BlueClawCallsBot" },
                  { name: "Status", href: "/status" },
                ] 
              },
              { 
                title: "Legal", 
                links: [
                  { name: "Privacy", href: "/privacy" },
                  { name: "Terms", href: "/terms" },
                  { name: "Security", href: "/security" },
                ] 
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wide">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DISCLAW. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-500">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
