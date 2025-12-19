'use client'

import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Plane,
  CreditCard,
  Shield,
  Headphones,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const Footer = () => {
  const footerLinks = {
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Investor Relations', href: '/investors' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
    Explore: [
      { name: 'Flights', href: '/flights' },
      { name: 'Hotels', href: '/hotels' },
      { name: 'Car Rental', href: '/car-rental' },
      { name: 'Flight + Hotel', href: '/packages' },
      { name: 'Travel Insurance', href: '/insurance' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Travel Guidelines', href: '/travel-guidelines' },
      { name: 'COVID-19 Info', href: '/covid-19' },
    ],
    Legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
      { name: 'Sitemap', href: '/sitemap' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ]

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'American Express', icon: '💳' },
    { name: 'PayPal', icon: '💳' },
    { name: 'Apple Pay', icon: '💳' },
    { name: 'Google Pay', icon: '💳' },
  ]

  const trustBadges = [
    { icon: Shield, text: 'Secure Booking' },
    { icon: Headphones, text: '24/7 Support' },
    { icon: CreditCard, text: 'Best Price Guarantee' },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription submitted')
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Get Exclusive Deals and Travel Tips
            </h3>
            <p className="text-blue-100 mb-8">
              Subscribe to our newsletter and never miss a great deal
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-blue-200"
              />
              <Button type="submit" className="bg-white text-primary hover:bg-gray-100">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">MyTraveler</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted partner for seamless travel experiences. Book flights, hotels, and more with confidence.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-300">{badge.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">24/7 Support</p>
                  <p className="text-white">+201024847873</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Email Support</p>
                  <p className="text-white">sameh.reda1004@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-300">Location</p>
                  <p className="text-white">
                    MSA University<br />
                    6th of October City<br />
                    Egypt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods and Social Media */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Payment Methods */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Payment Methods</h4>
              <div className="flex flex-wrap gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    title={method.name}
                  >
                    <span className="text-2xl">{method.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} MyTraveler. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-400">
              <span>ATOL Protected</span>
              <span>•</span>
              <span>IATA Member</span>
              <span>•</span>
              <span>Verified by Visa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer