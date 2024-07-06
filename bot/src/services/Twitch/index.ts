import { GetUsersResponse } from '@/services/Twitch/types';
import axios, { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import { connection, client as WebSocket } from 'websocket';

interface ITwitchAPIService {
  subscribe(userId: string): Promise<void>;
}

const EventSubWebSocket = 'wss://eventsub.wss.twitch.tv/ws';
@singleton()
class TwitchAPIService implements ITwitchAPIService {

  private eventSubWebSocket: WebSocket|null = null;
  private lastActiveAt: Date = new Date();
  private sessionId: string|null = null;
  private apiClient: AxiosInstance|null = null;
  private conduitId?: string;
  private async getApiClient() {
    const response = await axios.postForm('https://id.twitch.tv/oauth2/token', {
      client_id: 'u5pta422b8m970x6c8lb7wdqdjx36o',  //  TODO: 環境変数にする
      client_secret: 'xokxytmfyf4l8jxbfwbvp1dfcr73tl',  //  TODO: 環境変数にする
      grant_type: 'client_credentials',
    });

    if (response.status !== 200)
      throw new Error('Could not get access token');

    const token = response.data['access_token'];
    const interval = response.data['expires_in'];

    this.apiClient = axios.create({
      baseURL: 'https://api.twitch.tv/',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': 'u5pta422b8m970x6c8lb7wdqdjx36o',
      }
    });

    setTimeout(async () => {
      await this.getApiClient();
    }, interval);

    return this.apiClient;
  }

  private async initEventSubWebSocket() {
    if (this.eventSubWebSocket) return this.eventSubWebSocket;
    this.eventSubWebSocket = await this.createSocket(EventSubWebSocket);
    return this.eventSubWebSocket;
  }

  private async initConduit() {
    const api = await this.getApiClient();
    const { data: condit }: { data: GetConduitsResponse } = await api.post('/helix/eventsub/conduits', {
      'shard_count': '1'
    });
    console.log(condit);
    this.conduitId = condit.data[0].id;
    await this.initEventSubWebSocket();
    await api.patch('/helix/eventsub/conduits/shards', {
      'conduit_id': this.conduitId,
      'shards': [{
        'id': '0',
        'transport': {
          'method': 'websocket',
          'session_id': this.sessionId,
        }
      }]
    });
    return condit.data[0].id;
  }

  private async getUser(login: string) {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.get('https://api.twitch.tv/helix/users', {
      params: { 'login': login }
    });

    if (response.status === 200)
      return response.data as GetUsersResponse;
    else
      return null;
  }

  async subscribe(login: string): Promise<void> {
    await this.initConduit();

    const users = await this.getUser(login);
    if (!users || users?.data.length < 1) return;
    const body: StreamOnlineRequest = {
      type: 'stream.online',
      version: '1',
      condition: {
        broadcaster_user_id: users.data[0].id,
      },
      transport: {
        method: 'conduit',
        conduit_id: this.conduitId!,
      },
    }
    try {
      const api = this.apiClient ?? await this.getApiClient();
      const response = await api.post('/helix/eventsub/subscriptions', body, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response.status, response.data);
    } catch (e) {
      console.error(e);
      console.error('[TwitchService] Can not subscribe event');
    }
  }

  private async createSocket(url: string, oldConnection: connection|null = null) {
    return new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket();
      socket.on('connect', connection => {
        connection.on('message', message => {
          if (message.type === 'utf8') {
            const data = JSON.parse(message.utf8Data);
            const messageType = data['metadata']['message_type'];
            if (messageType === 'session_welcome') {
              this.handleWelcome(data);
              oldConnection?.close();
              resolve(socket);
            }
            else if (messageType === 'session_keepalive') {
              this.handleKeepalive(data);
            }
            else if (messageType === 'session_reconnect') {
              this.handleReconnect(data, connection);
            }
            else if (messageType === 'notification') {
              this.handleNotification(data);
            }
            else console.log(data);
          }
        });
        connection.on('close', (code, docs) => {
          console.log('[TwitchService] connection closed', code, docs);
          if (this.eventSubWebSocket === socket) {
            console.log('[TwitchService] eventSubWebSocket = null');
            this.eventSubWebSocket = null;
          }
        });
      });
      socket.on('connectFailed', reject);
      socket.connect(url);
      this.eventSubWebSocket = socket;
    });
  }

  private async handleWelcome(data: WelcomeMessage) {
    console.log(data);
    this.sessionId = data.payload.session.id;
  }
  private handleKeepalive(data: KeepaliveMessage) {
    console.log('Keepalive');
    this.lastActiveAt = new Date();
  }
  private async handleReconnect(data: ReconnectMessage, currentConnection: connection) {
    console.log('Reconnect');
    await this.createSocket(data.payload.session.reconnect_url, currentConnection);
  }
  private handleNotification(data: any) {
    console.log(data);
  }
}

type GetConduitsResponse = {
  data: {
    id: string;
    shard_count: number;
  }[]
}

type StreamOnlineRequest = {
  type: 'stream.online';
  version: '1';
  condition: {
    broadcaster_user_id: string;
  }
  transport: {
    method: 'conduit';
    conduit_id: string;
  }
}

type WelcomeMessage = {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
  }
  payload: {
    session: {
      id: string;
      status: string;
      keepalive_timeout_second: number;
      reconnect_url: string;
      connected_at: string;
      recovery_url: string;
    }
  }
}
type KeepaliveMessage = {
  metadata: {
    message_id: string;
    message_type: string;
    message_timestamp: string;
  }
  payload: {}
}
type ReconnectMessage = {
  metadata: {
    message_id: string;
    message_type: string;
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

export { type ITwitchAPIService, TwitchAPIService }
