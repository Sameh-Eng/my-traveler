'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  Utensils,
  Coffee,
  Wifi,
  Car,
  Shield,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Info,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { formatCurrency } from '@/lib/utils'

export interface BaggageOption {
  id: string
  name: string
  weight: number // kg
  dimensions: string
  price: number
  description: string
  restrictions?: string[]
}

export interface MealOption {
  id: string
  name: string
  description: string
  price: number
  category: 'meal' | 'snack' | 'beverage'
  dietary: string[]
  image?: string
}

export interface TravelInsuranceOption {
  id: string
  name: string
  price: number
  coverage: string
  features: string[]
  description: string
}

export interface ExtraServiceOption {
  id: string
  name: string
  price: number
  description: string
  icon: React.ReactNode
  category: 'comfort' | 'connectivity' | 'transport'
}

export interface ExtrasData {
  baggage: {
    cabin: BaggageOption[]
    checked: BaggageOption[]
    overweight: BaggageOption[]
  }
  meals: MealOption[]
  insurance: TravelInsuranceOption[]
  services: ExtraServiceOption[]
}

interface ExtrasSelectorProps {
  passengers: Array<{ id: string; name: string; type: 'adult' | 'child' | 'infant' }>
  selectedExtras: Record<string, any>
  onExtraSelect: (category: string, passengerId: string, itemId: string, quantity: number) => void
  onExtraRemove: (category: string, passengerId: string, itemId: string) => void
  className?: string
}

