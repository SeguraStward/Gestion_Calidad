'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@una-gc/ui/components/dialog'
import { Button } from '@una-gc/ui/components/button'
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface AlertDialogProps {
  title: string
  description?: string
  trigger?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  variant?: 'danger' | 'info' | 'success' | 'warning'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AlertMessage({
  title,
  description,
  trigger,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  variant = 'info',
  open: controlledOpen,
  onOpenChange
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen
  const handleConfirm = () => {
    if (onConfirm) {
      try {
        onConfirm();
      } catch (error) {
        console.error('Error en onConfirm:', error);
      }
    }
    
    // Solo cerramos el diálogo si no es controlado externamente
    if (!isControlled) {
      setOpen(false);
    }
  }

  const variantStyles = {
    danger: {
      icon: <XCircle className="text-red-600 dark:text-red-400" />,
      button: 'bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:text-black',
      title: 'text-red-700 dark:text-red-300',
      description: 'text-red-600 dark:text-red-400',
      content: 'border-l-4 border-red-600 dark:border-red-500 bg-background dark:bg-background'
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-600 dark:text-yellow-400" />,
      button:
        'bg-yellow-500 text-black font-semibold hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black',
      title: 'text-yellow-700 dark:text-yellow-300',
      description: 'text-yellow-600 dark:text-yellow-400',
      content: 'border-l-4 border-yellow-500 dark:border-yellow-400 bg-background dark:bg-background'
    },
    info: {
      icon: <Info className="text-blue-600 dark:text-blue-400" />,
      button: 'bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-black',
      title: 'text-blue-700 dark:text-blue-300',
      description: 'text-blue-600 dark:text-blue-400',
      content: 'border-l-4 border-blue-600 dark:border-blue-400 bg-background dark:bg-background'
    },
    success: {
      icon: <CheckCircle2 className="text-green-600 dark:text-green-400" />,
      button:
        'bg-green-600 text-white font-semibold hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-black',
      title: 'text-green-700 dark:text-green-300',
      description: 'text-green-600 dark:text-green-400',
      content: 'border-l-4 border-green-600 dark:border-green-400 bg-background dark:bg-background'
    }
  }

  const styles = variantStyles[variant]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={`sm:max-w-md ${styles.content}`}>
        <DialogHeader className="flex flex-row items-center space-x-3">
          {styles.icon}
          <div>
            <DialogTitle className={styles.title}>{title}</DialogTitle>
            {description && <DialogDescription className={styles.description}>{description}</DialogDescription>}
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {cancelText}
          </Button>
          <Button className={styles.button} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
