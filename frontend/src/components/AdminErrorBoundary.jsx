import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AdminErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#151922] border border-[#252B35] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#F5F7FA]">
                Administrative View Unavailable
              </h2>
              <p className="text-xs text-[#707887]">
                An unexpected interface error occurred while rendering this module.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#101318] border border-[#252B35] rounded-xl text-left text-[11px] font-mono text-rose-400/90 truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry View
              </button>

              <a
                href="/admin"
                className="w-full sm:w-auto px-4 py-2 bg-[#1B2029] hover:bg-[#252B35] border border-[#252B35] text-[#A5ACB8] hover:text-[#F5F7FA] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Overview
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
