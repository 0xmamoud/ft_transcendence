import { TournamentSocketEvent } from "@/features/play/tournament.socket.service";

export abstract class SocketService {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private path: string;

  constructor(path: string) {
    this.path = path;
    this.eventHandlers = new Map();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${
          window.location.protocol === "https:" ? "wss:" : "ws:"
        }//${window.location.host}/${this.path}`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: TournamentSocketEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Maximum reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = 2000;

    console.log(
      `Reconnecting in 2s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.eventHandlers.set(event, callback);
  }

  off(event: string): void {
    this.eventHandlers.delete(event);
  }

  emit(event: string, data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    this.socket.send(JSON.stringify({ event, data }));
  }

  private handleMessage(message: TournamentSocketEvent): void {
    const { event, data } = message;

    console.log(`Received WebSocket event: ${event}`, data);

    const handler = this.eventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  }
}
