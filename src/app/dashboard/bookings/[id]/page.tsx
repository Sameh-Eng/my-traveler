import React, { Suspense } from 'react'
import BookingDetailsClient from './client'

export async function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default function BookingDetailsPage() {
  return (
    <Suspense>
      <BookingDetailsClient />
    </Suspense>
  )
}