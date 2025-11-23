import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MyTraveler - Book Flights, Hotels & Travel Packages',
    template: '%s | MyTraveler'
  },
  description: 'Your trusted partner for seamless travel experiences. Book flights, hotels, car rentals, and complete travel packages with confidence. Best price guarantee and 24/7 support.',
  keywords: [
    'flights',
    'airline tickets',
    'hotel booking',
    'travel packages',
    'car rental',
    'vacation',
    'cheap flights',
    'travel deals',
    'airline booking'
  ],
  authors: [{ name: 'MyTraveler Team' }],
  creator: 'MyTraveler',
  publisher: 'MyTraveler',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mytraveler.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mytraveler.com',
    title: 'MyTraveler - Book Flights, Hotels & Travel Packages',
    description: 'Your trusted partner for seamless travel experiences. Book flights, hotels, car rentals, and complete travel packages with confidence.',
    siteName: 'MyTraveler',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MyTraveler - Your Travel Partner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyTraveler - Book Flights, Hotels & Travel Packages',
    description: 'Your trusted partner for seamless travel experiences. Book flights, hotels, car rentals, and complete travel packages with confidence.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme color */}
        <meta name="theme-color" content="#0066CC" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Additional SEO meta tags */}
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="language" content="en" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "MyTraveler",
              "url": "https://mytraveler.com",
              "logo": "https://mytraveler.com/logo.png",
              "description": "Your trusted partner for seamless travel experiences. Book flights, hotels, car rentals, and complete travel packages with confidence.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Travel Street",
                "addressLocality": "New York",
                "addressRegion": "NY",
                "postalCode": "10001",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-FLY-NOW",
                "contactType": "customer service",
                "availableLanguage": ["English"]
              },
              "sameAs": [
                "https://www.facebook.com/mytraveler",
                "https://www.twitter.com/mytraveler",
                "https://www.instagram.com/mytraveler"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}