import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';

const diceReg: RegExp = /^(?<cnt>\d+)d(?<max>\d+)$/;
const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('DiceRoll the dice. ex. /dice 2d6')
    .addStringOption(opt =>
      opt.setName('option')
        .setDescription('command string ex. 2d6')
        .setRequired(false)),
  handler: async interaction => {
    if (interaction.user.bot) return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const command = options.getString('option') ?? '1d6';

    const result = diceReg.exec(command);
    if (!result || !result.groups) {
      await interaction.reply({
        content: 'option is invalid.',
      });
      return;
    }

    let cnt = Number(result.groups['cnt']);
    let max = Number(result.groups['max']);

    if (cnt < 0 || max < 1 || cnt > 100|| max > 10000) {
      await interaction.reply({
        content: 'option is invalid. (Value is out of range.)',
      });
      return;
    }

    let ans: number[] = [];
    for (let i=0; i<cnt; i++)
      ans.push(Math.floor(Math.random() * max + 1));

    let rep = `${max}面ダイスを${cnt}回振りました!\n`;
    rep += ans.map(a => '`'+a.toString()+'`').join(' ') + '\n';
    if (cnt > 1)
      rep += `合計: ${ans.reduce((a, b) => a + b, 0)}`;

    await interaction.reply({
      content: rep,
    });
  },
};

export default command;
