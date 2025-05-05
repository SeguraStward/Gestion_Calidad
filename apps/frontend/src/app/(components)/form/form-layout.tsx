import { ReactNode } from 'react'

interface FormLayoutProps {
  title: string
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  footer?: ReactNode
}

export const FormLayout = ({ title, children, onSubmit, footer }: FormLayoutProps) => (
  <form onSubmit={onSubmit} className="space-y-6 w-full max-w-3xl">
    <h2 className="text-2xl font-bold">{title}</h2>
    {children}
    {footer}
  </form>
)
