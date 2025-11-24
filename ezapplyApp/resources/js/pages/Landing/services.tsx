import React from 'react'
import { Building2, Search, FileCheck, Users, TrendingUp, Shield } from 'lucide-react'

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: 'Franchise Discovery',
      description: 'Browse our extensive database of vetted franchise opportunities across various industries and investment levels. Find the perfect match for your business goals.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Search,
      title: 'Advanced Search & Filters',
      description: 'Use our powerful filtering system to narrow down franchise opportunities by investment range, industry, location, and franchise type.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FileCheck,
      title: 'Application Management',
      description: 'Streamline your franchise application process with our intuitive platform. Track applications, manage documents, and stay organized throughout your journey.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Consultation',
      description: 'Get expert advice and guidance from our team of franchise consultants to help you make informed decisions and navigate the franchise landscape.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Access valuable market data, trends, and analytics to understand franchise performance and make data-driven investment decisions.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Shield,
      title: 'Verified Opportunities',
      description: 'All franchise listings are thoroughly vetted and verified. Work with confidence knowing you\'re exploring legitimate, established opportunities.',
      color: 'from-emerald-500 to-emerald-600'
    }
  ]

  return (
    <section id="services" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive services to help you find, evaluate, and secure the perfect franchise opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Shield className="w-5 h-5" />
            <span>All services backed by our commitment to excellence</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
