import React, { Component, StrictMode, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill process for browser environment safely
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  } else if (!(window as any).process.env) {
    (window as any).process.env = {};
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React component tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#FDF9F0',
          color: '#1B2B34',
          fontFamily: 'serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #D1E0E3',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
          }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1B2B34' }}>
              ReMEETs 〜再会のボトルメール〜
            </h1>
            <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              アプリケーションの表示中に一時的なエラーが発生しました。<br />
              下のボタンを押してページを再読み込みしてください。
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#1B2B34',
                color: '#FDF9F0',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}
            >
              ページを再読み込みする
            </button>
            {this.state.error && (
              <details open style={{ marginTop: '2rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
                <summary style={{ outline: 'none', marginBottom: '0.5rem', fontWeight: 'bold', color: '#dc2626' }}>技術的詳細 (エラーログ)</summary>
                <pre style={{
                  backgroundColor: '#f1f5f9',
                  padding: '1rem',
                  borderRadius: '12px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#991b1b'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

