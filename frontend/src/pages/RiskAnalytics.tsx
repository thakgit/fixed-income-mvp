import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Brain, 
  Shield,
  DollarSign,
  Percent,
  Clock,
  MapPin,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface RiskMetrics {
  total_loans: number;
  high_risk_count: number;
  average_risk_score: number;
  portfolio_risk_level: string;
  delinquency_rate: number;
  expected_losses: number;
}

interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function RiskAnalytics() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');

  useEffect(() => {
    fetchRiskData();
  }, [selectedTimeframe, selectedPortfolio]);

  const fetchRiskData = async () => {
    try {
      // In a real implementation, these would be actual API calls
      // For now, using mock data
      setRiskMetrics({
        total_loans: 1250,
        high_risk_count: 89,
        average_risk_score: 0.42,
        portfolio_risk_level: 'moderate',
        delinquency_rate: 0.067,
        expected_losses: 1250000
      });

      setRiskDistribution({
        low: 650,
        moderate: 420,
        high: 150,
        critical: 30
      });
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Analytics</h1>
          <p className="text-gray-600 mt-2">
            AI-powered risk assessment and portfolio analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Brain className="w-4 h-4 text-purple-500" />
            <span>AI Risk Models Active</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* AI Risk Overview */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Risk Intelligence</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Our advanced AI models continuously analyze your portfolio for risk factors, predict potential defaults, and suggest risk mitigation strategies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Portfolio Risk</p>
              <p className="text-sm text-gray-600">{riskMetrics?.portfolio_risk_level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">High Risk Loans</p>
              <p className="text-sm text-gray-600">{riskMetrics?.high_risk_count} loans</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <Percent className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Delinquency Rate</p>
              <p className="text-sm text-gray-600">{(riskMetrics?.delinquency_rate || 0) * 100}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <DollarSign className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Expected Losses</p>
              <p className="text-sm text-gray-600">
                ${(riskMetrics?.expected_losses || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900">
                {riskMetrics?.total_loans.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active Loans</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((riskMetrics?.average_risk_score || 0) * 100)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            <span>Portfolio Average</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Loans</p>
              <p className="text-2xl font-bold text-red-600">
                {riskMetrics?.high_risk_count}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Require Attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Risk Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {riskMetrics?.portfolio_risk_level}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Brain className="w-4 h-4 mr-1" />
            <span>AI Assessed</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Controls</h3>
          <p className="text-gray-600 mt-1">Configure risk analysis parameters</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Portfolios</option>
                <option value="portfolio1">Portfolio 1</option>
                <option value="portfolio2">Portfolio 2</option>
                <option value="portfolio3">Portfolio 3</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Refresh Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          {riskDistribution ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(riskDistribution).map(([key, value]) => ({ name: key, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(riskDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No risk data available
            </div>
          )}
        </div>

        {/* Risk Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', risk: 0.35 },
              { month: 'Feb', risk: 0.38 },
              { month: 'Mar', risk: 0.42 },
              { month: 'Apr', risk: 0.39 },
              { month: 'May', risk: 0.41 },
              { month: 'Jun', risk: 0.42 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">High Risk Loans Analysis</h3>
          <p className="text-gray-600 mt-1">Loans requiring immediate attention</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delinquency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Factors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    LOAN-001
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Critical (85%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    90 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $450,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        High delinquency
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Geographic risk
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    LOAN-002
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      High (72%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    60 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $320,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Payment history
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Economic factors
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Risk Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-2">Immediate Actions</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Review 30 loans with risk scores &gt; 0.8</li>
              <li>• Implement enhanced monitoring for 89 high-risk loans</li>
              <li>• Schedule portfolio rebalancing within 30 days</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-2">Risk Mitigation</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Consider hedging strategies for geographic concentrations</li>
              <li>• Implement stricter underwriting for new loans</li>
              <li>• Review servicer performance metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
