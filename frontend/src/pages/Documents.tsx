import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Brain, 
  Search, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Database,
  Zap,
  Filter
} from 'lucide-react';
import { API_BASE } from '../lib/api';

interface Document {
  doc_id: string;
  loan_id: string | null;
  type: string;
  sha256: string;
  has_text: boolean;
  preview: string | null;
  processing_status: string;
  confidence_score: number | null;
}

interface DocumentListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Document[];
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    loan_id: '',
    doc_type: '',
    has_text: null as boolean | null,
    processing_status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [indexing, setIndexing] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [page, filters]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...(filters.loan_id && { loan_id: filters.loan_id }),
        ...(filters.doc_type && { doc_type: filters.doc_type }),
        ...(filters.has_text !== null && { has_text: filters.has_text.toString() }),
        ...(filters.processing_status && { processing_status: filters.processing_status })
      });

      const response = await fetch(`${API_BASE}/api/documents?${params}`);
      if (response.ok) {
        const data: DocumentListResponse = await response.json();
        setDocuments(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractText = async (docId: string) => {
    setExtracting(docId);
    try {
      const response = await fetch(`${API_BASE}/api/documents/${docId}/extract`, { method: 'POST' });
      if (response.ok) {
        await fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error extracting text:', error);
    } finally {
      setExtracting(null);
    }
  };

  const handleIndexDocument = async (docId: string) => {
    setIndexing(docId);
    try {
      const response = await fetch(`${API_BASE}/api/rag/index/${docId}`, { method: 'POST' });
      if (response.ok) {
        await fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error indexing document:', error);
    } finally {
      setIndexing(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: searchQuery, limit: 10 })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle search results - could show in a modal or separate section
        console.log('Search results:', data);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'extracted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'indexed':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'ai_analyzed':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'extracted':
        return 'bg-green-100 text-green-800';
      case 'indexed':
        return 'bg-blue-100 text-blue-800';
      case 'ai_analyzed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
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
          <h1 className="text-3xl font-bold text-gray-900">Document Hub</h1>
          <p className="text-gray-600 mt-2">
            AI-powered document processing, extraction, and intelligent search
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {total} documents processed
          </span>
        </div>
      </div>

      {/* AI Search Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI-Powered Search</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Search across all your documents using natural language. Find specific information, compliance details, or loan data instantly.
        </p>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search: 'loans with missing 410A forms' or 'high-risk mortgages in California'..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan ID</label>
              <input
                type="text"
                value={filters.loan_id}
                onChange={(e) => setFilters({ ...filters, loan_id: e.target.value })}
                placeholder="Filter by loan ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={filters.doc_type}
                onChange={(e) => setFilters({ ...filters, doc_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="410A">410A Form</option>
                <option value="mortgage_note">Mortgage Note</option>
                <option value="deed_of_trust">Deed of Trust</option>
                <option value="bankruptcy_filing">Bankruptcy Filing</option>
                <option value="title_insurance">Title Insurance</option>
                <option value="payment_history">Payment History</option>
                <option value="generic">Generic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Status</label>
              <select
                value={filters.has_text === null ? '' : filters.has_text.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  has_text: e.target.value === '' ? null : e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Has Text</option>
                <option value="false">No Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Status</label>
              <select
                value={filters.processing_status}
                onChange={(e) => setFilters({ ...filters, processing_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="extracted">Extracted</option>
                <option value="indexed">Indexed</option>
                <option value="ai_analyzed">AI Analyzed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-gray-600 mt-1">
            Manage and process your document collection with AI-powered tools
          </p>
        </div>
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-6">
                Upload documents to get started with AI-powered processing
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Upload Documents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.doc_id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.processing_status)}`}>
                      {doc.processing_status}
                    </div>
                  </div>
                  
                  {doc.loan_id && (
                    <p className="text-sm text-gray-600 mb-2">
                      Loan: {doc.loan_id}
                    </p>
                  )}
                  
                  {doc.preview && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {doc.preview}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.processing_status)}
                      <span className="text-xs text-gray-500">
                        {doc.processing_status.replace('_', ' ')}
                      </span>
                    </div>
                    {doc.confidence_score && (
                      <span className="text-xs text-gray-500">
                        {Math.round(doc.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!doc.has_text && (
                      <button
                        onClick={() => handleExtractText(doc.doc_id)}
                        disabled={extracting === doc.doc_id}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {extracting === doc.doc_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        <span>Extract</span>
                      </button>
                    )}
                    
                    {doc.has_text && doc.processing_status !== 'indexed' && (
                      <button
                        onClick={() => handleIndexDocument(doc.doc_id)}
                        disabled={indexing === doc.doc_id}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {indexing === doc.doc_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Database className="w-4 h-4" />
                        )}
                        <span>Index</span>
                      </button>
                    )}
                    
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}