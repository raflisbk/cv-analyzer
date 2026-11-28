export interface SSEMessage {
  type: "connected" | "progress" | "heartbeat" | "error";
  job_id: string;
  stage?: string;
  percentage?: number;
  message?: string;
  step?: number;
  steps?: number;
  done?: number;
  total?: number;
}

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const STALE_AFTER_MS = 25000;

export class SSEConnection {
  private eventSource: EventSource | null = null;
  private isClosed = false;
  private completedReceived = false;
  private reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private staleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private url: string,
    private onMessage: (data: SSEMessage) => void,
    private onError?: (error: Error) => void,
  ) {}

  connect(): void {
    if (this.isClosed || this.completedReceived) {
      return;
    }

    this.eventSource?.close();
    this.eventSource = new EventSource(this.url);
    this.armStaleTimer();

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as SSEMessage;
        this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
        this.armStaleTimer();

        if (data.type === "heartbeat") {
          return;
        }
        if (data.stage === "complete" || data.stage === "failed") {
          this.completedReceived = true;
          this.isClosed = true;
        }

        this.onMessage(data);
      } catch (error) {
        console.error("SSE message parse error:", error);
      }
    };

    this.eventSource.onerror = () => this.handleDrop();
  }

  private armStaleTimer(): void {
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
    }
    this.staleTimer = setTimeout(() => this.handleDrop(), STALE_AFTER_MS);
  }

  private handleDrop(): void {
    if (this.isClosed || this.completedReceived) {
      return;
    }
    this.eventSource?.close();
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.onError?.(new Error("SSE connection dropped"));
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      MAX_RECONNECT_DELAY_MS,
    );
  }

  close(): void {
    this.isClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
      this.staleTimer = null;
    }
    this.eventSource?.close();
    this.eventSource = null;
  }
}
