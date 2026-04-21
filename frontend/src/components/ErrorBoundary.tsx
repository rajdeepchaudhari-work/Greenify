import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-line-of-defence React error boundary. Prevents the entire SPA from
 * rendering a blank screen when an unhandled exception bubbles up, and gives
 * the user a deterministic recovery path (reload).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6 text-ink">
        <div className="max-w-lg border-[3px] border-ink bg-white p-6 shadow-[6px_6px_0_#000]">
          <div className="mb-3 inline-block border-2 border-ink bg-red px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.15em] text-cream">
            Something broke
          </div>
          <h1 className="text-editorial text-3xl uppercase">Unexpected error.</h1>
          <p className="mt-3 font-sans text-sm font-medium">
            The app caught an error before it could crash. Reload to recover — if this keeps
            happening, please open a GitHub issue with the message below.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto border-2 border-ink bg-cream p-3 font-mono text-xs">
            {this.state.error.message}
          </pre>
          <button className="brut-btn mt-5 bg-yellow px-5 py-3 text-[0.8rem]" onClick={this.reset}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
