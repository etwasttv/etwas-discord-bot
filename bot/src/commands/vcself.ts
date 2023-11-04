import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { AppCommandHandler } from '../lib';
import { checkSelfYomiage, turnOffSelfYomiage, turnOnSelfYomiage } from '../services/reading';

export const handler = new AppCommandHandler(
  new SlashCommandBuilder()
    .setName('vcself')
    .setDescription('turn on/off your voicevox'),
  async (interaction) => {
    if (interaction.user.bot) return;

    if (await checkSelfYomiage(<GuildMember>interaction.member)) {
      await turnOffSelfYomiage(<GuildMember>interaction.member);
      await interaction.reply({
        content: '読み上げをOFFにしました',
        ephemeral: true,
      });
    } else {
      await turnOnSelfYomiage(<GuildMember>interaction.member);
      await interaction.reply({
        content: '読み上げをONにしました',
        ephemeral: true,
      });
    }
  }
);
