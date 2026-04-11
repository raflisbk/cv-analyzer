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
  private isClosed = false;
  private completedReceived = false; // Guard: stop reconnecting once complete/failed arrives

  constructor(
    private url: string,
    private onMessage: (data: SSEMessage) => void,
    private onError?: (error: Error) => void
  ) {}

  connect(): void {
    if (this.isClosed || this.completedReceived) { return; }

    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as SSEMessage;

        // Mark terminal state BEFORE calling onMessage so any onerror that fires
        // synchronously after this message does not trigger a reconnect.
        if (data.stage === "complete" || data.stage === "failed") {
          this.completedReceived = true;
          this.isClosed = true;
        }

        this.onMessage(data);
      } catch (error) {
        console.error("SSE message parse error:", error);
      }
    };

    this.eventSource.onerror = () => {
      // Don't reconnect if deliberately closed or terminal event already received
      if (this.isClosed || this.completedReceived) { return; }

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
    this.isClosed = true;
    this.eventSource?.close();
    this.eventSource = null;
  }
}
