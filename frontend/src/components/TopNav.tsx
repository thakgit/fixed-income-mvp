import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  Upload, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  Database,
  Settings,
  Zap,
  Users
} from 'lucide-react';

export default function TopNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Portfolio Overview', icon: BarChart3 },
    { path: '/loans', label: 'Loans Management', icon: FileText },
    { path: '/documents', label: 'Document Hub', icon: Database },
    { path: '/compliance', label: 'Compliance', icon: Shield },
    { path: '/risk', label: 'Risk Analytics', icon: TrendingUp },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Brain },
    { path: '/upload', label: 'Upload Center', icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/30 backdrop-blur-sm shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                  Fixed-Income AI Platform
                </h1>
                <p className="text-sm sm:text-base text-blue-200 font-medium mt-1">Powered by AI & RAG</p>
                <p className="text-xs text-blue-300 font-medium mt-1">Co-created by Jayesh Thakkar & Cursor AI</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="status-indicator"></div>
                <span className="text-green-200 font-medium">System Online</span>
              </div>
            </div>

            {/* AI Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-purple-200 font-medium">AI Active</span>
            </div>

            {/* Settings */}
            <button className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-transparent hover:border-white/20">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/20 bg-black/20 backdrop-blur-md">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}