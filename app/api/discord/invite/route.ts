import { NextRequest, NextResponse } from "next/server";
import { generateBotInviteUrl } from "@/lib/disclaw/discord-oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const json = searchParams.get("json") === "true";

  try {
    const clientId = process.env.DISCORD_APPLICATION_ID;
    
    if (!clientId) {
      // If no client ID, redirect to a fallback or show error
      return NextResponse.json(
        { error: "Discord Application ID not configured" },
        { status: 500 }
      );
    }

    const inviteUrl = generateBotInviteUrl({
      clientId,
    });

    // If json param is set, return JSON (for programmatic use)
    if (json) {
      return NextResponse.json({
        success: true,
        inviteUrl,
        instructions: [
          "1. Click the invite URL to add DISCLAW to your server",
          "2. Select the server and authorize permissions",
          "3. Use /disclaw install in any channel to complete setup",
          "4. Configure your policy with /disclaw policy",
          "5. Enable autopost with /disclaw autopost enabled:true",
        ],
      });
    }

    // Default: redirect directly to Discord OAuth
    return NextResponse.redirect(inviteUrl);
  } catch (error) {
    console.error("Failed to generate invite URL:", error);
    return NextResponse.json(
      { error: "Failed to generate invite URL" },
      { status: 500 }
    );
  }
}
