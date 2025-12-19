'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Calendar,
  Globe,
  CreditCard,
  Phone,
  Mail,
  Info,
  Plus,
  X,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useBookingStore } from '@/store'
import { Passenger } from '@/types'
import { calculateAge, validateEmail, validatePassword } from '@/lib/utils'

// Validation schema for passenger form
const passengerSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Mx', 'Dr'], { required_error: 'Title is required' }),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  middleName: z.string().optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const age = calculateAge(parsedDate)
    return !isNaN(parsedDate.getTime()) && age >= 0 && age <= 120
  }, 'Please enter a valid date of birth'),
  gender: z.enum(['M', 'F', 'X'], { required_error: 'Gender is required' }),
  passportNumber: z.string()
    .min(6, 'Passport number too short')
    .max(20, 'Passport number too long')
    .regex(/^[A-Z0-9]+$/, 'Invalid passport format (letters and numbers only)'),
  passportExpiry: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const today = new Date()
    return !isNaN(parsedDate.getTime()) && parsedDate > today
  }, 'Passport must be valid'),
  passportCountry: z.string().min(2, 'Country code required'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')
    .min(10, 'Phone number too short'),
  specialAssistance: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  frequentFlyer: z.array(z.object({
    airline: z.string().min(1, 'Airline required'),
    number: z.string().min(1, 'Frequent flyer number required')
  })).optional(),
  seatPreference: z.enum(['window', 'aisle', 'middle', 'any']).optional(),
  mealPreference: z.string().optional()
})

type PassengerFormData = z.infer<typeof passengerSchema>

interface PassengerFormProps {
  passengerIndex: number
  passenger?: Partial<Passenger>
  onSave: (passenger: Partial<Passenger>) => void
  onRemove?: () => void
  canRemove?: boolean
  isAdult?: boolean
}

