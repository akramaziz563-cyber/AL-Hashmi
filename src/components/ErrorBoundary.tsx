import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#12284A]/10 p-8">
            <h1 className="font-serif text-2xl font-semibold text-[#12284A]">
              Something interrupted this page
            </h1>
            <p className="mt-3 text-sm text-[#4A5568] leading-relaxed">
              Please refresh the page or return to the home view. If you are managing listings in
              the admin panel, check that your signed-in account has verified permissions.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38] transition-colors"
              >
                Reload page
              </button>
              <a
                href="/"
                className="px-5 py-2.5 border border-[#12284A]/20 text-[#12284A] text-sm font-medium hover:border-[#12284A] transition-colors"
              >
                Go to home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
