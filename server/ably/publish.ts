import Ably from "ably";

export interface AblyPublishRequest {
  channel: string;
  data: any;
}

export async function publishToAbly({ channel, data }: AblyPublishRequest) {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) throw new Error("ABLY_API_KEY not set in environment");
  const client = new Ably.Rest(apiKey);
  await client.channels.get(channel).publish("message", data);
  return true;
}