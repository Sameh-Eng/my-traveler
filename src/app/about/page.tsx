'use client'

import React from 'react'
import Link from 'next/link'
import {
    Users,
    Target,
    Lightbulb,
    Heart,
    GraduationCap,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Plane,
    Code,
    Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const AboutPage = () => {
    const teamValues = [
        {
            icon: Target,
            title: 'Our Mission',
            description: 'To create a seamless and accessible flight booking experience for travelers in the Middle East and beyond.'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'We leverage modern technologies to build solutions that make travel planning effortless.'
        },
        {
            icon: Heart,
            title: 'Passion',
            description: 'Built with love and dedication by a team of aspiring software engineers.'
        },
        {
            icon: GraduationCap,
            title: 'Learning',
            description: 'This project represents our journey of learning and applying real-world software development skills.'
        }
    ]

    const techStack = [
        'Next.js 14',
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'Zustand',
        'Tailwind CSS',
        'AviationStack API'
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Plane className="h-10 w-10" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About MyTraveler
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            We are a group of passionate students from MSA University, building a real-world
                            flight booking application to demonstrate our software engineering skills.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* Our Story Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    MyTraveler started as a university project at <strong>MSA University</strong> in
                                    6th of October City, Egypt. Our team of computer engineering students wanted to
                                    challenge ourselves by building something meaningful—a full-featured flight
                                    booking platform that people could actually use.
                                </p>
                                <p>
                                    We integrated real flight data from the AviationStack API, implemented secure
                                    user authentication, and designed a beautiful, responsive interface that works
                                    seamlessly on any device.
                                </p>
                                <p>
                                    This project represents hundreds of hours of coding, debugging, and learning.
                                    We're proud of what we've built and excited to continue improving it.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">MSA University</h3>
                                    <p className="text-gray-500">Computer Engineering Students</p>
                                </div>
                            </div>
                            <div className="border-t pt-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Built With</h4>
                                <div className="flex flex-wrap gap-2">
                                    {techStack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What Drives Us</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our core values guide every line of code we write
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamValues.map((value, index) => {
                            const Icon = value.icon
                            return (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                        <p className="text-gray-600 text-sm">{value.description}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Have questions or feedback? We'd love to hear from you!
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Email</h3>
                                <a href="mailto:sameh.reda1004@gmail.com" className="text-primary hover:underline">
                                    sameh.reda1004@gmail.com
                                </a>
                            </CardContent>
                        </Card>
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Phone</h3>
                                <a href="tel:+201024847873" className="text-primary hover:underline">
                                    +20 102 484 7873
                                </a>
                            </CardContent>
                        </Card>
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Location</h3>
                                <p className="text-gray-600">
                                    MSA University<br />
                                    6th of October City, Egypt
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Flight?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Experience the convenience of MyTraveler today
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/flights">
                            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                                Search Flights
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutPage
