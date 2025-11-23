'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import BookingWizard from '@/components/forms/BookingWizard'

const BookingPage = () => {
  const router = useRouter()

  return (
    <div>
      <BookingWizard />
    </div>
  )
}

export default BookingPage