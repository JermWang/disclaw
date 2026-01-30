import { NextRequest, NextResponse } from "next/server";
import { createPolicy } from "@/lib/clawcord/policies";
import { createDataProvider } from "@/lib/clawcord/data-providers";
import { processCallRequest, formatCallCardForDiscord } from "@/lib/clawcord/call-card";
import type { PolicyPreset } from "@/lib/clawcord/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, policy: policyPreset = "momentum" } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token address or ticker is required" },
        { status: 400 }
      );
    }

    // Create policy from preset
    const policy = createPolicy("api-call", policyPreset as PolicyPreset);

    // Create data provider
    const dataProvider = createDataProvider();

    // Resolve ticker to mint if needed
    let mint = token;
    if (token.startsWith("$") || !token.includes("1")) {
      const resolved = await dataProvider.resolveTickerToMint(token);
      if (resolved) {
        mint = resolved;
      }
    }

    // Process the call
    const result = await processCallRequest(mint, policy, dataProvider);

    if (!result.success || !result.card) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      card: result.card,
      formatted: formatCallCardForDiscord(result.card),
    });
  } catch (error) {
    console.error("Call API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "ClawCord Call API",
    endpoints: {
      "POST /api/call": {
        description: "Generate a call for a token",
        body: {
          token: "Token address or $TICKER (required)",
          policy: "Policy preset name (optional, default: momentum)",
        },
      },
    },
    policies: [
      "fresh-scanner",
      "momentum",
      "dip-hunter",
      "whale-follow",
      "deployer-reputation",
      "community-strength",
    ],
  });
}
