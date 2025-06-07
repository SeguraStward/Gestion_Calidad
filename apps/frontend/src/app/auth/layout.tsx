import '@una-gc/ui/globals.css'

export const metadata = {
  title: 'Google Login App',
  description: 'Login with Google and redirect to profile'
}

import { ReactNode } from 'react'

export default function ({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </section>
  )
}
