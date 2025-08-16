import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Percent,
  Brain,
  Search,
  Send,
  FileText,
  Shield,
  Clock,
  Users,
  Upload,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PortfolioSummary {
  total: number;
  '>60dpd': number;
  missing_410A: number;
  total_value: number;
  average_rate: number;
  high_risk_loans: number;
}

interface PortfolioAnalytics {
  total_loans: number;
  total_value: number;
  weighted_average_rate: number;
  average_delinquency: number;
  compliance_score: number;
  risk_distribution: Record<string, number>;
  delinquency_distribution: Record<string, number>;
  geography_distribution: Record<string, number>;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899'];

export default function PortfolioOverview() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [summaryRes, analyticsRes] = await Promise.all([
        fetch('/api/loans/summary'),
        fetch('/api/portfolio/analytics')
      ]);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async () => {
    if (!query.trim()) return;
    
    setIsQuerying(true);
    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, limit: 5 })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.answers && data.answers.length > 0) {
          setAiResponse(`Found ${data.answers.length} relevant results. Top result: ${data.answers[0].text}`);
        } else {
          setAiResponse('No relevant information found for your query.');
        }
      }
    } catch (error) {
      setAiResponse('Error processing your query. Please try again.');
    } finally {
      setIsQuerying(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full border border-blue-500/30">
          <div className="status-indicator"></div>
          <span className="text-blue-200 text-sm font-medium">Live Portfolio Data</span>
          <span className="text-gray-400 text-sm">• Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
          Portfolio Overview
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          AI-powered insights and analytics for your fixed-income portfolio. 
          Monitor risk, compliance, and performance in real-time.
        </p>
      </div>

      {/* AI Command Bar */}
      <div className="ai-card rounded-2xl p-8 border border-blue-500/30">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
            <p className="text-blue-200">Your intelligent portfolio analyst</p>
          </div>
        </div>
        <p className="text-gray-200 mb-6 text-lg leading-relaxed">
          Ask questions about your portfolio in natural language. Try: "Show me high-risk loans" or "Which loans are missing 410A forms?"
        </p>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your portfolio..."
              className="input-modern w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
            />
          </div>
          <button
            onClick={handleAIQuery}
            disabled={isQuerying || !query.trim()}
            className="btn-primary px-8 py-4 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isQuerying ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Ask AI</span>
          </button>
        </div>
        
        {aiResponse && (
          <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed">{aiResponse}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="financial-card metric-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.total_value) : '$0'}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            <span>Portfolio Overview</span>
          </div>
        </div>

        <div className="financial-card metric-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? summary.total.toLocaleString() : '0'}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            <span>Active Loans</span>
          </div>
        </div>

        <div className="financial-card metric-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 mb-1">Average Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatPercentage(summary.average_rate) : '0%'}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Target className="w-4 h-4 mr-2 text-purple-500" />
            <span>Weighted Average</span>
          </div>
        </div>

        <div className="financial-card metric-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 mb-1">High Risk Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? summary.high_risk_loans.toLocaleString() : '0'}
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2 text-red-500" />
                         <span>Risk Score &gt; 0.7</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution */}
        <div className="financial-card p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Risk Distribution</h3>
          </div>
          {analytics && analytics.risk_distribution ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.risk_distribution).map(([key, value]) => ({ name: key, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.risk_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">No risk data available</p>
              <p className="text-sm text-gray-400">Upload loan data to see risk distribution</p>
            </div>
          )}
        </div>

        {/* Delinquency Distribution */}
        <div className="financial-card p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delinquency Distribution</h3>
          </div>
          {analytics && analytics.delinquency_distribution ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.delinquency_distribution).map(([key, value]) => ({ name: key, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">No delinquency data available</p>
              <p className="text-sm text-gray-400">Upload loan data to see delinquency patterns</p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Compliance Alerts</h3>
              <p className="text-gray-600">Critical issues requiring immediate attention</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {summary && summary.missing_410A > 0 ? (
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-800 text-lg">
                  {summary.missing_410A} loans missing 410A forms
                </p>
                <p className="text-red-600 mt-2">
                  These loans require immediate attention for bankruptcy compliance. 
                  Non-compliance may result in regulatory penalties.
                </p>
              </div>
              <button className="btn-primary bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                View Details
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">All loans compliant</p>
                <p className="text-green-600 mt-2">No critical compliance issues detected. Portfolio is in good standing.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600">Common tasks and workflows</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group flex items-center space-x-4 p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:scale-105">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900 block">Upload Documents</span>
                <span className="text-sm text-gray-500">Import loan data & forms</span>
              </div>
            </button>
            <button className="group flex items-center space-x-4 p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:scale-105">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900 block">AI Analysis</span>
                <span className="text-sm text-gray-500">Deep portfolio insights</span>
              </div>
            </button>
            <button className="group flex items-center space-x-4 p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:scale-105">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900 block">Compliance Check</span>
                <span className="text-sm text-gray-500">Regulatory review</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contributors Section */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Project Contributors</h3>
              <p className="text-gray-600">Joint engagement - Vision meets execution</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Co-Creators
            </h4>
            <p className="text-gray-600 text-lg">
              A collaborative journey from concept to reality
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vision & Strategy */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">Vision & Strategy</h5>
              <div className="space-y-2">
                <p className="font-semibold text-blue-800">Rutvij Thakkar</p>
                <p className="text-sm text-gray-600">Product Vision & Business Strategy</p>
                <p className="text-sm text-gray-500">Frisco, TX, USA</p>
                <p className="text-sm text-blue-600 font-medium">rutvij.thakkar@gmail.com</p>
              </div>
            </div>

            {/* Development & Execution */}
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">Development & Execution</h5>
              <div className="space-y-2">
                <p className="font-semibold text-purple-800">AI Development Partner</p>
                <p className="text-sm text-gray-600">Full-Stack Implementation</p>
                <p className="text-sm text-gray-500">AI-Powered Solutions</p>
                <p className="text-sm text-purple-600 font-medium">100% Code Implementation</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <h5 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h5>
              <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Transforming fixed-income portfolio management through cutting-edge AI technology. 
                This platform represents the perfect synergy of visionary business strategy and 
                technical excellence, delivering enterprise-grade solutions for modern financial institutions.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span>Built with React, TypeScript, and AI-powered insights</span>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}