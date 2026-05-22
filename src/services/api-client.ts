type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
};

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
};

class ApiClient {
  private baseUrl: string;
  private retryConfig: RetryConfig;

  constructor(baseUrl = '', retryConfig = defaultRetryConfig) {
    this.baseUrl = baseUrl;
    this.retryConfig = retryConfig;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) return false;
    if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
    return false;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (!this.shouldRetry(error, attempt)) throw error;
        await this.delay(this.retryConfig.baseDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, { method: 'GET', signal });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || '');
