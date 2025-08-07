import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-800">
              PrismStudio
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600">Services</Link>
              <Link href="/internships" className="text-gray-600 hover:text-blue-600">Internships</Link>
              <Link href="/verify" className="text-gray-600 hover:text-blue-600">Verify Certificate</Link>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Terms of Use
            </h1>
            
            <div className="text-gray-600 mb-8 text-center">
              <p>Last updated: January 2025</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using PrismStudio's internship platform, you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                PrismStudio provides an online internship platform that offers:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Skill-based internship programs</li>
                <li>AI-powered project evaluation</li>
                <li>Digital certificate issuance</li>
                <li>Mentorship and career guidance</li>
                <li>Job placement assistance</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access our services, you must:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 13 years old (or have parental consent)</li>
                <li>Use the platform for lawful purposes only</li>
                <li>Not share your account with others</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Internship Program Rules</h2>
              <p className="text-gray-700 mb-4">
                Participants in our internship programs must:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Complete all assigned tasks within specified deadlines</li>
                <li>Submit original work and properly attribute any external sources</li>
                <li>Maintain professional conduct in all interactions</li>
                <li>Respect intellectual property rights</li>
                <li>Follow mentor guidance and feedback</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Regarding intellectual property:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>You retain ownership of your original project submissions</li>
                <li>PrismStudio may use your work for educational and promotional purposes</li>
                <li>All platform content and materials are owned by PrismStudio</li>
                <li>You may not reproduce or distribute our proprietary content</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Payment and Refunds</h2>
              <p className="text-gray-700 mb-4">
                For paid services:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Certificate fees are ₹99 and must be paid upon program completion</li>
                <li>Payments are processed securely through our payment partners</li>
                <li>Refunds may be provided in exceptional circumstances</li>
                <li>All fees are in Indian Rupees (INR)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">
                You may not:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Submit plagiarized or fraudulent work</li>
                <li>Attempt to hack or compromise platform security</li>
                <li>Harass or abuse other users or staff</li>
                <li>Use the platform for commercial purposes without permission</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to terminate or suspend your account immediately, without prior notice 
                or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                Our platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Uninterrupted or error-free service</li>
                <li>Job placement upon program completion</li>
                <li>Specific learning outcomes or skill acquisition</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                In no event shall PrismStudio be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These Terms shall be interpreted and governed by the laws of India. Any disputes arising 
                from these terms will be subject to the exclusive jurisdiction of courts in India.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:team@prismstudio.co.in" className="text-blue-600 hover:text-blue-700">team@prismstudio.co.in</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Address:</strong> PrismStudio, India
                </p>
                <p className="text-gray-700">
                  <strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST
                </p>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> By continuing to use our platform after any changes to these terms, 
                  you agree to be bound by the revised terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">PrismStudio</h3>
              <p className="text-gray-300 mb-4">
                Building the future of education through technology and innovation.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/prismstudio__" className="text-gray-400 hover:text-white">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="https://www.linkedin.com/company/prismstudioss/" className="text-gray-400 hover:text-white">
                  <i className="fab fa-linkedin-in text-xl"></i>
                </a>
                <a href="mailto:team@prismstudio.co.in" className="text-gray-400 hover:text-white">
                  <i className="fas fa-envelope text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-blue-400 font-semibold">Terms of Use</Link></li>
                <li><Link href="/verify" className="text-gray-300 hover:text-white">Verify Certificate</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white">Contact Us</a></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/internships" className="text-gray-300 hover:text-white">Internships</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 PrismStudio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}