import React, { useState, useEffect } from 'react';
import { 
import { API_BASE } from '../lib/api';
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Brain,
  Plus,
  Settings,
  TrendingUp,
  Eye,
  Filter,
  Download
} from 'lucide-react';

interface ComplianceFinding {
  loan_id: string;
  rule_name: string;
  severity: string;
  description: string;
  detected_at: string;
  status: string;
  missing_documents: string[];
}

interface ComplianceRule {
  rule_id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Compliance() {
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'rules' | 'analytics'>('findings');
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    rule_type: ''
  });

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const [findingsRes, rulesRes] = await Promise.all([
        fetch(`${API_BASE}/api/compliance/findings/missing-410a`),
        fetch(`${API_BASE}/api/compliance/rules`)
      ]);
      
      if (findingsRes.ok) {
        const findingsData = await findingsRes.json();
        setFindings(findingsData.items || []);
      }
      
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.items || []);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
          <p className="text-gray-600 mt-2">
            AI-powered compliance monitoring and automated rule enforcement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Compliance Engine Active</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Findings</p>
              <p className="text-2xl font-bold text-gray-900">{findings.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active Issues</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {findings.filter(f => f.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Require Immediate Action</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {rules.filter(r => r.is_active).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Settings className="w-4 h-4 mr-1" />
            <span>Monitoring Portfolio</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">
                {findings.length > 0 ? Math.round(((findings.length - findings.filter(f => f.severity === 'critical').length) / findings.length) * 100) : 100}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Portfolio Health</span>
          </div>
        </div>
      </div>

      {/* AI Compliance Assistant */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Compliance Assistant</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Our AI continuously monitors your portfolio for compliance issues, automatically detecting violations and suggesting remediation actions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Real-time Monitoring</p>
              <p className="text-sm text-gray-600">24/7 compliance tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
            <Brain className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">AI Detection</p>
              <p className="text-sm text-gray-600">Smart violation detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Auto Remediation</p>
              <p className="text-sm text-gray-600">Suggested actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'findings', label: 'Compliance Findings', icon: AlertTriangle },
              { id: 'rules', label: 'Compliance Rules', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Compliance Issues</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {findings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance issues found</h3>
                  <p className="text-gray-600">Your portfolio is currently compliant with all active rules.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(finding.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{finding.rule_name}</h4>
                            <p className="text-sm text-gray-600">Loan ID: {finding.loan_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(finding.status)}`}>
                            {finding.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{finding.description}</p>
                      
                      {finding.missing_documents && finding.missing_documents.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Missing Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {finding.missing_documents.map((doc, docIndex) => (
                              <span key={docIndex} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Detected: {new Date(finding.detected_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Take Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Rules</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Rule</span>
                </button>
              </div>

              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance rules configured</h3>
                  <p className="text-gray-600">Create your first compliance rule to start monitoring your portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rules.map((rule) => (
                    <div key={rule.rule_id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                            {rule.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Type: {rule.rule_type}</span>
                        <span>Updated: {new Date(rule.updated_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                          {rule.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Compliance Trends</h4>
                  <p className="text-gray-600">Analytics dashboard coming soon...</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Risk Distribution</h4>
                  <p className="text-gray-600">Risk analysis charts coming soon...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}