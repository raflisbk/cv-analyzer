/**
 * Server-Sent Events (SSE) connection management
 * Implements D-15: Auto-reconnect SSE with resume from last stage
 */

export interface SSEMessage {
  type: "connected" | "progress" | "error";
  job_id: string;
  stage?: string;
  percentage?: number;
  message?: string;
}

export class SSEConnection {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor(
    private url: string,
    private onMessage: (data: SSEMessage) => void,
    private onError?: (error: Error) => void
  ) {}

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as SSEMessage;
        this.onMessage(data);

        // Reset reconnect attempts on successful message
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      } catch (error) {
        console.error("SSE message parse error:", error);
      }
    };

    this.eventSource.onerror = () => {
      // Close current connection
      this.eventSource?.close();

      // Attempt reconnection per D-15
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;

        console.warn(
          `SSE reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);

        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      } else {
        this.onError?.(new Error("Max SSE reconnection attempts exceeded"));
      }
    };
  }

  close(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
