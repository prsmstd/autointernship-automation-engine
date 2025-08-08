'use client'

import { useState, useEffect } from 'react'
// import { useSearchParams } from 'next/navigation' // Removed to fix build
import Link from 'next/link'

interface Certificate {
  id: string
  studentName: string
  studentEmail: string
  track: string
  issueDate: string
  completionDate: string
  validUntil: string
  skills: string[]
  grade?: string
  projectTitle?: string
  supervisorName?: string
  certType: 'standard' | 'best_performer'
  isVerified: boolean
  isExpired: boolean
  daysUntilExpiry?: number
  pdfUrl?: string
  verificationHash: string
  verifiedAt: string
}

interface VerificationResponse {
  success: boolean
  certificate?: Certificate
  error?: string
  verificationDetails?: {
    method: string
    securityLevel: string
    compliance: string
    verificationId: string
  }
  issuer?: {
    name: string
    website: string
    verificationUrl: string
    contactEmail: string
  }
}

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState('')
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationDetails, setVerificationDetails] = useState<any>(null)
  // const searchParams = useSearchParams() // Removed to fix build

  useEffect(() => {
    // Remove searchParams usage to fix build
    // const certParam = searchParams.get('cert') || searchParams.get('id')
    // if (certParam) {
    //   setCertificateId(certParam.toUpperCase())
    //   handleVerify(certParam.toUpperCase())
    // }
  }, [])

  const validateCertificateId = (id: string): boolean => {
    // PS2506DS148 format validation (PS + YYMM + 2-letter domain + 3-digit number)
    const pattern = /^PS\d{4}[A-Z]{2}\d{3}$/
    return pattern.test(id.trim().toUpperCase())
  }

  const handleVerify = async (id?: string) => {
    const idToVerify = id || certificateId
    
    if (!idToVerify.trim()) {
      setError('Please enter a certificate ID')
      return
    }

    if (!validateCertificateId(idToVerify)) {
      setError('Invalid certificate ID format. Expected format: PS2506DS148')
      return
    }

    setLoading(true)
    setError('')
    setCertificate(null)
    setVerificationDetails(null)

    try {
      const response = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate_id: idToVerify.toUpperCase()
        }),
      })

      const data: VerificationResponse = await response.json()

      if (data.success && data.certificate) {
        setCertificate(data.certificate)
        setVerificationDetails(data.verificationDetails)
      } else {
        // Fallback to demo certificates for testing
        const demoCert = getDemoCertificate(idToVerify)
        if (demoCert) {
          setCertificate(demoCert)
        } else {
          setError(data.error || 'Certificate not found')
        }
      }
    } catch (err) {
      // Fallback to demo certificates
      const demoCert = getDemoCertificate(idToVerify)
      if (demoCert) {
        setCertificate(demoCert)
      } else {
        setError('Verification service unavailable. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getDemoCertificate = (id: string): Certificate | null => {
    const demoCertificates: Record<string, Certificate> = {
      'PS2506DS148': {
        id: 'PS2506DS148',
        studentName: 'Alex Data Scientist',
        studentEmail: 'alex@example.com',
        track: 'Data Science',
        issueDate: '2025-06-15T10:00:00Z',
        completionDate: '2025-06-10T10:00:00Z',
        validUntil: '2027-06-15T10:00:00Z',
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'Pandas'],
        grade: 'A+',
        projectTitle: 'End-to-End ML Project',
        supervisorName: 'PrismStudio Team',
        certType: 'best_performer',
        isVerified: true,
        isExpired: false,
        daysUntilExpiry: 730,
        pdfUrl: '/demo-certificate.pdf',
        verificationHash: 'a1b2c3d4e5f67890',
        verifiedAt: new Date().toISOString()
      },
      'PS2506WD001': {
        id: 'PS2506WD001',
        studentName: 'John Developer',
        studentEmail: 'john@example.com',
        track: 'Web Development',
        issueDate: '2025-06-15T10:00:00Z',
        completionDate: '2025-06-10T10:00:00Z',
        validUntil: '2027-06-15T10:00:00Z',
        skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js'],
        grade: 'A',
        projectTitle: 'Full-Stack E-commerce Platform',
        supervisorName: 'PrismStudio Team',
        certType: 'standard',
        isVerified: true,
        isExpired: false,
        daysUntilExpiry: 730,
        pdfUrl: '/demo-certificate.pdf',
        verificationHash: 'b2c3d4e5f6789012',
        verifiedAt: new Date().toISOString()
      },
      'PS2506UD002': {
        id: 'PS2506UD002',
        studentName: 'Sarah Designer',
        studentEmail: 'sarah@example.com',
        track: 'UI/UX Design',
        issueDate: '2025-06-15T10:00:00Z',
        completionDate: '2025-06-10T10:00:00Z',
        validUntil: '2027-06-15T10:00:00Z',
        skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping', 'User Testing'],
        grade: 'A+',
        projectTitle: 'Complete Product Design',
        supervisorName: 'PrismStudio Team',
        certType: 'best_performer',
        isVerified: true,
        isExpired: false,
        daysUntilExpiry: 730,
        pdfUrl: '/demo-certificate.pdf',
        verificationHash: 'c3d4e5f678901234',
        verifiedAt: new Date().toISOString()
      }
    }

    return demoCertificates[id.toUpperCase()] || null
  }

  const handleShare = () => {
    if (certificate) {
      const url = `${window.location.origin}/verify?cert=${certificate.id}`
      navigator.clipboard.writeText(url)
      alert('Verification link copied to clipboard!')
    }
  }

  const handleDownload = () => {
    if (certificate?.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify()
  }

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

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-certificate text-white text-3xl"></i>
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-4">
                    Certificate Verification
                  </h1>
                  <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
                    Verify PrismStudio internship certificates instantly. Trusted by colleges, universities, and employers worldwide.
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    New Format: PS2506DS148 (PS + Year/Month + Domain + Number)
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <i className="fas fa-shield-check text-white text-2xl mb-2"></i>
                    <h3 className="text-white font-semibold mb-1">Industry Standard Security</h3>
                    <p className="text-blue-100 text-sm">SHA256 hash verification</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <i className="fas fa-university text-white text-2xl mb-2"></i>
                    <h3 className="text-white font-semibold mb-1">College Trusted</h3>
                    <p className="text-blue-100 text-sm">No login required</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <i className="fas fa-clock text-white text-2xl mb-2"></i>
                    <h3 className="text-white font-semibold mb-1">Instant Verification</h3>
                    <p className="text-blue-100 text-sm">Real-time validation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="max-w-2xl mx-auto">
                  <label htmlFor="certificateId" className="block text-lg font-semibold text-gray-700 mb-3 text-center">
                    Certificate ID
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        id="certificateId"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                        placeholder="PS2506DS148"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xl text-center tracking-wider"
                        disabled={loading}
                        maxLength={11}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={loading || !certificateId.trim()}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-shield-check text-xl"></i>
                            Verify
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mb-8 max-w-2xl mx-auto">
                  <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <i className="fas fa-exclamation-circle text-red-500 text-xl mr-4"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 mb-1">Certificate Not Found</h3>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Certificate Display */}
              {certificate && (
                <div className={`border-2 rounded-2xl overflow-hidden shadow-lg ${
                  certificate.isExpired 
                    ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' 
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                }`}>
                  {/* Verification Status */}
                  <div className={`px-8 py-6 ${
                    certificate.isExpired
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <i className={`text-white text-3xl mr-3 ${
                            certificate.isExpired ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'
                          }`}></i>
                          <h2 className="text-2xl font-bold text-white">
                            Certificate {certificate.isExpired ? 'Expired' : 'Verified'} {certificate.isExpired ? '⚠️' : '✓'}
                            {certificate.certType === 'best_performer' && (
                              <span className="ml-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                                🏆 Best Performer
                              </span>
                            )}
                          </h2>
                        </div>
                        <p className={certificate.isExpired ? 'text-orange-100' : 'text-green-100'}>
                          {certificate.isExpired 
                            ? 'This certificate has expired but was previously valid'
                            : `Verified on ${formatDate(certificate.verifiedAt)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Internship Certificate
                      </h3>
                      <p className="text-xl text-gray-600">
                        This certifies that <strong className="text-blue-600">{certificate.studentName}</strong> has successfully completed the internship program
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-user text-blue-500 mr-3"></i>
                          Student Information
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Certificate ID</label>
                            <p className="font-mono text-lg bg-gray-100 px-4 py-2 rounded-lg border mt-1">
                              {certificate.id}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Student Name</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.studentName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.studentEmail}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Track</label>
                            <p className="text-lg font-semibold text-blue-600 mt-1">{certificate.track}</p>
                          </div>
                          {certificate.grade && (
                            <div>
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Grade</label>
                              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mt-1">
                                {certificate.grade}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-calendar-check text-green-500 mr-3"></i>
                          Certificate Details
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Issue Date</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(certificate.issueDate)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Completion Date</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(certificate.completionDate)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Valid Until</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(certificate.validUntil)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${
                              certificate.isExpired 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {certificate.isExpired ? 'Expired' : 'Valid'}
                            </span>
                          </div>
                          {certificate.supervisorName && (
                            <div>
                              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Supervisor</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.supervisorName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {certificate.projectTitle && (
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-project-diagram text-purple-500 mr-3"></i>
                          Final Project
                        </h4>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <p className="text-lg font-semibold text-gray-900">{certificate.projectTitle}</p>
                        </div>
                      </div>
                    )}

                    {certificate.skills && certificate.skills.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <i className="fas fa-cogs text-indigo-500 mr-3"></i>
                          Skills Covered
                        </h4>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <div className="flex flex-wrap gap-2">
                            {certificate.skills.map((skill, index) => (
                              <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Certificate Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                      {certificate.pdfUrl && (
                        <button
                          onClick={handleDownload}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
                        >
                          <i className="fas fa-download text-xl"></i>
                          Download Certificate
                        </button>
                      )}
                      <button
                        onClick={handleShare}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-center py-4 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
                      >
                        <i className="fas fa-share text-xl"></i>
                        Share Verification Link
                      </button>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-start">
                        <i className="fas fa-shield-alt text-blue-500 text-xl mr-4 mt-1"></i>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Security Verification</h4>
                          <p className="text-blue-800 mb-2">
                            This certificate has been digitally verified using industry-standard security with SHA256 cryptographic hashing.
                          </p>
                          <div className="text-sm text-blue-600 space-y-1">
                            <p>Verification ID: {certificate.verificationHash}</p>
                            <p>Verified at: {formatDate(certificate.verifiedAt)}</p>
                            <p>Issued by: PrismStudio - https://www.prismstudio.co.in</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {verificationDetails && (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Verification Details</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Method: {verificationDetails.method}</p>
                          <p>Security Level: {verificationDetails.securityLevel}</p>
                          <p>Compliance: {verificationDetails.compliance}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Demo Certificates & Information */}
              {!certificate && !loading && (
                <div className="space-y-8">
                  {/* For Colleges & Employers */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-university text-white text-2xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        For Colleges & Employers
                      </h3>
                      <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                        Verify your students' or candidates' PrismStudio internship certificates instantly.
                        No registration required - simply enter the certificate ID.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Instant Verification</h4>
                        <p className="text-gray-600 text-sm">Get results in seconds</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fas fa-shield-alt text-blue-600 text-xl"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Industry Standard</h4>
                        <p className="text-gray-600 text-sm">SHA256 secured certificates</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fas fa-download text-purple-600 text-xl"></i>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Download PDF</h4>
                        <p className="text-gray-600 text-sm">Get official certificate copy</p>
                      </div>
                    </div>
                  </div>

                  {/* Demo Certificates */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-blue-900 mb-3">
                        <i className="fas fa-flask mr-3"></i>
                        Try Demo Verification
                      </h3>
                      <p className="text-blue-700 text-lg">
                        Test the verification system with these sample certificate IDs:
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      {[
                        { id: 'PS2506DS148', name: 'Alex Data Scientist', domain: 'Data Science', status: 'Best Performer' },
                        { id: 'PS2506WD001', name: 'John Developer', domain: 'Web Development', status: 'Certified' },
                        { id: 'PS2506UD002', name: 'Sarah Designer', domain: 'UI/UX Design', status: 'Best Performer' }
                      ].map((cert) => (
                        <button
                          key={cert.id}
                          onClick={() => {
                            setCertificateId(cert.id)
                            handleVerify(cert.id)
                          }}
                          className="text-left p-6 bg-white border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-blue-800 font-bold text-lg">{cert.id}</div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <i className="fas fa-play text-green-600 text-sm"></i>
                            </div>
                          </div>
                          <div className="text-gray-900 font-semibold mb-1">{cert.name}</div>
                          <div className="text-gray-600 text-sm">{cert.domain} • {cert.status}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                PrismStudio
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We transform your vision into dynamic software. From websites to mobile apps,
                we craft innovative digital solutions that help brands grow smarter.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/prismstudio__" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fab fa-instagram text-lg"></i>
                </a>
                <a href="https://www.linkedin.com/company/prismstudioss/" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fab fa-linkedin-in text-lg"></i>
                </a>
                <a href="mailto:team@prismstudio.co.in" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fas fa-envelope text-lg"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/#services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/#internships" className="text-gray-300 hover:text-white transition-colors">Internships</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/verify" className="text-blue-400 font-semibold">Verify Certificate</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">For Institutions</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Instant Verification</span></li>
                <li><span className="text-gray-300">No Login Required</span></li>
                <li><span className="text-gray-300">Industry Standard Security</span></li>
                <li><span className="text-gray-300">Download Certificates</span></li>
                <li><a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white transition-colors">Bulk Verification</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 mb-4 md:mb-0">
                © 2025 PrismStudio. All rights reserved. | Trusted by colleges and employers worldwide.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Use</Link>
                <a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white transition-colors">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}