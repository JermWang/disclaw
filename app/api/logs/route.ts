import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/disclaw/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!guildId) {
      return NextResponse.json(
        { success: false, error: "Guild ID is required" },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const logs = await storage.getCallLogs(guildId, Math.min(limit, 100));

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
