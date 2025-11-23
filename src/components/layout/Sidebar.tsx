'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Plane,
  Calendar,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Heart,
  Bell,
  Shield,
  MapPin,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: SidebarItem[]
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'My Bookings',
      href: '/dashboard/bookings',
      icon: ShoppingBag,
      badge: '3',
    },
    {
      name: 'My Trips',
      href: '/dashboard/trips',
      icon: Calendar,
    },
    {
      name: 'Wishlist',
      href: '/dashboard/wishlist',
      icon: Heart,
      badge: '5',
    },
    {
      name: 'Payment Methods',
      href: '/dashboard/payment',
      icon: CreditCard,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'Travel Preferences',
      href: '/dashboard/preferences',
      icon: MapPin,
    },
    {
      name: 'Loyalty Program',
      href: '/dashboard/loyalty',
      icon: TrendingUp,
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: '2',
    },
    {
      name: 'Security',
      href: '/dashboard/security',
      icon: Shield,
    },
    {
      name: 'Travel History',
      href: '/dashboard/history',
      icon: FileText,
    },
    {
      name: 'Referrals',
      href: '/dashboard/referrals',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      name: 'Help & Support',
      href: '/dashboard/help',
      icon: HelpCircle,
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const renderSidebarItem = (item: SidebarItem) => {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <div key={item.name}>
        <Link
          href={item.href}
          onClick={onClose}
          className={cn(
            'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all group',
            active
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <div className="flex items-center space-x-3">
            <Icon
              className={cn(
                'h-5 w-5',
                active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
              )}
            />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.badge && (
              <span
                className={cn(
                  'inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full',
                  active
                    ? 'bg-white text-primary'
                    : 'bg-primary text-white'
                )}
              >
                {item.badge}
              </span>
            )}
            {item.children && (
              <ChevronRight
                className={cn(
                  'h-4 w-4',
                  active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
            )}
          </div>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                {user?.profile.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.profile.firstName} {user?.profile.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Main Navigation
              </h3>
              {sidebarItems.slice(0, 4).map(renderSidebarItem)}
            </div>

            <div className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account Management
              </h3>
              {sidebarItems.slice(4, 8).map(renderSidebarItem)}
            </div>

            <div className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Settings & Support
              </h3>
              {sidebarItems.slice(8).map(renderSidebarItem)}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar