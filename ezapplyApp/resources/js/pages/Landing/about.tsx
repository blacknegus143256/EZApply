import React from 'react'
import { Target, Eye, Lightbulb, TrendingUp, Users, Award, Building2, Shield } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower entrepreneurs by connecting them with verified franchise opportunities and providing the tools needed for successful business ventures.',
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the leading platform for franchise discovery and application management in the Philippines, fostering business growth and economic development.',
      color: 'text-green-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to simplify the franchise discovery and application process, making entrepreneurship accessible to everyone.',
      color: 'text-yellow-600'
    }
  ]

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Users', color: 'from-blue-500 to-blue-600' },
    { icon: Building2, value: '500+', label: 'Franchise Opportunities', color: 'from-green-500 to-green-600' },
    { icon: Award, value: '95%', label: 'Success Rate', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, value: '₱50M+', label: 'Total Investments', color: 'from-orange-500 to-orange-600' }
  ]

  return (
    <section id="about" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About EZ Apply PH
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The rapid growth of technology has transformed the way people connect, work, and build opportunities across industries. 
            In today's fast-paced environment, businesses are no longer limited by location but thrive in digital spaces where creativity and innovation meet.
          </p>
        </div>

        {/* Mission, Vision, Innovation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gray-100 mb-6 ${value.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 shadow-2xl mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Our Impact
            </h3>
            <p className="text-blue-100 text-lg">
              Numbers that reflect our commitment to your success
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-white/20"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose EZ Apply PH?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Verified Opportunities</h4>
                <p className="text-gray-600">All franchise listings are thoroughly vetted and verified for legitimacy and quality.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Platform</h4>
                <p className="text-gray-600">From discovery to application, manage everything in one place with our integrated platform.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Expert Support</h4>
                <p className="text-gray-600">Get guidance from our team of franchise consultants throughout your journey.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Proven Success</h4>
                <p className="text-gray-600">Join thousands of successful entrepreneurs who found their perfect franchise match.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