const ExtrasSelector: React.FC<ExtrasSelectorProps> = ({
  passengers,
  selectedExtras,
  onExtraSelect,
  onExtraRemove,
  className = ''
}) => {
  const [extrasData, setExtrasData] = useState<ExtrasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['baggage', 'meals'])

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ExtrasData = {
      baggage: {
        cabin: [
          {
            id: 'carry-on-standard',
            name: 'Standard Carry-On',
            weight: 7,
            dimensions: '55 x 40 x 20 cm',
            price: 0,
            description: 'Free with all tickets',
            restrictions: ['Must fit in overhead bin', 'Max 7kg']
          },
          {
            id: 'carry-on-plus',
            name: 'Carry-On Plus',
            weight: 10,
            dimensions: '55 x 40 x 25 cm',
            price: 39,
            description: 'Extra weight allowance',
            restrictions: ['Must fit in overhead bin', 'Max 10kg']
          }
        ],
        checked: [
          {
            id: 'checked-small',
            name: 'Small Checked Bag',
            weight: 23,
            dimensions: '158 cm total (L+W+H)',
            price: 59,
            description: 'Standard checked baggage',
            restrictions: ['Max 23kg', 'Cannot exceed 158cm total']
          },
          {
            id: 'checked-medium',
            name: 'Medium Checked Bag',
            weight: 32,
            dimensions: '158 cm total (L+W+H)',
            price: 89,
            description: 'Extra weight allowance',
            restrictions: ['Max 32kg', 'Cannot exceed 158cm total']
          }
        ],
        overweight: [
          {
            id: 'overweight-charge',
            name: 'Overweight Charge (per kg)',
            weight: 1,
            dimensions: 'N/A',
            price: 25,
            description: 'For bags exceeding weight limit',
            restrictions: ['Available per kilogram over limit']
          }
        ]
      },
      meals: [
        {
          id: 'meal-standard',
          name: 'Standard Meal',
          description: 'Hot meal with sides and beverage',
          price: 15,
          category: 'meal',
          dietary: ['vegetarian', 'vegan'],
          image: '/api/placeholder/100/100'
        },
        {
          id: 'meal-premium',
          name: 'Premium Meal',
          description: 'Gourmet meal with premium ingredients',
          price: 25,
          category: 'meal',
          dietary: ['gluten-free', 'halal', 'kosher'],
          image: '/api/placeholder/100/100'
        },
        {
          id: 'meal-kids',
          name: 'Kids Meal',
          description: 'Child-friendly meal with treats',
          price: 12,
          category: 'meal',
          dietary: ['kid-friendly'],
          image: '/api/placeholder/100/100'
        },
        {
          id: 'snack-box',
          name: 'Snack Box',
          description: 'Assorted snacks and drinks',
          price: 8,
          category: 'snack',
          dietary: []
        },
        {
          id: 'coffee-package',
          name: 'Coffee & Tea Package',
          description: 'Unlimited hot beverages',
          price: 6,
          category: 'beverage',
          dietary: []
        }
      ],
      insurance: [
        {
          id: 'insurance-basic',
          name: 'Basic Travel Protection',
          price: 25,
          coverage: '$25,000',
          features: [
            'Trip cancellation protection',
            'Medical emergency coverage',
            'Lost baggage compensation',
            'Flight delay compensation'
          ],
          description: 'Essential coverage for worry-free travel'
        },
        {
          id: 'insurance-comprehensive',
          name: 'Comprehensive Coverage',
          price: 49,
          coverage: '$100,000',
          features: [
            'Everything in Basic plus:',
            'Full trip cancellation',
            'Emergency medical evacuation',
            'Adventure activities coverage',
            '24/7 travel assistance',
            'COVID-19 protection'
          ],
          description: 'Complete protection for international travel'
        },
        {
          id: 'insurance-premium',
          name: 'Premium Plus Coverage',
          price: 89,
          coverage: '$500,000',
          features: [
            'Everything in Comprehensive plus:',
            'Cancel for any reason',
            'Pre-existing conditions covered',
            'Rental car insurance',
            'Comprehensive baggage protection'
          ],
          description: 'Maximum protection and flexibility'
        }
      ],
      services: [
        {
          id: 'wifi-basic',
          name: 'Basic Wi-Fi',
          price: 12,
          description: 'Text and email access',
          icon: <Wifi className="h-5 w-5" />,
          category: 'connectivity'
        },
        {
          id: 'wifi-streaming',
          name: 'Streaming Wi-Fi',
          price: 25,
          description: 'Full internet access for streaming',
          icon: <Wifi className="h-5 w-5" />,
          category: 'connectivity'
        },
        {
          id: 'priority-boarding',
          name: 'Priority Boarding',
          price: 18,
          description: 'Board early with priority group',
          icon: <Package className="h-5 w-5" />,
          category: 'comfort'
        },
        {
          id: 'extra-legroom',
          name: 'Extra Legroom Seat',
          price: 35,
          description: 'Additional legroom and comfort',
          icon: <Package className="h-5 w-5" />,
          category: 'comfort'
        },
        {
          id: 'airport-transfer',
          name: 'Airport Transfer',
          price: 45,
          description: 'Private car transfer to/from airport',
          icon: <Car className="h-5 w-5" />,
          category: 'transport'
        }
      ]
    }

    setTimeout(() => {
      setExtrasData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleExtraSelection = (category: string, passengerId: string, itemId: string, quantity: number) => {
    if (quantity > 0) {
      onExtraSelect(category, passengerId, itemId, quantity)
    } else {
      onExtraRemove(category, passengerId, itemId)
    }
  }

  const getPassengerExtrasCount = (passengerId: string, category: string): number => {
    return Object.keys(selectedExtras).filter(key =>
      key.startsWith(`${category}_${passengerId}_`)
    ).length
  }

  const calculatePassengerTotal = (passengerId: string): number => {
    let total = 0

    Object.entries(selectedExtras).forEach(([key, data]) => {
      if (key.includes(passengerId) && extrasData) {
        const [category, , itemId] = key.split('_')

        // Find the item in extras data
        let item = null
        if (category === 'baggage') {
          item = [...extrasData.baggage.cabin, ...extrasData.baggage.checked, ...extrasData.baggage.overweight]
            .find(b => b.id === itemId)
        } else if (category === 'meals') {
          item = extrasData.meals.find(m => m.id === itemId)
        } else if (category === 'insurance') {
          item = extrasData.insurance.find(i => i.id === itemId)
        } else if (category === 'services') {
          item = extrasData.services.find(s => s.id === itemId)
        }

        if (item) {
          total += item.price * (data.quantity || 1)
        }
      }
    })

    return total
  }

  const calculateGrandTotal = (): number => {
    return passengers.reduce((total, passenger) => total + calculatePassengerTotal(passenger.id), 0)
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!extrasData) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Failed to load extra services
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Enhance Your Journey</CardTitle>
          <CardDescription>
            Add baggage, meals, insurance, and other services to make your travel more comfortable and convenient.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Passengers Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Services by Passenger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passengers.map((passenger) => (
              <Card
                key={passenger.id}
                className={`cursor-pointer transition-all ${
                  selectedExtras && Object.keys(selectedExtras).some(key => key.includes(passenger.id))
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{passenger.name}</div>
                      <div className="text-sm text-gray-600 capitalize">{passenger.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(calculatePassengerTotal(passenger.id))}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getPassengerExtrasCount(passenger.id, 'baggage')} items
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Baggage Section */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleCategory('baggage')}
          >
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span className="font-semibold">Baggage Allowance</span>
            </div>
            {expandedCategories.includes('baggage') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {expandedCategories.includes('baggage') && (
          <CardContent className="space-y-6">
            {/* Carry-on Baggage */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Carry-On Baggage
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extrasData.baggage.cabin.map((option) => (
                  <Card key={option.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {option.name}
                            {option.price === 0 && (
                              <Badge variant="secondary" className="ml-2">Included</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {option.weight}kg • {option.dimensions}
                          </div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            {option.price === 0 ? 'FREE' : formatCurrency(option.price)}
                          </div>
                        </div>
                      </div>

                      {option.restrictions && (
                        <div className="text-xs text-gray-500 mb-3">
                          {option.restrictions.join(' • ')}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2">
                        {passengers.map((passenger) => (
                          <div key={passenger.id} className="flex items-center justify-between text-sm">
                            <span>{passenger.name}</span>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedExtras[`baggage_${passenger.id}_${option.id}`]}
                                onCheckedChange={(checked) =>
                                  handleExtraSelection(
                                    'baggage',
                                    passenger.id,
                                    option.id,
                                    checked ? 1 : 0
                                  )
                                }
                              />
                              <span>{option.price === 0 ? 'Free' : formatCurrency(option.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Checked Baggage */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Checked Baggage
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extrasData.baggage.checked.map((option) => (
                  <Card key={option.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-gray-600 mb-1">
                            {option.weight}kg • {option.dimensions}
                          </div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">{formatCurrency(option.price)}</div>
                        </div>
                      </div>

                      {option.restrictions && (
                        <div className="text-xs text-gray-500 mb-3">
                          {option.restrictions.join(' • ')}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2">
                        {passengers.map((passenger) => {
                          const currentQuantity = selectedExtras[`baggage_${passenger.id}_${option.id}`]?.quantity || 0
                          return (
                            <div key={passenger.id} className="flex items-center justify-between text-sm">
                              <span>{passenger.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleExtraSelection(
                                        'baggage',
                                        passenger.id,
                                        option.id,
                                        Math.max(0, currentQuantity - 1)
                                      )
                                    }
                                    disabled={currentQuantity === 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={currentQuantity}
                                    onChange={(e) =>
                                      handleExtraSelection(
                                        'baggage',
                                        passenger.id,
                                        option.id,
                                        Math.max(0, parseInt(e.target.value) || 0)
                                      )
                                    }
                                    className="w-16 text-center"
                                    min="0"
                                    max="5"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleExtraSelection(
                                        'baggage',
                                        passenger.id,
                                        option.id,
                                        Math.min(5, currentQuantity + 1)
                                      )
                                    }
                                    disabled={currentQuantity >= 5}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span>{formatCurrency(option.price * currentQuantity)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Meals Section */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleCategory('meals')}
          >
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <span className="font-semibold">In-Flight Meals</span>
            </div>
            {expandedCategories.includes('meals') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {expandedCategories.includes('meals') && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extrasData.meals.map((meal) => (
                <Card key={meal.id} className="border-2 hover:border-primary-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {meal.image && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Coffee className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{meal.description}</div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {meal.category}
                          </Badge>
                          <span className="font-semibold text-primary">{formatCurrency(meal.price)}</span>
                        </div>
                        {meal.dietary.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {meal.dietary.map((diet) => (
                              <Badge key={diet} variant="secondary" className="text-xs">
                                {diet}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-2">
                          {passengers.map((passenger) => {
                            const currentQuantity = selectedExtras[`meals_${passenger.id}_${meal.id}`]?.quantity || 0
                            return (
                              <div key={passenger.id} className="flex items-center justify-between text-sm">
                                <span className="text-xs">{passenger.name}</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleExtraSelection(
                                        'meals',
                                        passenger.id,
                                        meal.id,
                                        Math.max(0, currentQuantity - 1)
                                      )
                                    }
                                    disabled={currentQuantity === 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-4 text-center">{currentQuantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleExtraSelection(
                                        'meals',
                                        passenger.id,
                                        meal.id,
                                        Math.min(3, currentQuantity + 1)
                                      )
                                    }
                                    disabled={currentQuantity >= 3}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Travel Insurance Section */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleCategory('insurance')}
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Travel Insurance</span>
            </div>
            {expandedCategories.includes('insurance') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {expandedCategories.includes('insurance') && (
          <CardContent className="space-y-4">
            {extrasData.insurance.map((insurance) => (
              <Card key={insurance.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-2">{insurance.name}</div>
                      <div className="text-gray-600 mb-3">{insurance.description}</div>
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge variant="outline" className="text-sm">
                          Coverage: {insurance.coverage}
                        </Badge>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(insurance.price)}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {insurance.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passengers.map((passenger) => (
                      <div key={passenger.id} className="flex items-center justify-between">
                        <span>{passenger.name}</span>
                        <Checkbox
                          checked={selectedExtras[`insurance_${passenger.id}_${insurance.id}`]}
                          onCheckedChange={(checked) =>
                            handleExtraSelection(
                              'insurance',
                              passenger.id,
                              insurance.id,
                              checked ? 1 : 0
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Additional Services */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleCategory('services')}
          >
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span className="font-semibold">Additional Services</span>
            </div>
            {expandedCategories.includes('services') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>

        {expandedCategories.includes('services') && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extrasData.services.map((service) => (
                <Card key={service.id} className="border hover:border-primary-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary">
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{service.description}</div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-primary">{formatCurrency(service.price)}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {passengers.map((passenger) => (
                            <div key={passenger.id} className="flex items-center justify-between text-sm">
                              <span className="text-xs">{passenger.name}</span>
                              <Checkbox
                                checked={selectedExtras[`services_${passenger.id}_${service.id}`]}
                                onCheckedChange={(checked) =>
                                  handleExtraSelection(
                                    'services',
                                    passenger.id,
                                    service.id,
                                    checked ? 1 : 0
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <Card className="border-primary-200 bg-primary-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Extras Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {passengers.map((passenger) => {
              const passengerTotal = calculatePassengerTotal(passenger.id)
              const extrasCount = getPassengerExtrasCount(passenger.id, 'baggage') +
                getPassengerExtrasCount(passenger.id, 'meals') +
                getPassengerExtrasCount(passenger.id, 'insurance') +
                getPassengerExtrasCount(passenger.id, 'services')

              return (
                <div key={passenger.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">{passenger.name}</div>
                    <div className="text-sm text-gray-600">
                      {extrasCount} service{extrasCount !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                  <div className="font-semibold text-primary">
                    {formatCurrency(passengerTotal)}
                  </div>
                </div>
              )
            })}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">Total Extras Cost</div>
                  <div className="text-sm text-gray-600">For all passengers</div>
                </div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(calculateGrandTotal())}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExtrasSelector