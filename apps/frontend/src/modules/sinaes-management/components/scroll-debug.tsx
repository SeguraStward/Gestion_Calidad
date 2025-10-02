'use client'

export const ScrollDebug = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        fontSize: '12px'
      }}
    >
      <div>Window width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</div>
      <div>Content width: Should be more than window when multiple panels</div>
      <div>Scroll should appear when width &lt; content</div>
    </div>
  )
}