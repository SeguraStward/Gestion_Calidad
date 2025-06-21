/**
 * CSS Loading Manager - Ensures stylesheets load properly
 * Provides fallback mechanisms for when external CSS fails to load
 */

export class CSSLoadingManager {
  private static instance: CSSLoadingManager
  private loadedStyles: Set<string> = new Set()
  private failedStyles: Set<string> = new Set()

  private constructor() {}

  static getInstance(): CSSLoadingManager {
    if (!CSSLoadingManager.instance) {
      CSSLoadingManager.instance = new CSSLoadingManager()
    }
    return CSSLoadingManager.instance
  }

  /**
   * Load a stylesheet with fallback mechanism
   */
  loadStylesheet(href: string, fallbackContent?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedStyles.has(href)) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href

      const timeout = setTimeout(() => {
        this.failedStyles.add(href)
        console.warn(`Stylesheet failed to load: ${href}`)

        // Apply fallback content if provided
        if (fallbackContent) {
          this.injectFallbackCSS(href, fallbackContent)
        }

        reject(new Error(`Stylesheet timeout: ${href}`))
      }, 5000) // 5 second timeout

      link.onload = () => {
        clearTimeout(timeout)
        this.loadedStyles.add(href)
        console.log(`Stylesheet loaded successfully: ${href}`)
        resolve()
      }

      link.onerror = () => {
        clearTimeout(timeout)
        this.failedStyles.add(href)
        console.error(`Stylesheet failed to load: ${href}`)

        // Apply fallback content if provided
        if (fallbackContent) {
          this.injectFallbackCSS(href, fallbackContent)
        }

        reject(new Error(`Stylesheet error: ${href}`))
      }

      document.head.appendChild(link)
    })
  }

  /**
   * Inject fallback CSS when external stylesheets fail
   */
  private injectFallbackCSS(id: string, content: string): void {
    const existingStyle = document.getElementById(`fallback-${btoa(id)}`)
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = `fallback-${btoa(id)}`
    style.type = 'text/css'
    style.innerHTML = content
    document.head.appendChild(style)

    console.log(`Fallback CSS injected for: ${id}`)
  }

  /**
   * Check if critical styles are loaded and apply fallbacks if needed
   */
  ensureCriticalStyles(): void {
    // Check if basic layout styles are working
    const testElement = document.createElement('div')
    testElement.className = 'flex items-center justify-center'
    testElement.style.position = 'absolute'
    testElement.style.top = '-9999px'
    document.body.appendChild(testElement)

    const computed = window.getComputedStyle(testElement)
    const isFlexWorking = computed.display === 'flex'

    document.body.removeChild(testElement)

    if (!isFlexWorking) {
      console.warn('Critical CSS not loaded, injecting fallback styles')
      this.injectCriticalFallbackCSS()
    }
  }

  /**
   * Inject critical fallback CSS
   */
  private injectCriticalFallbackCSS(): void {
    const criticalCSS = `
      /* Critical Fallback CSS */
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif}
      body{margin:0;font-family:inherit;line-height:inherit;color:#374151;background-color:#ffffff}
      .flex{display:flex}
      .items-center{align-items:center}
      .justify-center{justify-content:center}
      .min-h-screen{min-height:100vh}
      .w-full{width:100%}
      .max-w-md{max-width:28rem}
      .space-y-6>:not([hidden])~:not([hidden]){margin-top:1.5rem}
      .px-4{padding-left:1rem;padding-right:1rem}
      .py-2{padding-top:0.5rem;padding-bottom:0.5rem}
      .py-4{padding-top:1rem;padding-bottom:1rem}
      .px-6{padding-left:1.5rem;padding-right:1.5rem}
      .rounded-lg{border-radius:0.5rem}
      .rounded-md{border-radius:0.375rem}
      .border{border-width:1px}
      .border-gray-300{border-color:#d1d5db}
      .bg-white{background-color:#ffffff}
      .bg-blue-600{background-color:#2563eb}
      .bg-gray-50{background-color:#f9fafb}
      .text-gray-900{color:#111827}
      .text-white{color:#ffffff}
      .text-sm{font-size:0.875rem;line-height:1.25rem}
      .text-lg{font-size:1.125rem;line-height:1.75rem}
      .font-medium{font-weight:500}
      .font-semibold{font-weight:600}
      .shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}
      .shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}
      input,textarea,select{font-family:inherit;font-size:inherit;line-height:inherit;margin:0}
      input[type="text"],input[type="email"],input[type="password"],textarea,select{appearance:none;background-color:#ffffff;border:1px solid #d1d5db;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;color:#111827;width:100%}
      input[type="text"]:focus,input[type="email"]:focus,input[type="password"]:focus,textarea:focus,select:focus{outline:2px solid #2563eb;outline-offset:2px;border-color:#2563eb}
      button{cursor:pointer;font-family:inherit;font-size:inherit;line-height:inherit;margin:0;text-transform:none;appearance:button;background-color:transparent;background-image:none;border:0}
      .btn{display:inline-flex;align-items:center;justify-content:center;border-radius:0.375rem;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;transition:all 0.2s ease-in-out;border:1px solid transparent;text-decoration:none}
      .btn-primary{background-color:#2563eb;color:#ffffff}
      .btn-primary:hover{background-color:#1d4ed8}
      .btn-secondary{background-color:#ffffff;color:#374151;border-color:#d1d5db}
      .btn-secondary:hover{background-color:#f9fafb}
      .transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
      .transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
      .duration-700{transition-duration:700ms}
      .ease-in{transition-timing-function:cubic-bezier(0.4,0,1,1)}
      .opacity-0{opacity:0}
      .opacity-100{opacity:1}
      @keyframes fadeInComponent{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .animate-fadeInComponent{animation:fadeInComponent 0.7s ease-in forwards}
      .fixed{position:fixed}
      .top-4{top:1rem}
      .right-4{right:1rem}
      .z-50{z-index:50}
      @media (prefers-color-scheme:dark){
        body{background-color:#111827;color:#f9fafb}
        .bg-white{background-color:#1f2937}
        .bg-gray-50{background-color:#111827}
        .text-gray-900{color:#f9fafb}
        .border-gray-300{border-color:#374151}
        input[type="text"],input[type="email"],input[type="password"],textarea,select{background-color:#1f2937;border-color:#374151;color:#f9fafb}
        .btn-secondary{background-color:#1f2937;color:#f9fafb;border-color:#374151}
        .btn-secondary:hover{background-color:#374151}
      }
    `

    this.injectFallbackCSS('critical-styles', criticalCSS)
  }

  /**
   * Initialize CSS loading management
   */
  init(): void {
    if (typeof window === 'undefined') return

    // Check styles on DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.ensureCriticalStyles(), 100)
      })
    } else {
      setTimeout(() => this.ensureCriticalStyles(), 100)
    }

    // Check styles after a delay to catch any loading issues
    setTimeout(() => {
      this.ensureCriticalStyles()
    }, 2000)
  }

  /**
   * Get loading status
   */
  getStatus(): { loaded: string[]; failed: string[] } {
    return {
      loaded: Array.from(this.loadedStyles),
      failed: Array.from(this.failedStyles)
    }
  }
}

// Export singleton instance
export const cssLoadingManager = CSSLoadingManager.getInstance()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  cssLoadingManager.init()
}
