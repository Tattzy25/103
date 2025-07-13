export interface SoloModeResult {
  sessionId: string;
  audioUrl?: string;
  translatedText?: string;
  originalText?: string;
  processingComplete: boolean;
  error?: string;
}

export class SoloModeHandler {
  private pollingInterval: number = 2000; // 2 seconds
  private maxPollingAttempts: number = 30; // 1 minute total
  private activePolls: Map<string, NodeJS.Timeout> = new Map();

  async pollForResult(sessionId: string): Promise<SoloModeResult> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        attempts++;
        
        try {
          const response = await fetch(`/api/solo-result/${sessionId}`);
          const data = await response.json();
          
          if (data.processingComplete) {
            this.clearPolling(sessionId);
            resolve(data);
          } else if (attempts >= this.maxPollingAttempts) {
            this.clearPolling(sessionId);
            reject(new Error('Polling timeout - processing took too long'));
          } else {
            // Continue polling
            const timeoutId = setTimeout(poll, this.pollingInterval);
            this.activePolls.set(sessionId, timeoutId);
          }
        } catch (error) {
          if (attempts >= this.maxPollingAttempts) {
            this.clearPolling(sessionId);
            reject(error);
          } else {
            // Continue polling on error (might be temporary)
            const timeoutId = setTimeout(poll, this.pollingInterval);
            this.activePolls.set(sessionId, timeoutId);
          }
        }
      };
      
      // Start polling
      poll();
    });
  }

  clearPolling(sessionId: string) {
    const timeoutId = this.activePolls.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activePolls.delete(sessionId);
    }
  }

  clearAllPolling() {
    this.activePolls.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activePolls.clear();
  }
}

export const soloModeHandler = new SoloModeHandler();
