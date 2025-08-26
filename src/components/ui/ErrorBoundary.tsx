import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { GlassCard } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <GlassCard className="max-w-md text-center">
            <div className="p-6">
              <div className="mb-4">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ops! Qualcosa è andato storto</h2>
              <p className="text-muted-foreground mb-6">
                Si è verificato un errore imprevisto. Ti preghiamo di ricaricare la pagina.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="medical"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ricarica pagina
                </Button>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left text-xs text-muted-foreground bg-muted/20 p-3 rounded">
                    <summary className="cursor-pointer">Dettagli errore (dev)</summary>
                    <pre className="mt-2 overflow-auto">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}