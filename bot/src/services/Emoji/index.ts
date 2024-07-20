import { Basic_Emoji, Emoji_Keycap_Sequence, RGI_Emoji_Flag_Sequence, RGI_Emoji_Tag_Sequence } from './emoji.json';

const ALL_EMOJI = [...Basic_Emoji, ...Emoji_Keycap_Sequence, ...RGI_Emoji_Flag_Sequence, ...RGI_Emoji_Tag_Sequence];
const FLAG_EMOJI = [...RGI_Emoji_Flag_Sequence, ...RGI_Emoji_Tag_Sequence];

interface IEmojiService {
  emojiGacha(): string;
  flagGacha(): string;
}

class EmojiService implements IEmojiService {
  emojiGacha(): string {
    const num = Math.floor(Math.random() * ALL_EMOJI.length);
    const codePoints = ALL_EMOJI[num].split(' ').map(c => parseInt(c, 16));
    return String.fromCodePoint(...codePoints);
  }

  flagGacha(): string {
    const num = Math.floor(Math.random() * FLAG_EMOJI.length);
    const codePoints = FLAG_EMOJI[num].split(' ').map(c => parseInt(c, 16));
    return String.fromCodePoint(...codePoints);
  }
}

export { type IEmojiService, EmojiService }
