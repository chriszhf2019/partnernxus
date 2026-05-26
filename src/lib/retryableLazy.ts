import { lazy, type ComponentType } from 'react';

/**
 * Wraps React.lazy() with automatic retry on chunk-load failures.
 * When a dynamically imported module fails to fetch (e.g. stale CDN hash),
 * it retries up to `retries` times with an exponential backoff delay.
 * If all retries fail, the error propagates to the nearest ErrorBoundary.
 */
export function retryableLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 2,
  backoffMs = 1000
) {
  let retryCount = 0;

  const load = (): Promise<{ default: T }> =>
    importFn().catch((error) => {
      retryCount++;
      if (retryCount > retries) throw error;
      return new Promise<{ default: T }>((resolve) =>
        setTimeout(() => resolve(load()), backoffMs * retryCount)
      );
    });

  return lazy(load);
}
