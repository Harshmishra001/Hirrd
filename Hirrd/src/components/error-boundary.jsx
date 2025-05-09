import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">We're sorry, but there was an error loading this page.</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </button>
          <details className="mt-4 p-4 bg-gray-800 rounded max-w-2xl w-full">
            <summary className="cursor-pointer mb-2">Technical Details</summary>
            <p className="text-red-400">{this.state.error && this.state.error.toString()}</p>
            <div className="mt-2 text-gray-400 text-sm overflow-auto max-h-96">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
