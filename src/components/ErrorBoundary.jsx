import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Optionally send error + info to a logging service here.
    // console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: 24 }}>
          <h1>Unable to load this page</h1>
          <p>The app hit an unexpected error while loading data.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: "10px 14px", marginTop: 12 }}
          >
            Reload
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}



