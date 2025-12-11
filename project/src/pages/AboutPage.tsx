import React from 'react';
import { Users, Target, Globe, Award, ArrowRight, Heart } from 'lucide-react';

const AboutPage = () => {
  const stakeholders = [
    {
      name: 'Ministry of Tribal Affairs',
      description: 'Government partner for policy implementation',
      icon: '🏛️'
    },
    {
      name: 'State Forest Departments',
      description: 'Regional implementation and monitoring',
      icon: '🌲'
    },
    {
      name: 'Tribal Communities',
      description: 'Primary beneficiaries and rights holders',
      icon: '👥'
    },
    {
      name: 'NGO Partners',
      description: 'Ground-level support and advocacy',
      icon: '🤝'
    },
    {
      name: 'Academic Institutions',
      description: 'Research and capacity building',
      icon: '🎓'
    },
    {
      name: 'Technology Partners',
      description: 'Digital infrastructure and innovation',
      icon: '💻'
    }
  ];

  const achievements = [
    { number: '5,000+', label: 'FRA Claims Digitized' },
    { number: '200+', label: 'Villages Mapped' },
    { number: '15', label: 'States Covered' },
    { number: '50+', label: 'Government Schemes' }
  ];

  const futureScope = [
    'AI-powered land use optimization',
    'Satellite imagery integration for real-time monitoring',
    'Mobile app for field data collection',
    'Blockchain-based secure record keeping',
    'Predictive analytics for resource management',
    'Integration with other tribal welfare schemes'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About FRA Atlas & Decision Support System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering tribal and forest-dwelling communities through digital transformation 
            of the Forest Rights Act, 2006 implementation and monitoring.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To create a comprehensive digital ecosystem that empowers forest communities 
              by ensuring transparent, efficient, and equitable implementation of forest rights, 
              while promoting sustainable development and cultural preservation.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A future where every tribal and forest-dwelling community has secure land rights, 
              access to appropriate government schemes, and the tools needed for sustainable 
              development while maintaining their cultural heritage and ecological wisdom.
            </p>
          </div>
        </div>

        {/* Project Impact */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Project Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 text-sm">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stakeholders */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            Key Stakeholders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stakeholders.map((stakeholder, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-3xl mb-3">{stakeholder.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{stakeholder.name}</h3>
                <p className="text-gray-600 text-sm">{stakeholder.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Features */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-2" />
                Community-Centric Approach
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Designed with tribal communities at the center</li>
                <li>• Culturally sensitive interface and processes</li>
                <li>• Local language support (planned)</li>
                <li>• Community participation in system design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-2" />
                Technical Excellence
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Modern web technologies and responsive design</li>
                <li>• Advanced GIS and mapping capabilities</li>
                <li>• AI-powered decision support system</li>
                <li>• Secure and scalable architecture</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Future Scope */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Future Roadmap</h2>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Our vision extends beyond the current MVP. Here's what we're planning for the future:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureScope.map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <ArrowRight className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Together, we can build a more equitable and sustainable future for forest communities. 
            Whether you're a government official, NGO worker, researcher, or community member, 
            your participation can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors">
              Partner With Us
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
          <p className="text-gray-600">
            For partnerships, technical queries, or general information about the FRA Atlas project
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-gray-700">📧 info@fra-atlas.gov.in</p>
            <p className="text-gray-700">📞 +91-11-2XXX-XXXX</p>
            <p className="text-gray-700">🏢 Ministry of Tribal Affairs, New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;