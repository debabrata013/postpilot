'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              We're sorry, but there was an error loading this page. Please try refreshing the page.
            </p>
            <div className="bg-gray-800 p-3 rounded text-sm text-gray-400 overflow-auto max-h-40 mb-4">
              <pre>{this.state.error?.toString()}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
