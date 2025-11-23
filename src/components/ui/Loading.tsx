import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export interface LoadingDotsProps {
  className?: string
  dotCount?: number
}

export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, dotCount = 3, ...props }, ref) => (
    <div ref={ref} className={cn("flex space-x-1", className)} {...props}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 bg-current rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.16}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  )
)
LoadingDots.displayName = "LoadingDots"

export interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
}

export const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, variant = 'rectangular', width, height, ...props }, ref) => {
    const variantClasses = {
      text: 'rounded',
      rectangular: 'rounded-md',
      circular: 'rounded-full',
    }

    const style: React.CSSProperties = {
      width: width || (variant === 'text' ? '100%' : undefined),
      height: height || (variant === 'text' ? '1rem' : undefined),
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          variantClasses[variant],
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)
LoadingSkeleton.displayName = "LoadingSkeleton"

export interface LoadingBarProps {
  className?: string
  progress?: number
  showPercentage?: boolean
  height?: number
}

export const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ className, progress = 0, showPercentage = false, height = 4, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Loading</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div
        className="w-full bg-secondary rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  )
)
LoadingBar.displayName = "LoadingBar"

export interface LoadingPageProps {
  message?: string
  showSpinner?: boolean
  className?: string
}

export const LoadingPage = React.forwardRef<HTMLDivElement, LoadingPageProps>(
  ({ message = "Loading...", showSpinner = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] p-8",
        className
      )}
      {...props}
    >
      {showSpinner && (
        <LoadingSpinner size="lg" className="mb-4 text-primary" />
      )}
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  ))
}
LoadingPage.displayName = "LoadingPage"

export interface LoadingProps {
  type?: 'spinner' | 'dots' | 'skeleton' | 'bar' | 'page'
  className?: string
  // Specific props for different loading types
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  progress?: number
  showPercentage?: boolean
  barHeight?: number
  message?: string
  showSpinner?: boolean
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ type = 'spinner', className, size, variant, width, height, progress, showPercentage, barHeight, message, showSpinner, ...props }, ref) => {
    switch (type) {
      case 'dots':
        return <LoadingDots ref={ref} className={className} {...props} />
      case 'skeleton':
        return (
          <LoadingSkeleton
            ref={ref}
            className={className}
            variant={variant}
            width={width}
            height={height}
            {...props}
          />
        )
      case 'bar':
        return (
          <LoadingBar
            ref={ref}
            className={className}
            progress={progress}
            showPercentage={showPercentage}
            height={barHeight}
            {...props}
          />
        )
      case 'page':
        return (
          <LoadingPage
            ref={ref}
            className={className}
            message={message}
            showSpinner={showSpinner}
            {...props}
          />
        )
      case 'spinner':
      default:
        return (
          <LoadingSpinner
            ref={ref}
            className={className}
            size={size}
            {...props}
          />
        )
    }
  }
)
Loading.displayName = "Loading"