const PassengerForm = ({
  passengerIndex,
  passenger,
  onSave,
  onRemove,
  canRemove = false,
  isAdult = true
}: PassengerFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const { updatePassenger } = useBookingStore()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: isAdult ? 'Mr' : 'Ms',
      firstName: passenger?.firstName || '',
      middleName: passenger?.middleName || '',
      lastName: passenger?.lastName || '',
      dateOfBirth: passenger?.dateOfBirth ? new Date(passenger.dateOfBirth).toISOString().split('T')[0] : '',
      gender: passenger?.gender || 'M',
      passportNumber: passenger?.passport?.number || '',
      passportExpiry: passenger?.passport?.expiry ? new Date(passenger.passport.expiry).toISOString().split('T')[0] : '',
      passportCountry: passenger?.passport?.country || 'EG',
      email: passenger?.contact?.email || '',
      phone: passenger?.contact?.phone || '',
      specialAssistance: passenger?.specialAssistance || [],
      dietaryRestrictions: passenger?.dietaryRestrictions || [],
      frequentFlyer: passenger?.frequentFlyer || [],
      seatPreference: (passenger?.seatPreference as 'window' | 'aisle' | 'middle' | 'any') || 'any',
      mealPreference: passenger?.mealPreference || 'standard'
    }
  })

  const watchedSpecialAssistance = watch('specialAssistance') || []
  const watchedFrequentFlyer = watch('frequentFlyer') || []

  const countries = [
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'QA', name: 'Qatar' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'JO', name: 'Jordan' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'PS', name: 'Palestine' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'SY', name: 'Syria' },
    { code: 'YE', name: 'Yemen' },
    { code: 'LY', name: 'Libya' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'MA', name: 'Morocco' },
    { code: 'SD', name: 'Sudan' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'GR', name: 'Greece' },
    { code: 'TR', name: 'Turkey' },
    { code: 'RU', name: 'Russia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'TH', name: 'Thailand' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'ET', name: 'Ethiopia' }
  ]

  const airlines = [
    { code: 'AA', name: 'American Airlines' },
    { code: 'DL', name: 'Delta Air Lines' },
    { code: 'UA', name: 'United Airlines' },
    { code: 'SW', name: 'Southwest Airlines' },
    { code: 'BA', name: 'British Airways' },
    { code: 'LH', name: 'Lufthansa' },
    { code: 'AF', name: 'Air France' },
    { code: 'KL', name: 'KLM' },
    { code: 'EK', name: 'Emirates' },
    { code: 'SQ', name: 'Singapore Airlines' }
  ]

  const specialAssistanceOptions = [
    'Wheelchair assistance',
    'Visual impairment',
    'Hearing impairment',
    'Mobility assistance',
    'Medical equipment',
    'Service animal'
  ]

  const dietaryRestrictionOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Halal',
    'Kosher',
    'Diabetic',
    'Low sodium',
    'Child meal'
  ]

  const handleSpecialAssistanceChange = (option: string, checked: boolean) => {
    const currentAssistance = watchedSpecialAssistance
    const newAssistance = checked
      ? [...currentAssistance, option]
      : currentAssistance.filter(item => item !== option)
    setValue('specialAssistance', newAssistance)
  }

  const handleDietaryChange = (option: string, checked: boolean) => {
    const currentRestrictions = watchedSpecialAssistance
    const newRestrictions = checked
      ? [...currentRestrictions, option]
      : currentRestrictions.filter(item => item !== option)
    setValue('dietaryRestrictions', newRestrictions)
  }

  const addFrequentFlyer = () => {
    const currentFlyers = watchedFrequentFlyer
    setValue('frequentFlyer', [...currentFlyers, { airline: '', number: '' }])
  }

  const removeFrequentFlyer = (index: number) => {
    const currentFlyers = watchedFrequentFlyer
    setValue('frequentFlyer', currentFlyers.filter((_, i) => i !== index))
  }

  const onSubmit = (data: PassengerFormData) => {
    const passengerData: Partial<Passenger> = {
      id: passenger?.id || `passenger_${Date.now()}`,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      passport: {
        number: data.passportNumber,
        expiry: data.passportExpiry,
        country: data.passportCountry
      },
      contact: {
        email: data.email,
        phone: data.phone
      },
      specialAssistance: data.specialAssistance || [],
      dietaryRestrictions: data.dietaryRestrictions,
      frequentFlyer: data.frequentFlyer || [],
      seatPreference: data.seatPreference,
      mealPreference: data.mealPreference
    }

    onSave(passengerData)
    updatePassenger(passengerData.id!, passengerData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Passenger {passengerIndex + 1} {!isAdult && '(Child/Infant)'}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Please enter passenger details as they appear on their passport or government-issued ID
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor={`title-${passengerIndex}`}>Title *</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Mx">Mx</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.title && (
                  <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`firstName-${passengerIndex}`}>First Name *</Label>
                <Input
                  {...register('firstName')}
                  placeholder="First name"
                  error={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`middleName-${passengerIndex}`}>Middle Name</Label>
                <Input
                  {...register('middleName')}
                  placeholder="Middle name (optional)"
                />
              </div>

              <div>
                <Label htmlFor={`lastName-${passengerIndex}`}>Last Name *</Label>
                <Input
                  {...register('lastName')}
                  placeholder="Last name"
                  error={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`dateOfBirth-${passengerIndex}`}>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Birth *
                </Label>
                <Input
                  {...register('dateOfBirth')}
                  type="date"
                  error={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label>Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="M" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="F" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="X" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <Label>Seat Preference</Label>
                <Controller
                  name="seatPreference"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">No preference</SelectItem>
                        <SelectItem value="window">Window</SelectItem>
                        <SelectItem value="aisle">Aisle</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Passport Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Passport Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`passportNumber-${passengerIndex}`}>
                  Passport Number *
                </Label>
                <Input
                  {...register('passportNumber')}
                  placeholder="Passport number"
                  error={!!errors.passportNumber}
                />
                {errors.passportNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.passportNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`passportExpiry-${passengerIndex}`}>
                  Expiry Date *
                </Label>
                <Input
                  {...register('passportExpiry')}
                  type="date"
                  error={!!errors.passportExpiry}
                />
                {errors.passportExpiry && (
                  <p className="text-xs text-red-600 mt-1">{errors.passportExpiry.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`passportCountry-${passengerIndex}`}>
                  Issuing Country *
                </Label>
                <Controller
                  name="passportCountry"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`email-${passengerIndex}`}>
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address *
                </Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="email@example.com"
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`phone-${passengerIndex}`}>
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number *
                </Label>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  error={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Special Requirements</span>
            </h3>

            {/* Special Assistance */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Special Assistance</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {specialAssistanceOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assistance-${option}-${passengerIndex}`}
                      checked={watchedSpecialAssistance.includes(option)}
                      onCheckedChange={(checked) => handleSpecialAssistanceChange(option, checked as boolean)}
                    />
                    <Label htmlFor={`assistance-${option}-${passengerIndex}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Dietary Restrictions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dietaryRestrictionOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dietary-${option}-${passengerIndex}`}
                      checked={watchedSpecialAssistance.includes(option)}
                      onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                    />
                    <Label htmlFor={`dietary-${option}-${passengerIndex}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frequent Flyer Programs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Frequent Flyer Programs</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFrequentFlyer}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Program
              </Button>
            </div>

            {watchedFrequentFlyer.map((flyer, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Airline</Label>
                  <Controller
                    name={`frequentFlyer.${index}.airline`}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {airlines.map(airline => (
                            <SelectItem key={airline.code} value={airline.code}>
                              {airline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Number</Label>
                    <Input
                      {...register(`frequentFlyer.${index}.number`)}
                      placeholder="Frequent flyer number"
                    />
                  </div>
                  {watchedFrequentFlyer.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFrequentFlyer(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button type="submit">
              Save Passenger
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PassengerForm