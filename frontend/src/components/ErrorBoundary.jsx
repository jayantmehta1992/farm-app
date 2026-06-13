import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', {
      message: error.message,
      component: info.componentStack,
    });
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="px-4 py-4 text-sm border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium text-red-700">Something went wrong</p>
          <p className="text-xs mt-1 text-red-400 font-mono">{this.state.error.message}</p>
          <button
            onClick={this.handleReset}
            className="mt-3 text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-100 cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
