import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/20 text-red-500 p-8 text-center rounded-xl border border-red-900/50">
                    <h2 className="text-xl font-bold mb-4">Canvas Component Crashed</h2>
                    <p className="text-sm font-mono bg-black/50 p-4 rounded text-left overflow-auto max-w-2xl w-full">
                        {this.state.error && this.state.error.toString()}
                        <br/><br/>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}
