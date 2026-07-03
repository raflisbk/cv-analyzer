

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
  private isClosed = false;
  private completedReceived = false;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

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
      if (this.isClosed || this.completedReceived) { return; }

      this.eventSource?.close();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;

        console.warn(
          `SSE reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);

          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      } else {
        this.onError?.(new Error("Max SSE reconnection attempts exceeded"));
      }
    };
  }

  close(): void {
    this.isClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.eventSource?.close();
    this.eventSource = null;
  }
}
