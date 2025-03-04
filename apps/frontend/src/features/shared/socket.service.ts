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

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          if (this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.onopen = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.onmessage = null;
          }
          this.disconnect();
        }

        const wsUrl = `${
          window.location.protocol === "https:" ? "wss:" : "ws:"
        }//${window.location.host}/${this.path}`;
        console.log("Connecting to WebSocket:", wsUrl);
        this.socket = new WebSocket(wsUrl);
        console.log("Socket initial state:", {
          readyState: this.socket.readyState,
          protocol: this.socket.protocol,
          extensions: this.socket.extensions,
          url: this.socket.url,
        });

        this.socket.onopen = () => {
          console.log("WebSocket OPEN - Connection established");
          this.reconnectAttempts = 0;
          resolve();
        };
        console.log("WebSocket onopen:", this.socket.onopen);

        this.socket.onmessage = (event) => {
          console.log("WebSocket MESSAGE received:", event.data);
          try {
            const message: TournamentSocketEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket CLOSE:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error("Maximum reconnection attempts reached"));
          } else {
            this.handleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket ERROR:", {
            error,
            readyState: this.socket?.readyState,
          });
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          } else {
            this.handleReconnect();
          }
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
    const delay = 1000;

    console.log(
      `Reconnecting in 1s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
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
