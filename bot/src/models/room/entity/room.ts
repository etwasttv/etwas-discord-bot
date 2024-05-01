import { VoiceChannel as DiscordVoiceChannel, TextChannel as DiscordTextChannel, ChannelType, PermissionOverwriteResolvable, OverwriteResolvable, DiscordAPIError } from 'discord.js';
import { VoiceChannelId } from '../valueObject/voiceChannelId';
import { VoiceChannelName } from '../valueObject/voiceChannelName';
import { GuildId } from '@/models/guild/valueObject/guildId';
import { MemberId } from '@/models/member/valueObject/memberId';
import { discordClient } from '@/core/discord-client';
import { Entity } from '@/core/models/entity';
import { TextChannelId } from '@/models/room/valueObject/textChannelId';

class Room extends Entity {
  get id(): VoiceChannelId {
    return this._id;
  }
  get name(): VoiceChannelName {
    return this._name;
  }
  get textChannelId(): TextChannelId|null {
    return this._textChannelId;
  }
  get guildId(): GuildId {
    return this._guildId;
  }
  constructor(
    protected readonly _id: VoiceChannelId,
    private _name: VoiceChannelName,
    private _textChannelId: TextChannelId|null,
    private _guildId: GuildId,
  ) {
    super(_id);
  }

  async inviteAllVoiceChannelMembers() {
    const voiceChannel = await this.getVoiceChannel();
    let _textChannel = await this.getTextChannel();
    if (!_textChannel)
      _textChannel = await this.createTextChannel();
    const textChannel = _textChannel;
    await Promise.all(voiceChannel.members
      .filter(vm => !textChannel.members.find(tm => tm.id === vm.id))
      .map(vm => 
        textChannel.permissionOverwrites.create(vm, { 'ViewChannel': true })));
  }

  async kickAllNoVoiceChannelMembers() {
    const voiceChannel = await this.getVoiceChannel();
    const textChannel = await this.getTextChannel();
    if (!textChannel)
      return;

    await Promise.all(textChannel.members
      .filter(tm => !voiceChannel.members.find(vm => vm.id === tm.id))
      .map(tm => 
        textChannel.permissionOverwrites.delete(tm)));

    if (await this.isVoiceChannelVacancy())
      await this.deleteTextChannel();
  }

  async inviteMember(memberId: MemberId) {
    let textChannel = await this.getTextChannel();
    if (!textChannel)
      textChannel = await this.createTextChannel();

    await textChannel.permissionOverwrites.create(
      memberId.value,
      {
        ViewChannel: true,
      },
    );
  }

  async kickMember(memberId: MemberId) {
    const textChannel = await this.getTextChannel();
    if (!textChannel) {
      console.log('TextChannel does not exist');
      return;
    }
    await textChannel.permissionOverwrites.delete(
      memberId.value,
    );

    if (await this.isVoiceChannelVacancy())
      await this.deleteTextChannel();
  }

  private async createTextChannel() {
    const guild = await discordClient.guilds.fetch(this._guildId.value);
    const voiceChannel = await this.getVoiceChannel();
    const permissionOverwrites: OverwriteResolvable[] = [
      {
        id: guild.roles.everyone,
        deny: ['ViewChannel'],
      },
    ];

    (await guild.members.fetch())
      .filter(member => member.user.bot)
      .forEach(bot => permissionOverwrites.push({
        id: bot,
        allow: ['ViewChannel']}));

    const channel = await guild.channels.create({
      name: '通話専用チャット',
      type: ChannelType.GuildText,
      parent: voiceChannel.parent,
      permissionOverwrites: [{
          id: guild.roles.everyone,
          deny: ['ViewChannel']}],
    });

    this._textChannelId = new TextChannelId(channel.id);

    return <DiscordTextChannel>channel;
  }

  private async deleteTextChannel() {
    if (!this._textChannelId)
      return;

    const channel = await this.getTextChannel();
    if (!channel)
      return;

    await channel.delete();
    this._textChannelId = null;
  }

  private async textChannelExists(): Promise<boolean> {
    if (!this._textChannelId) return false;
    return !!await this.getTextChannel();
  }

  private async isVoiceChannelVacancy(): Promise<boolean> {
    const channel = await this.getVoiceChannel();
    return !channel.members.find(m => !m.user.bot);
  }

  private async getVoiceChannel(): Promise<DiscordVoiceChannel> {
    const channel = <DiscordVoiceChannel>await discordClient.channels.fetch(this.id.value);
    if (!channel)
      throw new Error('Can not resolve channel id');

    return channel;
  }

  private async getTextChannel(): Promise<DiscordTextChannel | null> {
    if (!this._textChannelId) return null;
    try {
      const channel = <DiscordTextChannel>await discordClient.channels.fetch(this._textChannelId.value);
      return channel ? channel : null;
    } catch (e) {
      if (e instanceof DiscordAPIError) return null;
      console.error(e);
    }
    return null;
  }
}

export { Room };
