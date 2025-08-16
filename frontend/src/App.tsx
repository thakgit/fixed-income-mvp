import { Outlet, Link, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import { Users, Target, Zap, Mail, MapPin } from 'lucide-react';

export default function App() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <TopNav/>
      
      {/* Tagline Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center">
            <p className="text-lg text-blue-200 font-medium">
              🚀 Transform Your Fixed-Income Portfolio with AI-Powered Intelligence
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Real-time analytics • Risk assessment • Compliance monitoring • Document automation
            </p>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        <Outlet key={loc.pathname}/>
      </main>
      
      {/* Footer with Contributors */}
      <footer className="mt-16 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
              Co-Creators
            </h3>
            <p className="text-gray-300 text-lg">
              Vision meets execution in this collaborative journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Rutvij Thakkar */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Rutvij Thakkar</h4>
              <p className="text-blue-200 mb-3">Product Vision & Business Strategy</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>Frisco, TX, USA</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-blue-200">
                  <Mail className="w-4 h-4" />
                  <span>thakkar.rutvij.thakkar@gmail.com</span>
                </div>
              </div>
            </div>

            {/* AI Development Partner */}
            <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">AI Development Partner</h4>
              <p className="text-purple-200 mb-3">Full-Stack Implementation</p>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">100% Code Implementation</div>
                <div className="text-purple-200">AI-Powered Solutions</div>
                <div className="text-gray-300">Technical Excellence</div>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-gray-800/50 to-blue-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h5 className="text-lg font-bold text-white mb-3">Our Mission</h5>
            <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto mb-4">
              Transforming fixed-income portfolio management through cutting-edge AI technology. 
              This platform represents the perfect synergy of visionary business strategy and 
              technical excellence, delivering enterprise-grade solutions for modern financial institutions.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <span>Built with React, TypeScript, and AI-powered insights</span>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              © 2024 Fixed-Income AI Platform • A collaborative creation by Jayesh Thakkar & AI Development Partner
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}