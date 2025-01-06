import { DiscordClient } from '@/core/discord';
import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder, TextBasedChannel } from 'discord.js';
import { container } from 'tsyringe';

function next(num: number): number {
  if (num%2 === 0) return Math.floor(num/2);
  return num*3+1;
}

const limit = 2000;

const discordClient = container.resolve<DiscordClient>('DiscordClient');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('collatz')
    .setDescription('コラッツ予想を考える')
    .addIntegerOption(opt =>
      opt.setName('number')
        .setDescription('任意の正の整数')
        .setRequired(true)
        .setMinValue(1)),
  handler: async (interaction) => {
    if (interaction.user.bot) return;
    const options = interaction.options as CommandInteractionOptionResolver;
    const number = options.getInteger('number');

    if (!number || number < 1) {
      await interaction.reply({
        content: '正の整数を指定してね',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply('コラッツ予想、考えてみるかぁ');
    let ch: TextBasedChannel | null = interaction.channel;
    if (!interaction.guild) {
      ch = await (await discordClient.users.fetch(interaction.user.id)).createDM(true);
    }
    if (!ch) return;

    let x = number;
    let msg = `${x}`;
    let count = 0;
    while (x !== 1) {
      x = next(x);
      count++;
      const newMsg = `→${x}`;
      if (msg.length + newMsg.length < limit) {
        msg += `→${x}`;
      } else {
        await ch.send(msg);
        msg = `→${x}`;
      }
    }
    await ch.send(msg);
  },
};

export default command;
