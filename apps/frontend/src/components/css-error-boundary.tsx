'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class CSSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CSS Error Boundary caught an error:', error, errorInfo)

    // Check if this might be a CSS loading error
    if (error.message.includes('stylesheet') || error.message.includes('css')) {
      console.warn('Potential CSS loading error detected, applying emergency styles')
      this.applyEmergencyStyles()
    }
  }

  private applyEmergencyStyles() {
    const emergencyCSS = `
      /* Emergency CSS - Applied when CSS loading fails */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        line-height: 1.5 !important;
        color: #333 !important;
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .emergency-container {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 100vh !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      }
      
      .emergency-content {
        max-width: 400px !important;
        width: 100% !important;
        padding: 24px !important;
        background: #f9f9f9 !important;
        border: 1px solid #ddd !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
      }
      
      .emergency-title {
        font-size: 18px !important;
        font-weight: 600 !important;
        margin-bottom: 16px !important;
        color: #333 !important;
      }
      
      .emergency-text {
        font-size: 14px !important;
        color: #666 !important;
        margin-bottom: 16px !important;
      }
      
      .emergency-button {
        background: #007bff !important;
        color: white !important;
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 14px !important;
      }
      
      .emergency-button:hover {
        background: #0056b3 !important;
      }
      
      .emergency-input {
        width: 100% !important;
        padding: 8px 12px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        margin-bottom: 12px !important;
        box-sizing: border-box !important;
      }
      
      .emergency-form {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
      }
    `

    const existingEmergencyStyle = document.getElementById('emergency-css')
    if (!existingEmergencyStyle) {
      const style = document.createElement('style')
      style.id = 'emergency-css'
      style.innerHTML = emergencyCSS
      document.head.appendChild(style)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="emergency-container">
            <div className="emergency-content">
              <h2 className="emergency-title">Error de Carga de Estilos</h2>
              <p className="emergency-text">
                Hubo un problema cargando los estilos de la aplicación. La funcionalidad está disponible pero con estilos básicos.
              </p>
              <button className="emergency-button" onClick={() => window.location.reload()}>
                Recargar Página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
