import React, { Suspense } from 'react'
import FlightDetailsClient from './client'

export async function generateStaticParams() {
  return [{ id: 'demo' }]
}

export default function FlightDetailsPage() {
  return (
    <Suspense>
      <FlightDetailsClient />
    </Suspense>
  )
}