import React from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center text-amber-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-7 h-7 text-amber-700" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-black font-display tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-black/60 font-mono mt-1">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Recover View</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-black hover:bg-neutral-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
