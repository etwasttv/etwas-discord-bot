import axios, { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';

@singleton()
export class TwitchApiClient {

  private apiClient?: AxiosInstance;

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

  async getUsers(request: GetUsersRequest): Promise<GetUsersResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.get('/helix/users', {
      params: { 'login': request.logins, 'ids': request.ids },
    });
    return response.data as GetUsersResponse;
  }

  async createEventSubSubscription(request: CreateEventSubSubscriptionRequest): Promise<CreateEventSubSubscriptionResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.post('/helix/eventsub/subscriptions', request, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status !== 202) throw new Error(response.statusText);
    return response.data as CreateEventSubSubscriptionResponse;
  }

  async deleteEventSubSubscription(subscriptionId: string): Promise<void> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.delete(`/helix/eventsub/subscriptions`, {
      params: {
        id: subscriptionId,
      }
    });
    if (response.status !== 204) throw new Error(response.statusText);
  }

  async getEventSubSubscription() {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.get('/helix/eventsub/subscriptions');
    if (response.status !== 200) throw new Error(response.statusText);
    return response.data as GetEventSubSubscriptionResponse;
  }

  async createConduits(shardCount: number): Promise<CreateConduitsResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.post('/helix/eventsub/conduits', {
      shard_count: shardCount,
    });
    if (response.status !== 200) throw new Error(response.statusText);
    return response.data as CreateConduitsResponse;
  }

  async updateConduits(request: UpdateConduitsRequest): Promise<UpdateConduitsResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.patch('/helix/eventsub/conduits', request);
    if (response.status !== 200) throw new Error(response.statusText);
    return response.data as UpdateConduitsResponse;
  }

  async deleteConduits(conduitId: string) {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.delete('/helix/eventsub/conduits', {
      params: {
        id: conduitId,
      },
    });
    if (response.status !== 204) throw new Error(response.statusText);
  }

  async getConduits(): Promise<GetConduitsResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.get('/helix/eventsub/conduits');
    if (response.status !== 200) throw new Error(response.statusText);
    return response.data as GetConduitsResponse;
  }

  async getConduitShards(request: GetConduitShardsRequest): Promise<GetConduitShardsResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.get('/helix/eventsub/conduits/shards', {
      params: request,
    });
    if (response.status !== 200) throw new Error(response.statusText);
    return response.data as GetConduitShardsResponse;
  }

  async updateConduitShareds(request: UpdateConduitSharedsRequest): Promise<UpdateConduitSharedsResponse> {
    const api = this.apiClient ?? await this.getApiClient();
    const response = await api.patch('/helix/eventsub/conduits/shards', request, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status !== 202) throw new Error(response.statusText);
    return response.data as UpdateConduitSharedsResponse;
  }
}

type GetUsersRequest = {
  ids?: string[];
  logins?: string[];
};
type GetUsersResponse = {
  data: {
    id: string;
    login: string;
    display_name: string;
    type: 'admin'|'global'|'staff'|'';
    broadcaster_type: 'affiliate'|'partner'|'';
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: string;
  }[]
}
type CreateEventSubSubscriptionRequest = {
  type: 'stream.online'|'stream.offline';
  version: '1',
  condition: StreamSubscriptionsCondition;
  transport: {
    method: 'conduit';
    conduit_id: string;
  }
}
type StreamSubscriptionsCondition = {
  broadcaster_user_id: string;
}
type CreateEventSubSubscriptionResponse = {
  data: {
    id: string;
    status: 'enabled'|'webhook_callback_verification_pending';
    type: string;
    version: string;
    condition: StreamSubscriptionsCondition;
    created_at: string;
    transport: {
      method: 'webhook'|'websocket'|'conduit';
      callback: string;
      conduit_id: string;
      session_id: string;
    }
  }[];
  total: number;
  total_cost: number;
  max_total_cost: number;
}
type GetEventSubSubscriptionResponse = {
  data: {
    id: string;
    status: 'enabled'|'webhook_callback_verification_pending'
      |'webhook_callback_verification_failed'|'notification_failures_exceeded'
      |'authorization_revoked'|'moderator_removed'|'user_removed'|'version_removed'
      |'beta_maintenance'|'websocket_disconnected'|'websocket_failed_ping_pong'
      |'websocket_received_inbound_traffic'|'websocket_connection_unused'
      |'websocket_internal_error'|'websocket_network_timeout'
      |'websocket_network_error';
    type: string;
    version: string;
    condition: {}
    created_at: string;
    transport: {
      method: string;
      callback: string;
      conduit_id: string;
      session_id: string;
    }
    cost: number;
  }[];
  total_cost: number;
  max_total_cost: number;
  pagination: {};
  cursor: string;
}
type CreateConduitsResponse = {
  data: {
    id: string;
    shard_count: number;
  }[];
}
type UpdateConduitsRequest = {
  id: string;
  shard_count: number;
}
type GetConduitsResponse = {
  data: {
    id: string;
    shard_count: number;
  }[];
}
type UpdateConduitsResponse = GetConduitsResponse;
type GetConduitShardsRequest = {
  conduit_id: string;
  status: string;
  after: string;
}
type GetConduitShardsResponse = {
  data: {
    id: string;
    status: 'enabled'|'webhook_callback_verification_pending'|'webhook_callback_verification_failed'
      |'notification_failures_exceeded'|'websocket_disconnected'|'websocket_failed_ping_pong'
      |'websocket_received_inbound_traffic'|'websocket_internal_error'|'websocket_network_timeout'
      |'websocket_network_error'|'websocket_failed_to_reconnect';
    transport: {
      method: 'webhook'|'websocket';
      callback: string;
      session_id: string;
      connected_at: string;
      disconnected_at: string;
    };
    pagination: {
      cursor: string;
    };
  }[];
}
type UpdateConduitSharedsRequest = {
  conduit_id: string;
  shards: {
    id: string;
    transport: {
      method: 'webhook'|'websocket';
      callback?: string;
      secret?: string;
      session_id?: string;
    }
  }[];
}
type UpdateConduitSharedsResponse = {
  data: {
    id: string;
    status: 'enabled'|'webhook_callback_verification_pending'|'webhook_callback_verification_failed'
      |'notification_failures_exceeded'|'websocket_disconnected'|'websocket_failed_ping_pong'
      |'websocket_received_inbound_traffic'|'websocket_internal_error'|'websocket_network_timeout'
      |'websocket_network_error'|'websocket_failed_to_reconnect';
    transport: {
      method: 'webhook'|'websocket';
      callback: string;
      session_id: string;
      connected_at: string;
      disconnected_at: string;
    };
  }[];
  errors: {
    id: string;
    message: string;
    code: string;
  }[];
}
