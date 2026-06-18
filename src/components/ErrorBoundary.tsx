import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('HK Event render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#faf8f5] px-6 text-center">
          <p className="font-display text-2xl text-[#4a5a44]">Une erreur est survenue</p>
          <p className="text-[#7a8b72] max-w-md">
            Rechargez la page. Si le problème persiste, videz le cache du site (Ctrl+Shift+R).
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-[#4a5a44] px-6 py-2 text-white hover:bg-[#3d4a38]"
          >
            Recharger
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
