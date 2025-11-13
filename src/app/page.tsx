'use client';

// Landing Page (NOT FINICHED)

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import YouTubeEmbed, { YouTubeEmbedRef } from '@/components/ui/video/YouTubeEmbed';

export default function Home() {
  const videoRef = useRef<YouTubeEmbedRef>(null);

  return (
    <div className="min-h-screen bg-[#101828]">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text and Buttons */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="block">Empower Your Business with</span>
              <span className="text-brand-500">Real-Time Insights</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl">
              Our platform offers comprehensive dashboards, real-time analytics, and direct engagement tools to help you understand and grow your user base like never before.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link href="/signup">
                <button className="px-8 py-3 text-lg font-medium bg-[#465FFF] text-white hover:bg-[#465FFF] border-[#465FFF] rounded-lg transition-colors">
                  Try Now for Free
                </button>
              </Link>
              <button
                onClick={() => videoRef.current?.playVideo()}
                className="px-8 py-3 text-lg font-medium bg-[#465FFF] text-white hover:bg-[#465FFF] border-[#465FFF] rounded-lg transition-colors"
              >
                Watch Demo
              </button>
            </div>

            {/* App Store Buttons */}
            <div className="mt-12 flex justify-center lg:justify-start gap-6">
              <button className="flex items-center gap-3 bg-[#000000] text-white rounded-lg px-6 py-3 hover:bg-[#000000] transition-colors">
                <Image
                  src="/images/icons/apple-icon.png"
                  alt="Download on App Store"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <div className="text-left">
                  <div className="text-xs opacity-90">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </button>

              <button className="flex items-center gap-3 bg-[#000000] text-white rounded-lg px-6 py-3 hover:bg-[#000000] transition-colors">
                <Image
                  src="/images/icons/play-store-icon.webp"
                  alt="Get it on Google Play"
                  width={24}
                  height={24}
                  className="w-8 h-8"
                />
                <div className="text-left">
                  <div className="text-xs opacity-90">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className="lg:order-last">
            <YouTubeEmbed
              ref={videoRef}
              videoId="q-SULWe3JWw"
              aspectRatio="16:9"
              title="Dashboard Demo Video"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-[#1a2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-gray-300 tracking-wider mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            {[
              { name: 'Esprit', logo: '/images/logos/espritLogo.jpg' },
              { name: 'HotBox', logo: '/images/logos/logoHB.png' },
              { name: 'Tek-UP', logo: '/images/logos/tekup.png' },
              { name: 'Hafood', logo: '/images/logos/hafood.jpeg' },
              { name: 'Bridge', logo: '/images/logos/bridge.png' },
            ].map((company) => (
              <div key={company.name} className="flex justify-center items-center">
                <div className="h-12 w-full flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={200}
                    height={200}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Everything you need to grow your business
          </h2>
          <p className="mt-4 text-xl text-gray-300">
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
            <div key={index} className="bg-[#1a2332] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[#2a3441]">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/signup">
            <button className="px-8 py-3 text-lg font-medium bg-[#465FFF] text-white hover:bg-[#465FFF] border-[#465FFF] rounded-lg transition-colors">
              Start Your Free Trial
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
