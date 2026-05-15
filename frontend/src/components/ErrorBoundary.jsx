import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
          <h2 style={{ color: '#F0F4FF', fontSize: 22, fontWeight: 600, margin: '0 0 10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, maxWidth: 420 }}>
            An unexpected error occurred. Refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)',
              color: '#080C14', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
