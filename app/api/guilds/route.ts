import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/disclaw/storage";

export async function GET() {
  try {
    const storage = getStorage();
    const guilds = await storage.getAllGuilds();
    const stats = await storage.getStats();

    return NextResponse.json({
      success: true,
      stats,
      guilds: guilds.map((g) => ({
        guildId: g.guildId,
        guildName: g.guildName,
        channelId: g.channelId,
        policy: {
          name: g.policy.name,
          preset: g.policy.preset,
          autopostEnabled: g.policy.autopostEnabled,
        },
        watchlistCount: g.watchlist.length,
        callCount: g.callCount,
        lastCallAt: g.lastCallAt,
        createdAt: g.createdAt,
      })),
    });
  } catch (error) {
    console.error("Guilds API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guildId } = body;

    if (!guildId) {
      return NextResponse.json(
        { success: false, error: "Guild ID is required" },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const config = await storage.getGuildConfig(guildId);

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Guild not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guild: config,
    });
  } catch (error) {
    console.error("Guild API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
