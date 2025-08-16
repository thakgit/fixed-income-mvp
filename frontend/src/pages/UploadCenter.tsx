import React, { useState, useRef } from 'react';
import { 
import { API_BASE } from '../lib/api';
  Upload, 
  FileText, 
  FileSpreadsheet, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap,
  Database,
  BarChart3,
  X,
  Plus,
  Download,
  Info,
  Eye
} from 'lucide-react';

interface UploadResult {
  doc_id: string;
  loan_id: string | null;
  type: string;
  path: string;
}

interface IngestResult {
  loans_processed: number;
  loans_created: number;
  loans_updated: number;
  errors: string[];
}

export default function UploadCenter() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [ingestResults, setIngestResults] = useState<IngestResult | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [processingStatus, setProcessingStatus] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loanId, setLoanId] = useState('');
  const [docType, setDocType] = useState('generic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || 
                     file.type === 'text/csv' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isValid) {
        alert(`File type not supported: ${file.name}. Please upload PDF, CSV, or Excel files.`);
      }
      return isValid;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    const results: UploadResult[] = [];
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      if (loanId) formData.append('loan_id', loanId);
      formData.append('doc_type', docType);
      
      try {
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
        
        const response = await fetch('/api/ingest/document', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result: UploadResult = await response.json();
          results.push(result);
          setProcessingStatus(prev => ({ ...prev, [file.name]: 'uploaded' }));
          
          // Auto-extract text for PDFs
          if (file.type === 'application/pdf') {
            setProcessingStatus(prev => ({ ...prev, [file.name]: 'extracting' }));
            try {
              const extractResponse = await fetch(`/api/documents/${result.doc_id}/extract`, {
                method: 'POST'
              });
              if (extractResponse.ok) {
                setProcessingStatus(prev => ({ ...prev, [file.name]: 'extracted' }));
              }
            } catch (error) {
              console.error('Error extracting text:', error);
              setProcessingStatus(prev => ({ ...prev, [file.name]: 'extraction_failed' }));
            }
          }
        } else {
          setProcessingStatus(prev => ({ ...prev, [file.name]: 'failed' }));
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'failed' }));
      }
    }
    
    setUploadResults(prev => [...prev, ...results]);
    setSelectedFiles([]);
    setUploading(false);
  };

  const uploadLoansCSV = async (file: File) => {
    if (file.type !== 'text/csv') {
      alert('Please select a CSV file for loan data ingestion.');
      return;
    }
    
    setProcessingStatus(prev => ({ ...prev, [file.name]: 'processing' }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/ingest/loans', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result: IngestResult = await response.json();
        setIngestResults(result);
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'completed' }));
      } else {
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'failed' }));
      }
    } catch (error) {
      console.error('Error ingesting loans:', error);
      setProcessingStatus(prev => ({ ...prev, [file.name]: 'failed' }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'uploaded':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'extracting':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'extracted':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'processing':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'bg-yellow-100 text-yellow-800';
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'extracting':
        return 'bg-blue-100 text-blue-800';
      case 'extracted':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type === 'text/csv') return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (file.type.includes('spreadsheet')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Center</h1>
          <p className="text-gray-600 mt-2">
            AI-powered document ingestion and loan data processing
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Upload Service Active</span>
        </div>
      </div>

      {/* AI Processing Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI-Powered Processing</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Our AI automatically processes your uploads, extracts text, categorizes documents, and identifies compliance issues.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <Upload className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Smart Upload</p>
              <p className="text-sm text-gray-600">Auto-categorization</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Text Extraction</p>
              <p className="text-sm text-gray-600">PDF to text</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">AI Indexing</p>
              <p className="text-sm text-gray-600">RAG-ready</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <Brain className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Smart Analysis</p>
              <p className="text-sm text-gray-600">Compliance check</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Documents & Data</h3>
          <p className="text-gray-600 mt-1">
            Drag and drop files or click to browse. Supports PDF, CSV, and Excel files.
          </p>
        </div>
        
        <div className="p-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-gray-600 mb-4">
              Upload PDF documents, CSV loan data, or Excel spreadsheets
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Advanced Options */}
          <div className="mt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              <Plus className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan ID (Optional)</label>
                    <input
                      type="text"
                      value={loanId}
                      onChange={(e) => setLoanId(e.target.value)}
                      placeholder="Associate with specific loan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="generic">Generic Document</option>
                      <option value="410A">410A Form</option>
                      <option value="mortgage_note">Mortgage Note</option>
                      <option value="deed_of_trust">Deed of Trust</option>
                      <option value="bankruptcy_filing">Bankruptcy Filing</option>
                      <option value="title_insurance">Title Insurance</option>
                      <option value="payment_history">Payment History</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files ({selectedFiles.length})</h4>
              <div className="space-y-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={uploadFiles}
                  disabled={uploading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
                </button>
                
                {selectedFiles.some(f => f.type === 'text/csv') && (
                  <button
                    onClick={() => {
                      const csvFile = selectedFiles.find(f => f.type === 'text/csv');
                      if (csvFile) uploadLoansCSV(csvFile);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Process as Loan Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {Object.keys(processingStatus).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
            <p className="text-gray-600 mt-1">Real-time updates on file processing</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(processingStatus).map(([fileName, status]) => (
                <div key={fileName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <span className="font-medium text-gray-900">{fileName}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upload Results</h3>
            <p className="text-gray-600 mt-1">Successfully processed documents</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadResults.map((result) => (
                <div key={result.doc_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{result.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Document ID:</span> {result.doc_id}
                  </p>
                  {result.loan_id && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Loan ID:</span> {result.loan_id}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center space-x-2">
                      <Database className="w-4 h-4" />
                      <span>Index</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loan Ingestion Results */}
      {ingestResults && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Loan Data Ingestion Results</h3>
            <p className="text-gray-600 mt-1">CSV processing summary</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold text-green-600">{ingestResults.loans_processed}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Loans Created</p>
                <p className="text-2xl font-bold text-blue-600">{ingestResults.loans_created}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Loans Updated</p>
                <p className="text-2xl font-bold text-yellow-600">{ingestResults.loans_updated}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{ingestResults.errors.length}</p>
              </div>
            </div>
            
            {ingestResults.errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Processing Errors:</h4>
                <ul className="space-y-1">
                  {ingestResults.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upload Guidelines</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported File Types</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• PDF documents (auto-text extraction)</li>
              <li>• CSV files (loan data ingestion)</li>
              <li>• Excel spreadsheets (.xlsx, .xls)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI Processing Features</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Automatic document categorization</li>
              <li>• PDF text extraction</li>
              <li>• Compliance checking</li>
              <li>• RAG indexing for search</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}