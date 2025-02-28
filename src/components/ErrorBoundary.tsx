'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { error: Error }) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch errors in child components
 * and display a fallback UI instead of crashing the app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({ error: this.state.error });
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 