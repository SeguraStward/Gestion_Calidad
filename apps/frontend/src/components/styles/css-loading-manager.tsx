'use client'

import { useEffect } from 'react'
import { cssLoadingManager } from '@/lib/css-loading-manager'

export function CSSLoadingManager() {
  useEffect(() => {
    // Initialize CSS loading management
    cssLoadingManager.init()

    // Log status for debugging
    setTimeout(() => {
      const status = cssLoadingManager.getStatus()
      if (status.failed.length > 0) {
        console.warn('Some stylesheets failed to load:', status.failed)
      }
      if (status.loaded.length > 0) {
        console.log('Successfully loaded stylesheets:', status.loaded)
      }
    }, 3000)
  }, [])

  // This component doesn't render anything
  return null
}
