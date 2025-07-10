'use client'

import { useEffect, useState } from 'react'

export function StylesheetLoadingTest() {
  const [stylesLoaded, setStylesLoaded] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const testCSS = () => {
      const results: string[] = []

      // Test 1: Check if flex is working
      const flexTest = document.createElement('div')
      flexTest.className = 'flex'
      flexTest.style.position = 'absolute'
      flexTest.style.top = '-9999px'
      document.body.appendChild(flexTest)

      const flexComputed = window.getComputedStyle(flexTest)
      if (flexComputed.display === 'flex') {
        results.push('✅ Flex layout working')
      } else {
        results.push('❌ Flex layout NOT working')
      }

      document.body.removeChild(flexTest)

      // Test 2: Check if colors are working
      const colorTest = document.createElement('div')
      colorTest.className = 'bg-blue-600'
      colorTest.style.position = 'absolute'
      colorTest.style.top = '-9999px'
      document.body.appendChild(colorTest)

      const colorComputed = window.getComputedStyle(colorTest)
      if (
        colorComputed.backgroundColor.includes('37') ||
        colorComputed.backgroundColor.includes('99') ||
        colorComputed.backgroundColor.includes('235')
      ) {
        results.push('✅ Colors working')
      } else {
        results.push('❌ Colors NOT working')
      }

      document.body.removeChild(colorTest)

      // Test 3: Check if spacing is working
      const spacingTest = document.createElement('div')
      spacingTest.className = 'px-4'
      spacingTest.style.position = 'absolute'
      spacingTest.style.top = '-9999px'
      document.body.appendChild(spacingTest)

      const spacingComputed = window.getComputedStyle(spacingTest)
      if (spacingComputed.paddingLeft === '16px' || spacingComputed.paddingLeft === '1rem') {
        results.push('✅ Spacing working')
      } else {
        results.push('❌ Spacing NOT working')
      }

      document.body.removeChild(spacingTest)

      setTestResults(results)
      setStylesLoaded(results.every((r) => r.includes('✅')))
    }

    // Test immediately and after a delay
    setTimeout(testCSS, 100)
    setTimeout(testCSS, 1000)
    setTimeout(testCSS, 3000)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV != 'development') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: stylesLoaded ? '#22c55e' : '#ef4444',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '200px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CSS Status: {stylesLoaded ? 'OK' : 'ISSUES'}</div>
      {testResults.map((result, index) => (
        <div key={index} style={{ fontSize: '10px' }}>
          {result}
        </div>
      ))}
    </div>
  )
}
