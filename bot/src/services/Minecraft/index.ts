import { injectable } from 'tsyringe';

interface IMinecraftService {
  send(sender: string, message: string): Promise<void>;
}

@injectable()
class MinecraftService implements IMinecraftService {
  async send(sender: string, message: string): Promise<void> {
    try {
      await fetch(`${process.env.MC_API_ENDPOINT!}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MC_API_TOKEN}`
        },
        body: JSON.stringify({
          name: sender,
          chat: message,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export { type IMinecraftService, MinecraftService };
