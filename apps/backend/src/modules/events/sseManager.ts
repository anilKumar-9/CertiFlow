import { Response } from 'express';

interface ConnectedClient {
  id: string;
  res: Response;
  userId: string;
  role: string;
  districtId?: string | null;
}

export class SseManager {
  private static clients: ConnectedClient[] = [];
  private static heartbeatTimer: NodeJS.Timeout | null = null;

  public static initialize(): void {
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        this.broadcast('ping', { timestamp: new Date().toISOString() });
      }, 25000);
    }
  }

  public static addClient(client: ConnectedClient): void {
    this.clients.push(client);
    client.res.write(`event: connected\ndata: ${JSON.stringify({ clientId: client.id })}\n\n`);

    client.res.on('close', () => {
      this.removeClient(client.id);
    });
  }

  public static removeClient(clientId: string): void {
    this.clients = this.clients.filter((c) => c.id !== clientId);
  }

  public static broadcast(
    event: string,
    payload: unknown,
    filter?: (client: ConnectedClient) => boolean
  ): void {
    const data = JSON.stringify(payload);
    const message = `event: ${event}\ndata: ${data}\n\n`;

    for (const client of this.clients) {
      if (!filter || filter(client)) {
        try {
          client.res.write(message);
        } catch (err) {
          console.warn('[SSE Broadcast Failed]', err);
        }
      }
    }
  }
}
