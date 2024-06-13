import { prisma } from '@/core/prisma';
import { generateQuery, generateVoice } from '@/core/voice';
import { AudioPlayer, VoiceConnectionReadyState, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Guild, User, VoiceChannel } from 'discord.js';
import { injectable } from 'inversify';
import { Readable } from 'stream';

interface IVoiceService {
  setSpeaker(guild: Guild, user: User, speakerId: number): Promise<void>;
  getSpeakerId(guild: Guild, user: User): Promise<number>;
  read(voiceChannel: VoiceChannel, user: User, text: string): Promise<void>;
  connect(voiceChannel: VoiceChannel): boolean;
  isConnectTo(voiceChannel: VoiceChannel): boolean;
  disconnect(voiceChannel: VoiceChannel): void;
}

@injectable()
class VoiceService implements IVoiceService {

  private URL = new RegExp('https?://[\\w!?/+\\-_~;.,*&@#=$%()\'[\\]]+', 'g');
  private CODEBLOCK = new RegExp(/```.*```/gsm);
  private CODELINE = new RegExp(/`.*`/gsm);
  private convert(text: string) {
    let fixedText = text.replaceAll(this.URL, 'URL省略');
    fixedText = fixedText.replaceAll(this.CODEBLOCK, 'コードブロック省略');
    fixedText = fixedText.replaceAll(this.CODELINE, 'コード省略');
    return fixedText;
  }

  async setSpeaker(guild: Guild, user: User, spakerId: number) {
    await prisma.voice.upsert({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId: user.id,
        },
      },
      update: {
        speakerId: spakerId,
      },
      create: {
        guildId: guild.id,
        userId: user.id,
        speakerId: spakerId,
      }
    });
  }

  async getSpeakerId(guild: Guild, user: User) {
    const voice = await prisma.voice.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId: user.id,
        }
      }
    });

    return voice?.speakerId ?? 3;
  }

  async read(voiceChannel: VoiceChannel, user: User, text: string) {
    const connection = getVoiceConnection(voiceChannel.guildId);
    if (!connection)
      return;
    if (!this.isConnectTo(voiceChannel))
      return;

    const subscription = (connection.state as VoiceConnectionReadyState).subscription;
    let player: AudioPlayer|undefined = subscription?.player;
    if (!player) {
      player = createAudioPlayer();
      connection.subscribe(player);
    }

    const speakerId = await this.getSpeakerId(voiceChannel.guild, user);
    const queryBuffer = await generateQuery(this.convert(text), speakerId);

    //  Empty
    const wavBuffer = await generateVoice(queryBuffer, speakerId, 1.2);
    player.play(createAudioResource(Readable.from(wavBuffer)));
  }

  connect(voiceChannel: VoiceChannel): boolean {
    const connection = getVoiceConnection(voiceChannel.guildId);
    if (connection && connection.state.status === VoiceConnectionStatus.Ready) {
      console.log('[Voice] VoiceConnection is already used in this guild.');
      return connection.joinConfig.channelId === voiceChannel.id;
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    return true;
  }

  isConnectTo(voiceChannel: VoiceChannel): boolean {
    const connection = getVoiceConnection(voiceChannel.guildId);
    return !!connection
      && connection.state.status !== VoiceConnectionStatus.Disconnected
      && connection.joinConfig.channelId === voiceChannel.id;
  }

  disconnect(voiceChannel: VoiceChannel) {
    const connection = getVoiceConnection(voiceChannel.guildId);
    if (!connection
      || connection.state.status === VoiceConnectionStatus.Disconnected
      || connection.joinConfig.channelId !== voiceChannel.id)
      return;

    connection.disconnect();
    connection.destroy();
  }
}

export { VoiceService, type IVoiceService }
