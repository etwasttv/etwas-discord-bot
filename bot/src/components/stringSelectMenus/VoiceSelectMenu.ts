import { Component } from '@/types/component';
import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

const customId = 'voiceselect-menu';

type SPEAKER_INFO = {
  label: string;
  description: string;
  value: string;
};

const SPEAKERS: SPEAKER_INFO[] = [
  {
    label: '四国めたん（ノーマル）',
    description: '四国めたん - ノーマル',
    value: '2',
  },
  {
    label: '四国めたん（あまあま）',
    description: '四国めたん - あまあま',
    value: '0',
  },
  {
    label: '四国めたん（ツンツン）',
    description: '四国めたん - ツンツン',
    value: '6',
  },
  {
    label: '四国めたん（セクシー）',
    description: '四国めたん - セクシー',
    value: '4',
  },
  {
    label: 'ずんだもん（ノーマル）',
    description: 'ずんだもん - ノーマル',
    value: '3',
  },
  {
    label: 'ずんだもん（あまあま）',
    description: 'ずんだもん - あまあま',
    value: '1',
  },
  {
    label: 'ずんだもん（ツンツン）',
    description: 'ずんだもん - ツンツン',
    value: '7',
  },
  {
    label: 'ずんだもん（セクシー）',
    description: 'ずんだもん - セクシー',
    value: '5',
  },
  {
    label: '春日部つむぎ（ノーマル）',
    description: '春日部つむぎ - ノーマル',
    value: '8',
  },
  {
    label: '雨晴はう（ノーマル）',
    description: '雨春はう - ノーマル',
    value: '10',
  },
  {
    label: '波音リツ（ノーマル）',
    description: '波音リツ - ノーマル',
    value: '9',
  },
  {
    label: '玄野武宏（ノーマル）',
    description: '玄野武宏 - ノーマル',
    value: '11',
  },
  {
    label: '白上虎太郎（ノーマル）',
    description: '白上虎太郎 - ノーマル',
    value: '12',
  },
  {
    label: '青山龍星（ノーマル）',
    description: '青山龍星 - ノーマル',
    value: '13',
  },
  {
    label: '冥鳴ひまり（ノーマル）',
    description: '冥鳴ひまり - ノーマル',
    value: '14',
  },
  {
    label: '九州そら（ノーマル）',
    description: '九州そら - ノーマル',
    value: '16',
  },
  {
    label: '九州そら（あまあま）',
    description: '九州そら - あまあま',
    value: '15',
  },
  {
    label: '九州そら（ツンツン）',
    description: '九州そら - ツンツン',
    value: '18',
  },
  {
    label: '九州そら（セクシー）',
    description: '九州そら - セクシー',
    value: '17',
  },
  {
    label: '九州そら（ささやき）',
    description: '九州そら - ささやき',
    value: '19',
  },
];

const VoiceSelectMenu: Component<StringSelectMenuBuilder> = {
  customId,
  generate: async (current: number = 3) => {
    return new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder('声色を選択してください')
      .addOptions(
        SPEAKERS.map((speaker) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(speaker.label)
            .setDescription(speaker.description)
            .setValue(speaker.value)
            .setDefault(speaker.value === current.toString()),
        ),
      );
  },
};

export { VoiceSelectMenu };
