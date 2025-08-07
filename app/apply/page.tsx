'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Mail, Phone, GraduationCap, MapPin, Calendar, Code, ArrowRight, CheckCircle } from 'lucide-react'

const domains = [
  { 
    value: 'web_development', 
    label: 'Web Development',
    description: 'HTML, CSS, JavaScript, React, Node.js',
    duration: '2-3 months',
    projects: 5
  },
  { 
    value: 'ui_ux_design', 
    label: 'UI/UX Design',
    description: 'Figma, Adobe XD, User Research, Prototyping',
    duration: '2-3 months',
    projects: 5
  },
  { 
    value: 'data_science', 
    label: 'Data Science',
    description: 'Python, Machine Learning, Data Analysis, TensorFlow',
    duration: '2-3 months',
    projects: 5
  },
  { 
    value: 'pcb_design', 
    label: 'PCB Design',
    description: 'Circuit Design, PCB Layout, Altium Designer',
    duration: '2-3 months',
    projects: 5
  },
  { 
    value: 'embedded_programming', 
    label: 'Embedded Programming',
    description: 'C/C++, Microcontrollers, IoT, Arduino',
    duration: '2-3 months',
    projects: 5
  },
  { 
    value: 'fpga_verilog', 
    label: 'FPGA Verilog',
    description: 'Verilog HDL, FPGA Programming, Digital Design',
    duration: '2-3 months',
    projects: 5
  },
]

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    education: '',
    college: '',
    year: '',
    cgpa: '',
    domain: '',
    skills: '',
    experience: '',
    motivation: '',
    availability: '',
    portfolio: '',
    github: '',
    linkedin: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.phone && formData.address && formData.dateOfBirth)
      case 2:
        return !!(formData.education && formData.college && formData.year && formData.domain)
      case 3:
        return !!(formData.skills && formData.motivation)
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError('')
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      setError('Please fill in all required fields before proceeding')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Store application data in localStorage for account linking
      localStorage.setItem('applicant_info', JSON.stringify(formData))

      // Redirect to account creation/login
      router.push('/auth/signup?from=application')
    } catch (err: any) {
      setError('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedDomain = domains.find(d => d.value === formData.domain)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PrismStudio
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              <Link href="/#services" className="text-gray-600 hover:text-blue-600 font-medium">Services</Link>
              <Link href="/#internships" className="text-gray-600 hover:text-blue-600 font-medium">Internships</Link>
              <a href="mailto:team@prismstudio.co.in" className="text-gray-600 hover:text-blue-600 font-medium">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-2 mx-4 rounded ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Step {currentStep} of {totalSteps}
              </h2>
              <p className="text-gray-600">
                {currentStep === 1 && 'Personal Information'}
                {currentStep === 2 && 'Education & Track Selection'}
                {currentStep === 3 && 'Skills & Experience'}
              </p>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Apply for PrismStudio Internship
              </CardTitle>
              <CardDescription className="text-center">
                Join our comprehensive internship program and build real-world projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                          Date of Birth *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          placeholder="Enter your complete address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="pl-10 min-h-[80px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Education & Track Selection */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Education & Track Selection</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="education" className="text-sm font-medium text-gray-700">
                          Education Level *
                        </label>
                        <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="year" className="text-sm font-medium text-gray-700">
                          Current Year/Status *
                        </label>
                        <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your current year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st_year">1st Year</SelectItem>
                            <SelectItem value="2nd_year">2nd Year</SelectItem>
                            <SelectItem value="3rd_year">3rd Year</SelectItem>
                            <SelectItem value="4th_year">4th Year</SelectItem>
                            <SelectItem value="final_year">Final Year</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="working">Working Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="college" className="text-sm font-medium text-gray-700">
                          College/University *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="college"
                            type="text"
                            placeholder="Enter your college/university name"
                            value={formData.college}
                            onChange={(e) => handleInputChange('college', e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cgpa" className="text-sm font-medium text-gray-700">
                          CGPA/Percentage
                        </label>
                        <Input
                          id="cgpa"
                          type="text"
                          placeholder="e.g., 8.5 CGPA or 85%"
                          value={formData.cgpa}
                          onChange={(e) => handleInputChange('cgpa', e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="domain" className="text-sm font-medium text-gray-700">
                        Internship Track *
                      </label>
                      <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your preferred internship track" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain.value} value={domain.value}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedDomain && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">{selectedDomain.label}</h4>
                        <p className="text-blue-800 text-sm mb-2">{selectedDomain.description}</p>
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                          <span>Duration: {selectedDomain.duration}</span>
                          <span>Projects: {selectedDomain.projects}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Skills & Experience */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Experience</h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="skills" className="text-sm font-medium text-gray-700">
                        Technical Skills *
                      </label>
                      <div className="relative">
                        <Code className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="skills"
                          placeholder="List your technical skills (e.g., JavaScript, Python, React, Figma, etc.)"
                          value={formData.skills}
                          onChange={(e) => handleInputChange('skills', e.target.value)}
                          className="pl-10 min-h-[100px]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium text-gray-700">
                        Previous Experience
                      </label>
                      <Textarea
                        id="experience"
                        placeholder="Describe any previous internships, projects, or relevant experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="motivation" className="text-sm font-medium text-gray-700">
                        Why do you want to join PrismStudio? *
                      </label>
                      <Textarea
                        id="motivation"
                        placeholder="Tell us about your motivation and what you hope to achieve through this internship"
                        value={formData.motivation}
                        onChange={(e) => handleInputChange('motivation', e.target.value)}
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="availability" className="text-sm font-medium text-gray-700">
                        Availability
                      </label>
                      <Input
                        id="availability"
                        type="text"
                        placeholder="e.g., Full-time, Part-time, Weekends only"
                        value={formData.availability}
                        onChange={(e) => handleInputChange('availability', e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="portfolio" className="text-sm font-medium text-gray-700">
                          Portfolio URL
                        </label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder="https://your-portfolio.com"
                          value={formData.portfolio}
                          onChange={(e) => handleInputChange('portfolio', e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="github" className="text-sm font-medium text-gray-700">
                          GitHub Profile
                        </label>
                        <Input
                          id="github"
                          type="url"
                          placeholder="https://github.com/username"
                          value={formData.github}
                          onChange={(e) => handleInputChange('github', e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="linkedin" className="text-sm font-medium text-gray-700">
                        LinkedIn Profile
                      </label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="h-12 px-6"
                  >
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="h-12 px-6"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 px-6"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Submit Application
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real Projects</h3>
                <p className="text-gray-600 text-sm">Work on actual client projects and build your portfolio</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mentorship</h3>
                <p className="text-gray-600 text-sm">Get guidance from experienced industry professionals</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Certificate</h3>
                <p className="text-gray-600 text-sm">Earn a verified certificate upon successful completion</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}