'use client'
import { useState } from 'react'

interface DomainSelectorProps {
  onSelect: (domain: string) => void
  domains: Record<string, string>
  onClose?: () => void
}

const DOMAIN_DESCRIPTIONS = {
  'web_development': 'Learn HTML, CSS, JavaScript, and modern web frameworks to build responsive websites and web applications.',
  'ui_ux_design': 'Master user interface design, user experience principles, wireframing, prototyping, and design systems.',
  'data_science': 'Explore data analysis, machine learning, statistical modeling, and data visualization techniques.',
  'pcb_design': 'Design printed circuit boards, electronic circuits, and hardware systems for various applications.',
  'embedded_programming': 'Program microcontrollers, develop IoT devices, and work with real-time embedded systems.',
  'fpga_verilog': 'Learn FPGA programming, digital circuit design, and Verilog hardware description language.'
}

const DOMAIN_ICONS = {
  'web_development': 'fas fa-code',
  'ui_ux_design': 'fas fa-paint-brush',
  'data_science': 'fas fa-chart-bar',
  'pcb_design': 'fas fa-microchip',
  'embedded_programming': 'fas fa-cogs',
  'fpga_verilog': 'fas fa-memory'
}

export function DomainSelector({ onSelect, domains, onClose }: DomainSelectorProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSelect = async () => {
    if (!selectedDomain) return
    
    setLoading(true)
    try {
      await onSelect(selectedDomain)
    } catch (error) {
      console.error('Error selecting domain:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-graduation-cap text-primary-600 text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Internship Domain
            </h2>
            <p className="text-gray-600">
              Select the domain you want to specialize in during your internship program
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(domains).map(([key, name]) => (
              <div
                key={key}
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                  selectedDomain === key
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDomain(key)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedDomain === key ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <i className={`${DOMAIN_ICONS[key as keyof typeof DOMAIN_ICONS]} text-xl ${
                      selectedDomain === key ? 'text-primary-600' : 'text-gray-600'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      selectedDomain === key ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {name}
                    </h3>
                    <p className={`text-sm ${
                      selectedDomain === key ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {DOMAIN_DESCRIPTIONS[key as keyof typeof DOMAIN_DESCRIPTIONS]}
                    </p>
                  </div>
                </div>
                
                {selectedDomain === key && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedDomain && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                What to expect in {domains[selectedDomain]}:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 5 progressive tasks designed by industry experts</li>
                <li>• AI-powered evaluation and detailed feedback</li>
                <li>• Real-world projects to build your portfolio</li>
                <li>• Official certificate upon completion</li>
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            
            <div className="flex-1"></div>
            
            <button
              onClick={handleSelect}
              disabled={!selectedDomain || loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Starting Program...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-right mr-2"></i>
                  Start {selectedDomain ? domains[selectedDomain] : ''} Program
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              <i className="fas fa-lock mr-1"></i>
              You can change your domain later from the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}