import { Client, GatewayIntentBits, Events, REST, Routes, ActivityType } from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID!;

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

if (!DISCORD_APPLICATION_ID) {
  console.error('❌ DISCORD_APPLICATION_ID is required');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const commands = [
  {
    name: 'clawcord',
    description: 'ClawCord signal caller commands',
    options: [
      {
        name: 'scan',
        description: 'Scan for new PumpFun graduations',
        type: 1,
      },
      {
        name: 'policy',
        description: 'View or change the active policy',
        type: 1,
        options: [
          {
            name: 'preset',
            description: 'Policy preset to use',
            type: 3,
            required: false,
            choices: [
              { name: 'Default', value: 'default' },
              { name: 'Aggressive', value: 'aggressive' },
              { name: 'Conservative', value: 'conservative' },
            ],
          },
        ],
      },
      {
        name: 'help',
        description: 'Show help information',
        type: 1,
      },
    ],
  },
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
  
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(DISCORD_APPLICATION_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

async function scanGraduations() {
  try {
    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1?chainId=solana');
    const data = await response.json();
    return (data || []).slice(0, 10);
  } catch {
    return [];
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Bot is online as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} servers`);
  
  c.user.setActivity('for graduations', { type: ActivityType.Watching });
  
  await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'clawcord') {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'scan') {
      await interaction.deferReply();
      
      try {
        const graduations = await scanGraduations();
        
        if (graduations.length === 0) {
          await interaction.editReply('📭 No new graduations found.');
          return;
        }
        
        const top3 = graduations.slice(0, 3);
        const messages = top3.map((g: any, i: number) => {
          return [
            `**${i + 1}. ${g.tokenAddress?.slice(0, 8)}...**`,
            `   � [View Token](https://dexscreener.com/solana/${g.tokenAddress})`,
          ].join('\n');
        });
        
        await interaction.editReply({
          content: `🎓 **Latest Tokens**\n\n${messages.join('\n\n')}`,
        });
      } catch (error) {
        console.error('Scan error:', error);
        await interaction.editReply('❌ Failed to scan. Please try again.');
      }
    }
    
    if (subcommand === 'policy') {
      const preset = interaction.options.getString('preset');
      
      if (preset) {
        await interaction.reply(`✅ Policy set to **${preset}**`);
      } else {
        await interaction.reply([
          '📋 **Current Policy: Default**',
          '',
          'Available presets:',
          '• `default` — Balanced settings',
          '• `aggressive` — Early entry, higher risk',
          '• `conservative` — Safer plays',
          '',
          'Use `/clawcord policy preset:<name>` to change.',
        ].join('\n'));
      }
    }
    
    if (subcommand === 'help') {
      await interaction.reply({
        content: [
          '🦀 **ClawCord Commands**',
          '',
          '`/clawcord scan` — Scan for new PumpFun graduations',
          '`/clawcord policy` — View or change policy preset',
          '`/clawcord help` — Show this help message',
          '',
          '**Links:**',
          '• Website: https://clawcord.xyz',
          '• Twitter: https://x.com/ClawCordSOL',
          '• Discord: https://discord.gg/NZEKBbqj2q',
        ].join('\n'),
        ephemeral: true,
      });
    }
  }
});

client.on(Events.GuildCreate, (guild) => {
  console.log(`➕ Joined server: ${guild.name} (${guild.id})`);
});

client.on(Events.GuildDelete, (guild) => {
  console.log(`➖ Left server: ${guild.name} (${guild.id})`);
});

console.log('🚀 Starting ClawCord bot...');
client.login(DISCORD_BOT_TOKEN);
