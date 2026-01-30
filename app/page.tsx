import { Header } from "@/components/clawcord/header";
import { StatsCards } from "@/components/clawcord/stats-cards";
import { CallLogsTable } from "@/components/clawcord/call-logs-table";
import { ServersSidebar } from "@/components/clawcord/servers-sidebar";
import { PolicyPresets } from "@/components/clawcord/policy-presets";
import { LiveCallDemo } from "@/components/clawcord/live-call-demo";

export default function ClawCordDashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Stats Overview */}
          <section className="mb-6">
            <StatsCards />
          </section>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <LiveCallDemo />
              <CallLogsTable />
            </div>

            {/* Right Column - Sidebar */}
            <div className="flex flex-col gap-6">
              <ServersSidebar />
              <PolicyPresets />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>ClawCord v1.0.0</span>
            <span className="text-border">|</span>
            <a href="#" className="hover:text-foreground">Documentation</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
}
