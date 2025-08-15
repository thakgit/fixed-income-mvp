import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Brain,
  BarChart3,
  DollarSign,
  Percent,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';

interface Loan {
  loan_id: string;
  status: string;
  delinquency_days: number | null;
  balance: number | null;
  rate: number | null;
  geography: string | null;
  servicer_id: string | null;
  risk_score: number | null;
  compliance_status: string | null;
  missing_410A: boolean;
  portfolio_id: string | null;
}

interface LoanListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Loan[];
}

export default function LoansTable() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    delinquency_min: '',
    risk_min: '',
    portfolio_id: '',
    geography: '',
    servicer_id: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState({
    risk_score: 0,
    default_probability: 0,
    yield_impact: 0,
    risk_factors: []
  });

  useEffect(() => {
    fetchLoans();
  }, [page, filters]);

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.delinquency_min && { delinquency_min: filters.delinquency_min }),
        ...(filters.risk_min && { risk_min: filters.risk_min }),
        ...(filters.portfolio_id && { portfolio_id: filters.portfolio_id }),
        ...(filters.geography && { geography: filters.geography }),
        ...(filters.servicer_id && { servicer_id: filters.servicer_id }),
        ...(searchQuery && { q: searchQuery })
      });

      const response = await fetch(`/api/loans/search?${params}`);
      if (response.ok) {
        const data: LoanListResponse = await response.json();
        setLoans(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAssessment = async (loanId: string) => {
    try {
      const response = await fetch(`/api/risk/assess/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_id: loanId,
          risk_score: Math.random() * 0.8 + 0.2, // Placeholder - in production this would come from ML model
          default_probability: Math.random() * 0.3,
          yield_impact: Math.random() * 0.2 - 0.1,
          risk_factors: ['delinquency_history', 'geographic_risk', 'economic_conditions']
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRiskAssessment(data);
        setShowRiskModal(true);
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
    }
  };

  const getRiskColor = (riskScore: number | null) => {
    if (!riskScore) return 'bg-gray-100 text-gray-800';
    if (riskScore < 0.3) return 'bg-green-100 text-green-800';
    if (riskScore < 0.6) return 'bg-yellow-100 text-yellow-800';
    if (riskScore < 0.8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (riskScore: number | null) => {
    if (!riskScore) return 'Unknown';
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.6) return 'Moderate';
    if (riskScore < 0.8) return 'High';
    return 'Critical';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'delinquent':
        return 'bg-red-100 text-red-800';
      case 'default':
        return 'bg-red-100 text-red-800';
      case 'paid_off':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'violation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (!value) return '—';
    return `${value.toFixed(2)}%`;
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
          <h1 className="text-3xl font-bold text-gray-900">Loans Management</h1>
          <p className="text-gray-600 mt-2">
            AI-powered loan portfolio management with risk assessment and compliance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span>{total} total loans</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      {/* AI Risk Insights */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Risk Insights</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Our AI continuously analyzes your loan portfolio for risk factors, compliance issues, and optimization opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">High Risk Loans</p>
              <p className="text-sm text-gray-600">
                {loans.filter(l => l.risk_score && l.risk_score > 0.7).length} detected
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Compliance Issues</p>
              <p className="text-sm text-gray-600">
                {loans.filter(l => l.compliance_status && l.compliance_status !== 'compliant').length} found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <Clock className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Delinquent Loans</p>
              <p className="text-sm text-gray-600">
                {loans.filter(l => l.delinquency_days && l.delinquency_days > 30).length} active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200">
            <FileText className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Missing 410A</p>
              <p className="text-sm text-gray-600">
                {loans.filter(l => l.missing_410A).length} loans
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          </div>
          <div className="flex space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search loans by ID, geography, or servicer..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && fetchLoans()}
              />
            </div>
            <button
              onClick={fetchLoans}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="current">Current</option>
                <option value="delinquent">Delinquent</option>
                <option value="default">Default</option>
                <option value="paid_off">Paid Off</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Delinquency</label>
              <input
                type="number"
                value={filters.delinquency_min}
                onChange={(e) => setFilters({ ...filters, delinquency_min: e.target.value })}
                placeholder="Days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Risk Score</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={filters.risk_min}
                onChange={(e) => setFilters({ ...filters, risk_min: e.target.value })}
                placeholder="0.0-1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Geography</label>
              <input
                type="text"
                value={filters.geography}
                onChange={(e) => setFilters({ ...filters, geography: e.target.value })}
                placeholder="State/Region"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servicer</label>
              <input
                type="text"
                value={filters.servicer_id}
                onChange={(e) => setFilters({ ...filters, servicer_id: e.target.value })}
                placeholder="Servicer ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: '',
                  delinquency_min: '',
                  risk_min: '',
                  portfolio_id: '',
                  geography: '',
                  servicer_id: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Loan Portfolio</h3>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Analysis</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delinquency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geography
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
                      <p className="text-gray-600 mb-6">
                        Upload loan data or adjust your filters to see results
                      </p>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Upload Loans
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {loan.loan_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(loan.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(loan.rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.delinquency_days ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span className={`text-sm ${loan.delinquency_days > 60 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {loan.delinquency_days} days
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.risk_score ? (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.risk_score)}`}>
                            {getRiskLabel(loan.risk_score)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.round(loan.risk_score * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(loan.compliance_status)}`}>
                          {loan.compliance_status || 'Unknown'}
                        </span>
                        {loan.missing_410A && (
                          <div title="Missing 410A Form">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {loan.geography ? (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{loan.geography}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRiskAssessment(loan.loan_id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Assess Risk"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1" title="Edit Loan">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * pageSize >= total}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Risk Assessment Modal */}
      {showRiskModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              <button
                onClick={() => setShowRiskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(riskAssessment.risk_score * 100)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Default Probability</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(riskAssessment.default_probability * 100)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Yield Impact</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(riskAssessment.yield_impact * 100)}%
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {riskAssessment.risk_factors.map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Take Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}