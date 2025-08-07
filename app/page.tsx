'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(false)

  const supabase = createSupabaseClient()

  useEffect(() => {
    // Check if Supabase is configured
    const hasConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co')
    setHasSupabaseConfig(hasConfig)
    
    if (hasConfig) {
      checkUser()
    } else {
      setLoading(false)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PrismStudio
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#internships" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Internships</a>
              <Link href="/verify" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Verify Certificate</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Login</Link>
              <Link 
                href="/apply" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Empowering Businesses,
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Enabling Futures
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              At PrismStudio, we build custom software solutions for businesses and provide 
              <span className="font-semibold text-blue-600"> skill-first internships</span> on live projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <a
              href="#services"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Services
            </a>
            <Link
              href="/apply"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Apply for Internship
            </Link>
          </div>

          {/* MSME Badge */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-certificate text-white text-sm"></i>
            </div>
            <span className="text-gray-700 font-semibold">MSME Certified & Trusted</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About PrismStudio</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At PrismStudio, we empower offline businesses to thrive in the digital age. Our mission is to bridge 
                the gap between traditional stores and cutting-edge technology by delivering customized software 
                solutions that fuel growth and streamline operations.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Specializing in custom software development, web application development, and mobile app development, 
                we craft scalable, user-friendly digital platforms that help businesses connect with their customers online.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Committed to excellence, innovation, and client success, PrismStudio is your trusted partner in 
                transforming offline stores into dynamic online enterprises.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-store text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empowering Offline Businesses</h3>
              <p className="text-gray-600">Helping traditional businesses go digital.</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-code text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Software Development</h3>
              <p className="text-gray-600">Tailored software to meet your business needs.</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-World Internships</h3>
              <p className="text-gray-600">Hands-on experience through live projects.</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trusted Partner</h3>
              <p className="text-gray-600">We build. You grow. Digitally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering businesses through world-class digital solutions tailored for performance, aesthetics, and scalability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Web Design & Development",
                description: "Engaging, high-performance websites that convert and inspire.",
                icon: "fas fa-globe",
                gradient: "from-blue-500 to-blue-600",
                tags: ["Responsive Design", "E-commerce", "CMS Integration", "SEO Optimization"]
              },
              {
                title: "Mobile App Development",
                description: "Feature-rich mobile apps for both Android and iOS platforms.",
                icon: "fas fa-mobile-alt",
                gradient: "from-purple-500 to-purple-600",
                tags: ["iOS & Android", "React Native", "Flutter", "App Store Optimization"]
              },
              {
                title: "Digital Marketing",
                description: "Boost visibility and drive leads through strategic campaigns.",
                icon: "fas fa-bullhorn",
                gradient: "from-orange-500 to-red-500",
                tags: ["SEO", "Social Media", "Content Marketing", "PPC Campaigns"]
              },
              {
                title: "Video Production & Editing",
                description: "Creative video content for business branding and training.",
                icon: "fas fa-video",
                gradient: "from-green-500 to-green-600",
                tags: ["Explainer Videos", "Corporate Shoots", "Social Media Edits"]
              },
              {
                title: "Data Analysis & Visualization",
                description: "Data-driven insights and dashboards for smarter decisions.",
                icon: "fas fa-chart-bar",
                gradient: "from-yellow-500 to-orange-500",
                tags: ["Dashboards", "Analytics", "Custom Reports"]
              },
              {
                title: "UI/UX Design",
                description: "Intuitive and beautiful experiences for your users.",
                icon: "fas fa-paint-brush",
                gradient: "from-indigo-500 to-purple-500",
                tags: ["Wireframing", "Prototyping", "Usability Testing"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <i className={`${service.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Services
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Internships Section */}
      <section id="internships" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Internship Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Gain real-world skills with our AI-powered internship platform. Complete projects, get evaluated by AI, and earn verified certificates.
            </p>
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 px-6 py-3 rounded-full">
              <i className="fas fa-robot text-blue-600 mr-2"></i>
              <span className="text-gray-700 font-semibold">AI-Powered Evaluation & Automated Certificates</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "🌐 Web Development",
                description: "Master web technologies and build modern web applications.",
                courses: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases"],
                durations: ["1 month", "2 months"],
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "🧩 Full Stack Development",
                description: "Master both frontend and backend technologies for complete web solutions.",
                courses: ["JavaScript", "React", "Node.js", "Databases"],
                durations: ["1 month", "2 months"],
                color: "from-purple-500 to-purple-600"
              },
              {
                title: "☕ Java Development",
                description: "Build enterprise-grade applications with Java and related frameworks.",
                courses: ["Core Java", "Spring Boot", "Hibernate", "Microservices"],
                durations: ["1 month", "2 months"],
                color: "from-orange-500 to-red-500"
              },
              {
                title: "🎨 UI/UX Design",
                description: "Create beautiful and intuitive user experiences.",
                courses: ["Figma", "Adobe XD", "Prototyping", "User Research"],
                durations: ["2-3 months"],
                color: "from-pink-500 to-purple-500"
              },
              {
                title: "📱 Mobile App Development",
                description: "Build cross-platform mobile applications.",
                courses: ["Flutter", "React Native", "Firebase"],
                durations: ["4-6 months"],
                color: "from-green-500 to-teal-500"
              },
              {
                title: "📊 Data Science",
                description: "Analyze data and build machine learning models.",
                courses: ["Python", "Pandas", "Machine Learning", "Visualization"],
                durations: ["4-6 months"],
                color: "from-indigo-500 to-blue-500"
              }
            ].map((internship, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{internship.title}</h3>
                <p className="text-gray-600 mb-6">{internship.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Courses:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.courses.map((course, courseIndex) => (
                      <span key={courseIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Durations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {internship.durations.map((duration, durationIndex) => (
                      <span key={durationIndex} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {duration}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/apply"
                  className={`block w-full text-center bg-gradient-to-r ${internship.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/apply"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mr-4"
            >
              Apply for Internship
              <i className="fas fa-rocket ml-2"></i>
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Verify Certificate
              <i className="fas fa-certificate ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose PrismStudio</h2>
            <p className="text-xl text-gray-600">What makes us different</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Zero Fees",
                description: "All internships are completely free and accessible.",
                icon: "fas fa-gift",
                color: "from-green-500 to-green-600"
              },
              {
                title: "Hands-On Projects",
                description: "Build real projects that solve real problems.",
                icon: "fas fa-tools",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "AI-Powered Mentorship",
                description: "Get instant feedback from our advanced AI evaluation system.",
                icon: "fas fa-robot",
                color: "from-purple-500 to-purple-600"
              },
              {
                title: "Skill-First Focus",
                description: "We prioritize practical experience over theory, ensuring job-ready skills.",
                icon: "fas fa-target",
                color: "from-orange-500 to-red-500"
              },
              {
                title: "Flexible Schedules",
                description: "Learn at your pace, on your time, without compromising on quality.",
                icon: "fas fa-clock",
                color: "from-teal-500 to-teal-600"
              },
              {
                title: "MSME Certified",
                description: "Government recognized and trusted by businesses across India.",
                icon: "fas fa-certificate",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-xl text-gray-600">Ready to start your digital transformation journey?</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Tell us about your project or inquiry"
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

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
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#internships" className="text-gray-300 hover:text-white transition-colors">Internships</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/verify" className="text-gray-300 hover:text-white transition-colors">Verify Certificate</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Internship Tracks</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Web Development</span></li>
                <li><span className="text-gray-300">Full-Stack Engineering</span></li>
                <li><span className="text-gray-300">Mobile App Development</span></li>
                <li><span className="text-gray-300">Java Programming</span></li>
                <li><span className="text-gray-300">UI/UX Design</span></li>
                <li><span className="text-gray-300">Data Science</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 mb-4 md:mb-0">
                © 2025 PrismStudio. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Use</Link>
                <a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}