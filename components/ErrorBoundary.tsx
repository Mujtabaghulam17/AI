import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
        // TODO: Send to error reporting service (e.g. Sentry)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    backgroundColor: '#12121f',
                    color: '#ffffff',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '420px',
                        padding: '40px 24px',
                        borderRadius: '24px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😵</div>
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            margin: '0 0 8px',
                            fontFamily: "'Poppins', sans-serif",
                        }}>
                            Oeps, er ging iets mis
                        </h2>
                        <p style={{
                            color: '#b4c0d4',
                            fontSize: '0.9rem',
                            lineHeight: 1.6,
                            margin: '0 0 24px',
                        }}>
                            Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={this.handleRetry}
                                style={{
                                    background: '#22d3ee',
                                    color: '#0f0f1a',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '14px 28px',
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                Probeer Opnieuw
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    background: 'transparent',
                                    color: '#b4c0d4',
                                    border: 'none',
                                    padding: '10px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Pagina Herladen
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
