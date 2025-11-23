'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => void
  error: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => void
  warning: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => void
  info: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => void
  loading: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => void
  dismiss: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = {
      id,
      duration: toast.type === 'loading' ? Infinity : 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss for non-persistent toasts
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clear = useCallback(() => {
    setToasts([])
  }, [])

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    return addToast(toast)
  }, [addToast])

  const success = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    return addToast({ type: 'success', title, message, ...options })
  }, [addToast])

  const error = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    return addToast({ type: 'error', title, message, persistent: true, ...options })
  }, [addToast])

  const warning = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    return addToast({ type: 'warning', title, message, ...options })
  }, [addToast])

  const info = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    return addToast({ type: 'info', title, message, ...options })
  }, [addToast])

  const loading = useCallback((title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    return addToast({ type: 'loading', title, message, persistent: true, ...options })
  }, [addToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      toast,
      success,
      error,
      warning,
      info,
      loading,
      dismiss,
      clear
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Enter animation
    setTimeout(() => setIsVisible(true), 50)
  }, [])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0'

    switch (toast.type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-green-500')} />
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-red-500')} />
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-amber-500')} />
      case 'info':
        return <Info className={cn(iconClass, 'text-blue-500')} />
      case 'loading':
        return <Loader2 className={cn(iconClass, 'text-primary animate-spin')} />
      default:
        return null
    }
  }

  const getToastStyles = () => {
    const baseStyles = 'relative flex items-start space-x-3 p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out'
    const typeStyles = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-amber-50 border-amber-200',
      info: 'bg-blue-50 border-blue-200',
      loading: 'bg-gray-50 border-gray-200'
    }

    return cn(
      baseStyles,
      typeStyles[toast.type],
      isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      isLeaving && 'translate-x-full opacity-0'
    )
  }

  return (
    <div className={getToastStyles()} role="alert">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
        )}
        {toast.action && (
          <div className="mt-2">
            <Button
              variant="link"
              size="sm"
              onClick={toast.action.onClick}
              className="p-0 h-auto text-primary hover:text-primary-700"
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      <div className="space-y-4 max-w-sm w-full">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => {}} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Toast hook for easy usage
export const toast = {
  success: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    // This will be replaced by the context when used within provider
    console.warn('Toast must be used within ToastProvider')
  },
  error: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    console.warn('Toast must be used within ToastProvider')
  },
  warning: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    console.warn('Toast must be used within ToastProvider')
  },
  info: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    console.warn('Toast must be used within ToastProvider')
  },
  loading: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'message' | 'type'>>) => {
    console.warn('Toast must be used within ToastProvider')
  },
  dismiss: (id: string) => {
    console.warn('Toast must be used within ToastProvider')
  },
  clear: () => {
    console.warn('Toast must be used within ToastProvider')
  }
}

// Higher-order component for toast integration
export const withToast = <P extends object>(Component: React.ComponentType<P>) => {
  return function WithToastComponent(props: P) {
    return (
      <ToastProvider>
        <Component {...props} />
      </ToastProvider>
    )
  }
}

export default ToastProvider