import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-margin-page py-10 text-center">
          <span className="material-symbols-outlined text-[48px] text-border-strong mb-4">warning</span>
          <h2 className="font-bold text-[22px] text-text-primary dark:text-inverse-on-surface mb-2">
            Something went wrong
          </h2>
          <p className="text-text-secondary dark:text-text-muted text-body-base mb-8 max-w-md">
            An unexpected error occurred. Refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
