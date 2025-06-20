'use client'

import { ReactNode } from 'react'

interface FormLayoutProps {
  title: string | ReactNode
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  footer?: ReactNode
  className?: string // <---- agregamos
}

export const FormLayout = ({ title, children, onSubmit, footer, className = '' }: FormLayoutProps) => (
  <form onSubmit={onSubmit} className={`space-y-6 w-full max-w-3xl ${className}`}>
    <h2 className="text-2xl font-bold">{title}</h2>
    {children}
    {footer}
  </form>
)
