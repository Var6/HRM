import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Integration', href: '#integration' },
        { label: 'Updates', href: '#updates' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'API Reference', href: '#api' },
        { label: 'Support Center', href: '#support' },
        { label: 'Training', href: '#training' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Blog', href: '#blog' },
        { label: 'Contact', href: '#contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: '#github', label: 'GitHub' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
  ];

  return (
    <footer className="bg-linear-to-b from-slate-900 to-slate-950 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-400 to-blue-600 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-linear-to-br from-cyan-500 to-blue-600 p-2.5 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  HRM Pro
                </h2>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
              Streamline your human resource management with our comprehensive platform. 
              From employee onboarding to payroll, we've got you covered.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:contact@hrmpro.com" className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors group">
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">contact@hrmpro.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors group">
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+1 (234) 567-890</span>
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">123 Business Ave, Suite 100<br />New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                {section.title}
                <div className="h-px flex-1 bg-linear-to-r from-slate-700 to-transparent"></div>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2 group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mb-12 pb-12 border-b border-slate-800">
          <div className="max-w-2xl">
            <h3 className="text-white font-semibold mb-2 text-lg">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to our newsletter for the latest HR insights and product updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>© 2026 HRM Pro. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse hidden sm:inline" />
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="p-2.5 bg-slate-800 hover:bg-linear-to-br hover:from-cyan-500 hover:to-blue-600 text-slate-400 hover:text-white rounded-lg transition-all transform hover:scale-110 active:scale-95 group"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <a href="#privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-700">•</span>
            <a href="#terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="h-1 bg-linear-to-r from-cyan-500 via-blue-600 to-cyan-500"></div>
    </footer>
  );
}