// import { asyncLock } from '@/core/async-lock';
// import { ITwitchNotificationChannelRepository } from '@/repositories/twitchNotificationChannelRepository';
// import { ITwitchNotificationSubscriptionRepository } from '@/repositories/twitchNotificationSubscription';
// import { TwitchApiClient } from '@/services/Twitch/apiClient';
// import { inject, singleton } from 'tsyringe';
// import { connection, client as WebSocket } from 'websocket';

// interface ITwitchAPIService {
//   subscribe(login: string): Promise<void>;
// }

// const EventSubWebSocket = 'wss://eventsub.wss.twitch.tv/ws';
// @singleton()
// class TwitchAPIService implements ITwitchAPIService {

//   private eventSubWebSocket: WebSocket|null = null;
//   private apiClient: TwitchApiClient;

//   constructor(
//     @inject('ITwitchNotificationSubscriptionRepository') private twitchNotificationSubscriptionRepository: ITwitchNotificationSubscriptionRepository,
//     @inject('ITwitchNotificationChannelRepository') private twitchNotificationChannelRepository: ITwitchNotificationChannelRepository,
//   ) {
//     this.apiClient = new TwitchApiClient();
//     this.init();
//   }

//   private async init() {
//     await this.deleteAllConduit();
//     await this.deleteEventSubSubscriptions();
//   }

//   private async initEventSubWebSocket() {
//     return await asyncLock.acquire('initEventSubWebSocket', async () => {
//       if (this.eventSubWebSocket) return this.eventSubWebSocket;
//       await this.createSocket(EventSubWebSocket);
//       return this.eventSubWebSocket;
//     });
//   }

//   private async getConduit() {
//     const conduits = await this.apiClient.getConduits();
//     console.log(conduits);
//     const conduit = conduits.data.length === 0 ? await (await this.apiClient.createConduits(1)).data[0] : conduits.data[0];
//     console.log(conduit);
//     return conduit;
//   }

//   private async deleteAllConduit() {
//     const conduits = await this.apiClient.getConduits();
//     for (const conduit of conduits.data) {
//       await this.apiClient.deleteConduits(conduit.id);
//     }
//   }

//   private async deleteEventSubSubscriptions() {
//     const subscriptions = await this.apiClient.getEventSubSubscription();
//     for ( const subscription of subscriptions.data.filter(sub => sub.status !== 'enabled')) {
//       await this.apiClient.deleteEventSubSubscription(subscription.id);
//     }
//   }

//   async subscribe(login: string): Promise<void> {
//     const users = await this.apiClient.getUsers({logins: [login]});
//     const conduit = await this.getConduit();
//     this.initEventSubWebSocket();
//     if (users.data.length === 0) throw new Error('User not found');
//     const response = await this.apiClient.createEventSubSubscription({
//       type: 'stream.online',
//       version: '1',
//       condition: {
//         broadcaster_user_id: users.data[0].id,
//       },
//       transport: {
//         method: 'conduit',
//         conduit_id: conduit.id,
//       }
//     });
//     console.log(response);
//   }

//   private async createSocket(url: string, oldConnection: connection|null = null) {
//     return new Promise<WebSocket>((resolve, reject) => {
//       const socket = new WebSocket();
//       socket.on('connect', connection => {
//         connection.on('message', message => {
//           if (message.type === 'utf8') {
//             const data = JSON.parse(message.utf8Data);
//             const messageType = data['metadata']['message_type'];
//             if (messageType === 'session_welcome') {
//               this.handleWelcome(data);
//               oldConnection?.close();
//               resolve(socket);
//             }
//             else if (messageType === 'session_keepalive') {
//               this.handleKeepalive(data);
//             }
//             else if (messageType === 'session_reconnect') {
//               this.handleReconnect(data, connection);
//             }
//             else if (messageType === 'notification') {
//               this.handleNotification(data);
//             }
//             else console.log(data);
//           }
//         });
//         connection.on('close', (code, docs) => {
//           console.log('[TwitchService] connection closed', code, docs);
//           if (this.eventSubWebSocket === socket) {
//             console.log('[TwitchService] eventSubWebSocket = null');
//             this.eventSubWebSocket = null;
//           }
//         });
//       });
//       socket.on('connectFailed', reject);
//       socket.connect(url);
//       this.eventSubWebSocket = socket;
//     });
//   }

//   private async handleWelcome(data: WelcomeMessage) {
//     console.log('Welcome');
//     const conduit = await this.getConduit();
//     await this.apiClient.updateConduitShareds({
//       conduit_id: conduit.id,
//       shards: [{
//         id: '0',
//         transport: {
//           method: 'websocket',
//           session_id: data.payload.session.id,
//         }
//       }]});
//   }
//   private async handleKeepalive(data: KeepaliveMessage) {
//     console.log('Keepalive');
//     await this.deleteEventSubSubscriptions();
//     const subscriptions = await this.apiClient.getEventSubSubscription();
//     console.log(subscriptions.data);
//   }
//   private async handleReconnect(data: ReconnectMessage, currentConnection: connection) {
//     console.log('Reconnect');
//     await this.createSocket(data.payload.session.reconnect_url, currentConnection);
//   }
//   private handleNotification(data: any) {
//     console.log(data);
//   }
// }
