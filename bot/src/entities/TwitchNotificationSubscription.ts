class TwitchNotificationSubscription {
  constructor(
    public readonly broadcasterUserId: string,
    public readonly subscriptionId: string,
  ) { }
}

export { TwitchNotificationSubscription }
