'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Plane,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'

const Navbar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { user, isAuthenticated, logout } = useAuthStore()

  const navigation = [
    { name: 'Flights', href: '/flights', current: pathname === '/flights' },
    { name: 'Hotels', href: '/hotels', current: pathname === '/hotels' },
    { name: 'Car Rental', href: '/car-rental', current: pathname === '/car-rental' },
    { name: 'Packages', href: '/packages', current: pathname === '/packages' },
    { name: 'Support', href: '/support', current: pathname === '/support' },
  ]

  const userMenuItems = [
    { name: 'My Dashboard', href: '/dashboard', icon: User },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: ShoppingCart },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: User },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      {/* Top Bar */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-8 text-xs">
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                1-800-FLY-NOW
              </span>
              <span className="hidden sm:inline-flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                sameh.reda1004@gmail.com
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/about" className="hover:text-blue-200">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-blue-200">
                Contact
              </Link>
              <div className="flex items-center space-x-2">
                <Facebook className="h-3 w-3 hover:text-blue-200 cursor-pointer" />
                <Twitter className="h-3 w-3 hover:text-blue-200 cursor-pointer" />
                <Instagram className="h-3 w-3 hover:text-blue-200 cursor-pointer" />
                <Youtube className="h-3 w-3 hover:text-blue-200 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">MyTraveler</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  item.current
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search flights, hotels, destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="pr-10"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {user?.profile.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.profile.firstName} {user?.profile.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      )
                    })}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </form>
            </div>

            {/* Mobile Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  item.current
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile User Actions */}
            <div className="border-t pt-3 mt-3">
              {!isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.profile.firstName} {user?.profile.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar