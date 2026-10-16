declare module "@rails/actioncable" {
  export type ChannelIdentifier = string | { channel: string };

  export type SubscriptionCallbacks = {
    connected?: () => void;
    disconnected?: () => void;
    rejected?: () => void;
    received?: (data: unknown) => void;
    initialized?: () => void;
  };

  export type Subscription = {
    unsubscribe: () => void;
    perform: (action: string, data?: unknown) => void;
  };

  export type Consumer = {
    subscriptions: {
      create: (identifier: ChannelIdentifier, callbacks?: SubscriptionCallbacks) => Subscription;
    };
    disconnect: () => void;
  };

  export function createConsumer(url?: string): Consumer;
}
