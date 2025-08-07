import Link from 'next/link'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            
            <div className="text-gray-600 mb-8 text-center">
              <p>Last updated: January 2025</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                participate in our internship programs, or contact us for support.
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Personal information (name, email address, phone number)</li>
                <li>Educational background and skills</li>
                <li>Project submissions and portfolio items</li>
                <li>Communication preferences</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Provide and improve our internship programs</li>
                <li>Evaluate your progress and provide feedback</li>
                <li>Issue certificates upon program completion</li>
                <li>Communicate with you about your internship</li>
                <li>Send you updates about new opportunities</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>With your consent for job placement opportunities</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in our operations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                secure servers, and regular security audits.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-6">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and improve our services. You can control cookie settings through your browser preferences.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 mb-6">
                Our platform may integrate with third-party services (such as GitHub for project submissions). 
                These services have their own privacy policies, and we encourage you to review them.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If you are a parent and believe your child has provided 
                us with personal information, please contact us.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-6">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data during such transfers.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:team@prismstudio.co.in" className="text-blue-600 hover:text-blue-700">team@prismstudio.co.in</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Address:</strong> PrismStudio, India
                </p>
                <p className="text-gray-700">
                  <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours.
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
                Committed to protecting your privacy and data security.
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
                <li><Link href="/privacy" className="text-blue-400 font-semibold">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Use</Link></li>
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