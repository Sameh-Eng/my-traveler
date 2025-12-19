'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  overlay?: boolean
  showSearch?: boolean
  showCTA?: boolean
  customContent?: React.ReactNode
}

const Header = ({
  title,
  subtitle,
  description,
  backgroundImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=600&fit=crop&auto=format',
  overlay = true,
  showSearch = false,
  showCTA = false,
  customContent
}: HeaderProps) => {
  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        {overlay && (
          <div className="absolute inset-0 bg-black/40" />
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {subtitle && (
            <p className="text-blue-300 font-semibold text-lg md:text-xl mb-4 uppercase tracking-wide">
              {subtitle}
            </p>
          )}

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          {customContent}

          {showCTA && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white transform rotate-180"
          fill="currentColor"
          viewBox="0 0 1440 64"
        >
          <path d="M0,64L60,58.7C120,53,240,43,360,37.3C480,32,600,32,720,34.7C840,37,960,43,1080,45.3C1200,48,1320,48,1380,48L1440,48L1440,64L1380,64C1320,64,1200,64,1080,64C960,64,840,64,720,64C600,64,480,64,360,64C240,64,120,64,60,64L0,64Z" />
        </svg>
      </div>
    </div>
  )
}

export default Header