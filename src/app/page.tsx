// Landing Page (NOT FINICHED)

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="block">Empower Your Business with</span>
            <span className="text-brand-500">Real-Time Insights</span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform offers comprehensive dashboards, real-time analytics, and direct engagement tools to help you understand and grow your user base like never before.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button className="px-8 py-3 text-lg font-medium">
                Try Now for Free
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="px-8 py-3 text-lg font-medium border-2"
            >
              Watch Demo
            </Button>
          </div>
          
          {/* App Store Buttons */}
          <div className="mt-12 flex justify-center gap-6">
            <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.13 2.35.93 3 .93.64 0 1.65-.75 2.8-.65 1.64.12 2.81.92 3.53 2.14-3.12 1.85-2.37 6.72.52 8.1.76.36 1.6.6 2.45.83-.15.44-.28.88-.5 1.29-.56 1.09-1.38 1.93-2.7 1.93zM12.03 7.25c-.15-2.23 1.66-3.46 2.8-3.46.15 0-.1.94-.4 2.04-.37 1.12-1.4 2.92-2.4 2.92v-1.5z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </button>
            
            <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92v-18.53a1 1 0 0 1 .609-.922zm.921 5.47l4.568 4.568-4.568 4.568V7.284zm0 9.432l4.568-4.568 2.689 2.69-2.557 2.568-4.7-4.57v4.51c0 .03.01.058.01.087 0 .033-.01.065-.01.098v1.43l5.3-5.326 5.3 5.326v-1.43c0-.033-.01-.065-.01-.098 0-.03.01-.058.01-.087v-9.24l2.74-2.69v12.9c0 1.68-1.3 2.05-2.32 2.05-.47 0-1.04-.13-1.73-.52l-5.21-2.62-5.21 2.62c-.69.39-1.26.52-1.73.52-1.02 0-2.32-.37-2.32-2.05v-15.9c0-1.67 1.3-2.04 2.32-2.04.47 0 1.04.13 1.73.52l5.21 2.62 5.21-2.62c.69-.39 1.26-.52 1.73-.52 1.02 0 2.32.37 2.32 2.04v.24l-8 7.84-3.7-3.72 7.45-7.47h-1.88l-7.5 7.5-7.5-7.5h-1.88z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="mt-16">
          <div className="relative rounded-2xl bg-gray-50 dark:bg-gray-800 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-brand-600/10 rounded-2xl"></div>
            <div className="relative z-10 grid place-items-center">
              <div className="w-full max-w-4xl h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-medium">Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            {[
              { name: 'Google', logo: '/logos/google.svg' },
              { name: 'Microsoft', logo: '/logos/microsoft.svg' },
              { name: 'Airbnb', logo: '/logos/airbnb.svg' },
              { name: 'Spotify', logo: '/logos/spotify.svg' },
              { name: 'Uber', logo: '/logos/uber.svg' },
            ].map((company) => (
              <div key={company.name} className="flex justify-center items-center">
                <div className="h-12 w-full flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                  <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to grow your business
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Powerful features to help you understand and engage with your audience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Real-time Analytics',
              description: 'Get instant insights into your user behavior and engagement metrics.',
              icon: '📊',
            },
            {
              title: 'User Engagement',
              description: 'Connect with your audience through targeted messages and surveys.',
              icon: '💬',
            },
            {
              title: 'Custom Dashboards',
              description: 'Create personalized dashboards to track what matters most to you.',
              icon: '📈',
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/signup">
            <Button className="px-8 py-3 text-lg font-medium">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
