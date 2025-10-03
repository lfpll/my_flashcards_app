/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components and shows fallback UI
 */

import { Component } from 'react';
import { H2, Body } from './Typography';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (could send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page or reset app state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-theme-bg">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-6">😕</div>
            <H2 className="mb-3">Oops! Something went wrong</H2>
            <Body className="text-theme-textDim mb-6">
              We're sorry for the inconvenience. The app encountered an unexpected error.
              Your data is safe in your browser's storage.
            </Body>
            
            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-theme-card p-4 rounded-lg border border-theme-lighter">
                <summary className="cursor-pointer font-medium text-error mb-2">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-xs overflow-auto text-theme-textDim">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary" size="lg">
                Reload App
              </Button>
              <Button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                variant="danger"
                size="lg"
              >
                Clear Data & Reload
              </Button>
            </div>

            <p className="text-xs text-theme-textDim mt-6">
              If the problem persists, try clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

