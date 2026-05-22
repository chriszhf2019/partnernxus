import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Structured logging for production monitoring
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      },
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
      url: window.location.href,
    };
    console.error('[ErrorBoundary]', JSON.stringify(logEntry));
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8" role="alert">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-black rounded-xl hover:bg-slate-800 dark:hover:bg-white/90 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
