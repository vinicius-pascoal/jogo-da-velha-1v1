import Ably from "ably";

if (!process.env.ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY não configurada");
}

export const ably = new Ably.Rest(process.env.ABLY_API_KEY);
