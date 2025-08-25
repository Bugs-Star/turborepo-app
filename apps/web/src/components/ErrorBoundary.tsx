"use client";

/**
 * React Error Boundary
 * 예상치 못한 JavaScript 에러를 처리하는 컴포넌트
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { handleError } from "@/lib/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 상태를 업데이트하여 fallback UI를 렌더링
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    const enhancedError = {
      ...error,
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
    };

    handleError(enhancedError, "REACT_ERROR_BOUNDARY");
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용, 없으면 기본 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 fallback UI
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              예상치 못한 오류가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6">
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 편의를 위한 HOC
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
