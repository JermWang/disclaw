import type { GuildConfig, CallLog } from "./types";

// In-memory storage for development/demo
// Replace with database (Supabase, Neon, etc.) for production
class InMemoryStorage {
  private guilds: Map<string, GuildConfig> = new Map();
  private callLogs: Map<string, CallLog[]> = new Map();

  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    return this.guilds.get(guildId) || null;
  }

  async saveGuildConfig(config: GuildConfig): Promise<void> {
    this.guilds.set(config.guildId, config);
  }

  async deleteGuildConfig(guildId: string): Promise<void> {
    this.guilds.delete(guildId);
    this.callLogs.delete(guildId);
  }

  async addCallLog(guildId: string, log: CallLog): Promise<void> {
    const logs = this.callLogs.get(guildId) || [];
    logs.unshift(log);
    // Keep only last 100 logs per guild
    if (logs.length > 100) {
      logs.pop();
    }
    this.callLogs.set(guildId, logs);
  }

  async getCallLogs(guildId: string, limit: number = 20): Promise<CallLog[]> {
    const logs = this.callLogs.get(guildId) || [];
    return logs.slice(0, limit);
  }

  async getAllGuilds(): Promise<GuildConfig[]> {
    return Array.from(this.guilds.values());
  }

  // Stats
  async getStats(): Promise<{
    totalGuilds: number;
    totalCalls: number;
    activeGuilds: number;
  }> {
    const guilds = Array.from(this.guilds.values());
    const totalCalls = Array.from(this.callLogs.values()).reduce(
      (sum, logs) => sum + logs.length,
      0
    );
    const activeGuilds = guilds.filter((g) => g.policy.autopostEnabled).length;

    return {
      totalGuilds: guilds.length,
      totalCalls,
      activeGuilds,
    };
  }
}

// Singleton instance
let storageInstance: InMemoryStorage | null = null;

export function getStorage(): InMemoryStorage {
  if (!storageInstance) {
    storageInstance = new InMemoryStorage();
  }
  return storageInstance;
}

// Export types for external use
export type Storage = InMemoryStorage;
