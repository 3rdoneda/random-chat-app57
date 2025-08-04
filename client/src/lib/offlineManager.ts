/**
 * Offline management utilities for AjnabiCam
 * Handles offline functionality and data synchronization
 */

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private isOnline = navigator.onLine;
  private actionQueue: QueuedAction[] = [];
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  constructor() {
    this.setupEventListeners();
    this.loadQueueFromStorage();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connection lost');
      this.isOnline = false;
    });

    // Process queue periodically when online
    setInterval(() => {
      if (this.isOnline && this.actionQueue.length > 0) {
        this.processQueue();
      }
    }, 30000); // Every 30 seconds
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('offline_action_queue');
      if (stored) {
        this.actionQueue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.actionQueue.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load action queue from storage:', error);
      this.actionQueue = [];
    }
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('offline_action_queue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Failed to save action queue to storage:', error);
    }
  }

  /**
   * Queue an action for later execution when online
   */
  queueAction(type: string, data: any): string {
    const action: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.actionQueue.push(action);
    this.saveQueueToStorage();

    console.log(`📝 Queued action: ${type}`);
    return action.id;
  }

  /**
   * Process queued actions
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.actionQueue.length === 0) return;

    console.log(`🔄 Processing ${this.actionQueue.length} queued actions`);

    const actionsToProcess = [...this.actionQueue];
    this.actionQueue = [];

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action);
        console.log(`✅ Executed queued action: ${action.type}`);
      } catch (error) {
        console.error(`❌ Failed to execute action ${action.type}:`, error);
        
        // Retry logic
        if (action.retryCount < this.MAX_RETRIES) {
          action.retryCount++;
          this.actionQueue.push(action);
          console.log(`🔄 Retrying action ${action.type} (attempt ${action.retryCount}/${this.MAX_RETRIES})`);
        } else {
          console.error(`💀 Action ${action.type} failed after ${this.MAX_RETRIES} retries`);
        }
      }
    }

    this.saveQueueToStorage();
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'send_message':
        // Execute message sending
        await this.executeSendMessage(action.data);
        break;
      
      case 'update_profile':
        // Execute profile update
        await this.executeUpdateProfile(action.data);
        break;
      
      case 'add_friend':
        // Execute friend addition
        await this.executeAddFriend(action.data);
        break;
      
      case 'upload_image':
        // Execute image upload
        await this.executeUploadImage(action.data);
        break;
      
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async executeSendMessage(data: any): Promise<void> {
    // Implement message sending logic
    console.log('Executing send message:', data);
  }

  private async executeUpdateProfile(data: any): Promise<void> {
    // Implement profile update logic
    console.log('Executing profile update:', data);
  }

  private async executeAddFriend(data: any): Promise<void> {
    // Implement friend addition logic
    console.log('Executing add friend:', data);
  }

  private async executeUploadImage(data: any): Promise<void> {
    // Implement image upload logic
    console.log('Executing image upload:', data);
  }

  /**
   * Check if device is online
   */
  public isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get queued actions count
   */
  public getQueuedActionsCount(): number {
    return this.actionQueue.length;
  }

  /**
   * Clear all queued actions
   */
  public clearQueue(): void {
    this.actionQueue = [];
    this.saveQueueToStorage();
    console.log('🗑️ Cleared action queue');
  }

  /**
   * Get offline status info
   */
  public getOfflineInfo(): {
    isOnline: boolean;
    queuedActions: number;
    lastSync: number | null;
  } {
    const lastSync = localStorage.getItem('last_sync_timestamp');
    
    return {
      isOnline: this.isOnline,
      queuedActions: this.actionQueue.length,
      lastSync: lastSync ? parseInt(lastSync) : null
    };
  }
}

// Singleton instance
const offlineManager = new OfflineManager();

export default offlineManager;

// React hook for offline management
export function useOfflineManager() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queued actions count periodically
    const interval = setInterval(() => {
      setQueuedActions(offlineManager.getQueuedActionsCount());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const queueAction = (type: string, data: any) => {
    return offlineManager.queueAction(type, data);
  };

  const getOfflineInfo = () => {
    return offlineManager.getOfflineInfo();
  };

  return {
    isOnline,
    queuedActions,
    queueAction,
    getOfflineInfo
  };
}