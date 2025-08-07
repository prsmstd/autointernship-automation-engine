import Link from 'next/link'

export default function ServicesPage() {
  const services = [
    {
      title: "Web Design & Development",
      description: "Engaging, high-performance websites that convert and inspire.",
      color: "border-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: "fas fa-globe",
      tags: ["Responsive Design", "E-commerce", "CMS Integration", "SEO Optimization"]
    },
    {
      title: "Mobile App Development",
      description: "Feature-rich mobile apps for both Android and iOS platforms.",
      color: "border-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      icon: "fas fa-mobile-alt",
      tags: ["iOS & Android", "React Native", "Flutter", "App Store Optimization"]
    },
    {
      title: "Digital Marketing",
      description: "Boost visibility and drive leads through strategic campaigns.",
      color: "border-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      icon: "fas fa-bullhorn",
      tags: ["SEO", "Social Media", "Content Marketing", "PPC Campaigns"]
    },
    {
      title: "Video Production & Editing",
      description: "Creative video content for business branding and training.",
      color: "border-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      icon: "fas fa-video",
      tags: ["Explainer Videos", "Corporate Shoots", "Social Media Edits"]
    },
    {
      title: "Data Analysis & Visualization",
      description: "Data-driven insights and dashboards for smarter decisions.",
      color: "border-yellow-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      icon: "fas fa-chart-bar",
      tags: ["Dashboards", "Analytics", "Custom Reports"]
    },
    {
      title: "UI/UX Design",
      description: "Intuitive and beautiful experiences for your users.",
      color: "border-indigo-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      icon: "fas fa-paint-brush",
      tags: ["Wireframing", "Prototyping", "Usability Testing"]
    }
  ]

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
              <Link href="/services" className="text-blue-600 font-semibold">Services</Link>
              <Link href="/internships" className="text-gray-600 hover:text-blue-600">Internships</Link>
              <Link href="/verify" className="text-gray-600 hover:text-blue-600">Verify Certificate</Link>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-blue-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering businesses through world-class digital solutions tailored for performance, aesthetics, and scalability.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-t-4 ${service.color}`}
              >
                <div className={`w-16 h-16 ${service.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  <i className={`${service.icon} ${service.iconColor} text-2xl`}></i>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                
                <div className="mb-4">
                  <strong className="text-gray-900 text-sm">What we offer:</strong>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600">How we deliver exceptional results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discovery</h3>
              <p className="text-gray-600">Understanding your business needs and goals</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Planning</h3>
              <p className="text-gray-600">Creating a strategic roadmap for success</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Development</h3>
              <p className="text-gray-600">Building your solution with precision</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Launch</h3>
              <p className="text-gray-600">Deploying and supporting your success</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technologies We Use</h2>
            <p className="text-xl text-gray-600">Cutting-edge tools for modern solutions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "React", icon: "fab fa-react", color: "text-blue-500" },
              { name: "Node.js", icon: "fab fa-node-js", color: "text-green-500" },
              { name: "Python", icon: "fab fa-python", color: "text-yellow-500" },
              { name: "Flutter", icon: "fas fa-mobile-alt", color: "text-blue-400" },
              { name: "AWS", icon: "fab fa-aws", color: "text-orange-500" },
              { name: "Docker", icon: "fab fa-docker", color: "text-blue-600" }
            ].map((tech, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-3">
                  <i className={`${tech.icon} ${tech.color} text-2xl`}></i>
                </div>
                <p className="text-gray-700 font-medium">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss how we can help transform your business digitally
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:team@prismstudio.co.in"
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Free Consultation
            </a>
            <Link
              href="/about"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">PrismStudio</h3>
              <p className="text-gray-300 mb-4">
                Empowering businesses through world-class digital solutions.
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
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Web Development</span></li>
                <li><span className="text-gray-300">Mobile Apps</span></li>
                <li><span className="text-gray-300">Digital Marketing</span></li>
                <li><span className="text-gray-300">UI/UX Design</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li><a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white">team@prismstudio.co.in</a></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Use</Link></li>
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