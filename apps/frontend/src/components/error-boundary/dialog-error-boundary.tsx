'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@una-gc/ui/components/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DialogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[DialogErrorBoundary] Error en diálogo:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium">Ocurrió un error al abrir este diálogo.</p>
          <p className="mt-1 text-red-600">{this.state.error?.message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={this.handleReset}>
            Reintentar
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
