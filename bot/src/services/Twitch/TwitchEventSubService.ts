import { asyncLock } from '@/core/async-lock';
import { DiscordClient } from '@/core/discord';
import { ITwitchEventSubSubscriptionRepository } from '@/repositories/TwitchEventSubSubscription';
import { ITwitchNotificationChannelRepository } from '@/repositories/TwitchNotificationChannelRepository';
import { TwitchApiClient } from '@/services/Twitch/TwitchApiClient';
import { inject, singleton } from 'tsyringe';
import { type connection, client as WebSocket } from 'websocket';

const EventSubWebSocket = 'wss://eventsub.wss.twitch.tv/ws';

export interface ITwitchEventSubService {
  subscribe(broadcasterUserId: string): Promise<void>;
  unsubscribe(broadcasterUserId: string): Promise<void>;
}

@singleton()
export class TwitchEventSubService implements ITwitchEventSubService {
  constructor(
    @inject('DiscordClient') private discordClient: DiscordClient,
    @inject('TwitchApiClient') private api: TwitchApiClient,
    @inject('ITwitchEventSubSubscriptionRepository') private twitchEventSubSubscriptionRepository: ITwitchEventSubSubscriptionRepository,
    @inject('ITwitchNotificationChannelRepository') private twitchNotificationChannelRepository: ITwitchNotificationChannelRepository,
  ) {
    this.init();
  }

  private async init() {
    await this.deleteAllConduits();
    await this.deleteDisabledEventSubSubscriptions();
    await this.getEventSubWebSocket();
  }

  private async deleteAllConduits() {
    const conduits = await this.api.getConduits();
    for (const conduit of conduits.data) {
      await this.api.deleteConduits(conduit.id);
    }
  }

  private async deleteDisabledEventSubSubscriptions() {
    const subscriptions = await this.api.getEventSubSubscription();
    for (const subscription of subscriptions.data.filter(sub => sub.status !== 'enabled')) {
      await this.api.deleteEventSubSubscription(subscription.id);
    }
  }

  private _webSocket?: WebSocket;
  private async getEventSubWebSocket() {
    return await asyncLock.acquire('TwitchEventSubService.getEventSubWebSocket', async () => {
      return this._webSocket ?? await this.createEventSubWebSocket(EventSubWebSocket);
    });
  }

  private async getConduit() {
    const conduits = await this.api.getConduits();
    const conduit = conduits.data.length === 0 ? (await this.api.createConduits(1)).data[0] : conduits.data[0];
    return conduit;
  }

  private async createEventSubWebSocket(url: string, oldConnection?: connection) {
    return new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket();
      socket.on('connect', connection => {
        connection.on('message', async message => {
          if (message.type === 'utf8') {
            console.log('[TwitchEventSubService] Received Message.', message.utf8Data);
            const msg = parseMessage(message.utf8Data);
            console.log(msg);
            if (msg.metadata.message_type === 'session_welcome') {
              if (oldConnection) oldConnection.close();
              const welcomeMsg = msg as WelcomeMessage;
              const conduit = await this.getConduit();
              await this.api.updateConduitShareds({
                conduit_id: conduit.id,
                shards: [{
                  id: '0',
                  transport: {
                    method: 'websocket',
                    session_id: welcomeMsg.payload.session.id,
                  }
                }]
              });
              resolve(socket);
            }
            else if (msg.metadata.message_type === 'session_keepalive') {
              await this.deleteDisabledEventSubSubscriptions();
            }
            else if (msg.metadata.message_type === 'notification') {

            }
            else if (msg.metadata.message_type === 'revocation') {

            }
            else if (msg.metadata.message_type === 'session_reconnect') {
              const reconnectMsg = msg as ReconnectMessage;
              await this.createEventSubWebSocket(reconnectMsg.payload.session.reconnect_url, connection);
            }
          }
        });

        connection.on('close', (code, docs) => {
          console.log('[TwitchEventSubService] Connection closed.', code, docs);
          if (this._webSocket === socket)
            this._webSocket = undefined;
        });
      });

      socket.on('connectFailed', reject);

      socket.connect(url);

      this._webSocket = socket;
    });
  }

  async subscribe(broadcasterUserId: string): Promise<void> {
    const [websocket, conduit] = await Promise.all([
      this.getEventSubWebSocket(),
      this.getConduit(),
    ]);
    const response = await this.api.createEventSubSubscription({
      type: 'stream.online',
      version: '1',
      condition: {
        broadcaster_user_id: broadcasterUserId,
      },
      transport: {
        method: 'conduit',
        conduit_id: conduit.id,
      }
    });
    console.log('[TwitchEventSubService] Create subscription.', response.data[0]);
  }

  unsubscribe(broadcasterUserId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

function parseMessage(data: string) {
  return JSON.parse(data) as WebSocketMessage;
}

type WebSocketMessage = WelcomeMessage|KeepaliveMessage|ReconnectMessage|NotificationMessage|RevocationMessage;
type WelcomeMessage = {
  metadata: {
    message_id: string;
    message_type: 'session_welcome';
    message_timestamp: string;
  }
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_second: number;
      reconnect_url: string;
      connected_at: string;
    }
  }
}
type KeepaliveMessage = {
  metadata: {
    message_id: string;
    message_type: 'session_keepalive';
    message_timestamp: string;
  }
  payload: {}
}
type ReconnectMessage = {
  metadata: {
    message_id: string;
    message_type: 'session_reconnect';
    message_timestamp: string;
  }
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_secconds: null;
      reconnect_url: string;
      connected_at: string;
    }
  }
}
type NotificationMessage = {
  metadata: {
    message_id: string;
    message_type: 'notification';
    message_timestamp: string;
    subscription_type: string;
    subscription_version: string;
  }
  payload: {
    subscription: {
      id: string;
      status: 'enabled';
      type: string;
      version: string;
      cost: number;
      condition: Object;
      transport: {
        method: 'websocket';
        session_id: string;
      }
      created_at: string;
    }
    event: Object;
  }
}
type RevocationMessage = {
  metadata: {
    message_id: string;
    message_type: 'revocation';
    message_timestamp: string;
    subscription_type: string;
    subscription_version: string;
  }
  payload: {
    subscription: {
      id: string;
      status: 'authorization_revoked'|'user_removed'|'version_removed';
      type: string;
      version: string;
      const: number;
      condition: Object;
      transport: {
        method: 'websocket';
        session_id: string;
      };
      created_at: string;
    }
  }
}
