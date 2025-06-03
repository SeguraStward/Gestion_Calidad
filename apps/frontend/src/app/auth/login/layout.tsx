import Providers from '@/providers/providers'
import '@una-gc/ui/globals.css'

export const metadata = {
  title: 'Google Login App',
  description: 'Login with Google and redirect to profile'
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Providers>{children}</Providers>
    </>
  )
}
