import { NextRequest, NextResponse } from "next/server";
import { handleCommand } from "@/lib/clawcord/discord-commands";
import { getStorage } from "@/lib/clawcord/storage";
import type { CommandName, CommandContext } from "@/lib/clawcord/types";

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
} as const;

// Verify Discord signature (simplified - in production use discord-interactions library)
async function verifyDiscordRequest(request: NextRequest): Promise<boolean> {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return false;
  }

  // In production, implement proper Ed25519 signature verification
  // using tweetnacl or discord-interactions library
  return true;
}

export async function POST(request: NextRequest) {
  // Verify the request is from Discord
  const isValid = await verifyDiscordRequest(request);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 });
  }

  const body = await request.json();

  // Handle Discord ping (verification)
  if (body.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (body.type === InteractionType.APPLICATION_COMMAND) {
    const { data, guild_id, channel_id, member } = body;

    // Extract command name and options
    const commandName = data.options?.[0]?.name as CommandName;
    const options = data.options?.[0]?.options || [];

    // Build args from options
    const args: string[] = [];
    for (const opt of options) {
      if (opt.value !== undefined) {
        args.push(String(opt.value));
      }
    }

    // Create command context
    const ctx: CommandContext = {
      guildId: guild_id,
      channelId: channel_id,
      userId: member?.user?.id || "unknown",
      userName: member?.user?.username || "unknown",
      args,
    };

    try {
      const storage = getStorage();
      const response = await handleCommand(commandName, ctx, storage);

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response.content,
          flags: response.ephemeral ? 64 : 0, // 64 = ephemeral flag
        },
      });
    } catch (error) {
      console.error("Command error:", error);
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "An error occurred processing your command.",
          flags: 64,
        },
      });
    }
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 });
}
