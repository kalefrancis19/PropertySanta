export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface WebSocketConfig {
  url: string;
  userId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private config: WebSocketConfig | null = null;
  private isConnecting = false;

  constructor() {
    // Handle page visibility changes to reconnect when tab becomes visible
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.config && !this.ws) {
          this.connect(this.config);
        }
      });
    }
  }

  connect(config: WebSocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.config = config;
      this.isConnecting = true;

      try {
        this.ws = new WebSocket(config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Send initial subscription message
          this.send({
            type: 'subscribe',
            events: ['job_update', 'sms_workflow_update', 'photo_upload', 'issue_report']
          });

          if (config.onOpen) {
            config.onOpen();
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            
            if (config.onMessage) {
              config.onMessage(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          
          if (config.onClose) {
            config.onClose();
          }

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          if (config.onError) {
            config.onError(error);
          }
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (!this.config) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.config = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Helper methods for specific message types
  ping(): void {
    this.send({ type: 'ping' });
  }

  subscribe(events: string[]): void {
    this.send({
      type: 'subscribe',
      events
    });
  }

  unsubscribe(events: string[]): void {
    this.send({
      type: 'unsubscribe',
      events
    });
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();

// Helper function to connect to admin WebSocket
export const connectAdminWebSocket = (userId: string, handlers: {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
} = {}) => {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/admin/${userId}`;
  
  return websocketService.connect({
    url: wsUrl,
    userId,
    ...handlers
  });
};

// Helper function to connect to owner WebSocket
export const connectOwnerWebSocket = (userId: string, handlers: {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
} = {}) => {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/owner/${userId}`;
  
  return websocketService.connect({
    url: wsUrl,
    userId,
    ...handlers
  });
}; 