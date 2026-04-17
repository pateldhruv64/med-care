import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh', overflow: 'auto' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Something went wrong.</h1>
                    <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                        Reload Page
                    </button>
                    <div style={{ marginTop: '20px', fontSize: '0.8rem' }}>
                        <p>If you are on iPhone, please screenshot this and send it to the developer.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
