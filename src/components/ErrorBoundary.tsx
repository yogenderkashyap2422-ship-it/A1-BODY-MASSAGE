import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <h1 className="text-xl font-bold text-red-800 mb-2">Something went wrong.</h1>
            <p className="text-red-600">Please refresh the page or contact support.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
