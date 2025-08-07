import Link from 'next/link'

export default function InternshipsPage() {
  const internships = [
    {
      title: "Full Stack Development",
      description: "Frontend to backend development with real-world projects.",
      icon: "https://img.icons8.com/color/48/000000/source-code.png",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      duration: "3-6 months",
      level: "Intermediate"
    },
    {
      title: "Frontend Development",
      description: "Master modern frontend technologies and frameworks.",
      icon: "https://img.icons8.com/color/48/000000/react-native.png",
      skills: ["HTML5", "CSS3", "JavaScript", "React"],
      duration: "2-4 months",
      level: "Beginner"
    },
    {
      title: "Mobile App Development",
      description: "Build cross-platform mobile applications.",
      icon: "https://img.icons8.com/color/48/000000/android-os.png",
      skills: ["Flutter", "React Native", "Firebase"],
      duration: "4-6 months",
      level: "Intermediate"
    },
    {
      title: "UI/UX Design",
      description: "Create beautiful and intuitive user experiences.",
      icon: "https://img.icons8.com/color/48/000000/design.png",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      duration: "2-3 months",
      level: "Beginner"
    },
    {
      title: "Data Science & Analytics",
      description: "Analyze data and build machine learning models.",
      icon: "https://img.icons8.com/color/48/000000/data-science.png",
      skills: ["Python", "Pandas", "Machine Learning", "Visualization"],
      duration: "4-6 months",
      level: "Advanced"
    },
    {
      title: "Digital Marketing",
      description: "Learn modern digital marketing strategies.",
      icon: "https://img.icons8.com/color/48/000000/marketing.png",
      skills: ["SEO", "Social Media", "Content Marketing", "Analytics"],
      duration: "2-3 months",
      level: "Beginner"
    },
    {
      title: "DevOps & Cloud",
      description: "Master deployment and cloud infrastructure.",
      icon: "https://img.icons8.com/color/48/000000/cloud.png",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      duration: "3-5 months",
      level: "Advanced"
    },
    {
      title: "Cybersecurity",
      description: "Learn to protect systems and data from threats.",
      icon: "https://img.icons8.com/color/48/000000/security-checked.png",
      skills: ["Network Security", "Ethical Hacking", "Risk Assessment"],
      duration: "4-6 months",
      level: "Advanced"
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
              <Link href="/internships" className="text-blue-600 font-semibold">Internships</Link>
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
            Internship <span className="text-blue-600">Opportunities</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Gain real-world skills with our curated internship tracks, designed to elevate your career in tech and digital innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Internship
            </Link>
            <Link
              href="/verify"
              className="border-2 border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Internships Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {internships.map((internship, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200"
              >
                <div className="text-center mb-4">
                  <img
                    src={internship.icon}
                    alt={internship.title}
                    className="w-12 h-12 mx-auto mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {internship.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {internship.description}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Duration:</span>
                    <span className="text-sm text-gray-900">{internship.duration}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Level:</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(internship.level)}`}>
                      {internship.level}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Skills you'll learn:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Internships?</h2>
            <p className="text-xl text-gray-600">Real experience, real skills, real career growth</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-project-diagram text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Projects</h3>
              <p className="text-gray-600">Work on real client projects and build your portfolio</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Mentorship</h3>
              <p className="text-gray-600">Learn from industry professionals with years of experience</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-certificate text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-gray-600">Get industry-recognized certificates upon completion</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Opportunities</h3>
              <p className="text-gray-600">Direct placement opportunities with our partner companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start your internship journey</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600">Choose your track and submit your application</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn</h3>
              <p className="text-gray-600">Complete tasks and projects with mentor guidance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Build</h3>
              <p className="text-gray-600">Create real projects for your portfolio</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Graduate</h3>
              <p className="text-gray-600">Get certified and explore job opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Interns Say</h2>
            <p className="text-xl text-gray-600">Success stories from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Arjun Patel</h4>
                  <p className="text-gray-600 text-sm">Full Stack Developer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The internship gave me hands-on experience with real projects. I learned more in 3 months than I did in my entire college course!"
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">P</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                  <p className="text-gray-600 text-sm">UI/UX Designer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Amazing mentorship and real client work. I got placed at a top company right after completing my internship!"
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">R</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rahul Kumar</h4>
                  <p className="text-gray-600 text-sm">Data Scientist</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The practical approach to learning data science was incredible. I built 5 real ML models during my internship!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have launched their careers with PrismStudio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Apply for Internship
            </Link>
            <a
              href="mailto:team@prismstudio.co.in"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
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
                Empowering the next generation of tech professionals through hands-on internships.
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
              <h4 className="font-semibold text-white mb-4">Internship Tracks</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Full Stack Development</span></li>
                <li><span className="text-gray-300">UI/UX Design</span></li>
                <li><span className="text-gray-300">Data Science</span></li>
                <li><span className="text-gray-300">Mobile Development</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/verify" className="text-gray-300 hover:text-white">Verify Certificate</Link></li>
                <li><a href="mailto:team@prismstudio.co.in" className="text-gray-300 hover:text-white">Contact Support</a></li>
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