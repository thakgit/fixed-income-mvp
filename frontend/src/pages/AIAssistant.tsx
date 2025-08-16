import React, { useState, useEffect } from 'react';
import { 
import { API_BASE } from '../lib/api';
  Brain, 
  MessageSquare, 
  Send, 
  Search, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Lightbulb,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react';

interface AIResponse {
  query: string;
  answer: string;
  sources: Array<{
    doc_id: string;
    text: string;
    similarity: number;
  }>;
  confidence: number;
  processing_time: number;
  suggestions: string[];
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: Array<{
    doc_id: string;
    text: string;
    similarity: number;
  }>;
}

export default function AIAssistant() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedQueries] = useState([
    "Show me all loans with missing 410A forms",
    "What's the current delinquency rate in California?",
    "Which loans have the highest risk scores?",
    "Find documents related to bankruptcy filings",
    "Show portfolio performance for the last quarter",
    "What compliance issues need immediate attention?",
    "Analyze geographic risk distribution",
    "Find loans with payment history problems"
  ]);

  const handleQuery = async () => {
    if (!query.trim() || isProcessing) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, limit: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.answers && data.answers.length > 0 
            ? `I found ${data.answers.length} relevant results for your query. Here's what I discovered:\n\n${data.answers.map((a: any, i: number) => `${i + 1}. ${a.text}`).join('\n\n')}`
            : "I couldn't find specific information for your query. Try rephrasing or ask about a different aspect of your portfolio.",
          timestamp: new Date(),
          sources: data.answers || []
        };

        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "I encountered an error processing your query. Please try again or contact support if the issue persists.",
          timestamp: new Date()
        };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble connecting to the system right now. Please check your connection and try again.",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-500/30">
          <div className="status-indicator"></div>
          <span className="text-purple-200 text-sm font-medium">AI System Online</span>
          <span className="text-gray-400 text-sm">• Ready to assist</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
          AI Assistant
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Your intelligent AI companion for portfolio insights and analysis. 
          Ask questions in natural language and get instant, intelligent responses.
        </p>
        <div className="flex justify-center">
          <button
            onClick={clearConversation}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* AI Capabilities Overview */}
      <div className="ai-card rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Capabilities</h2>
            <p className="text-purple-200">Advanced portfolio intelligence at your fingertips</p>
          </div>
        </div>
        <p className="text-gray-200 mb-6 text-lg leading-relaxed">
          I can help you with portfolio analysis, compliance monitoring, risk assessment, and document search using natural language.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Smart Search</p>
                <p className="text-sm text-purple-200">Find information instantly</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Portfolio Analysis</p>
                <p className="text-sm text-blue-200">Performance insights</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Risk Assessment</p>
                <p className="text-sm text-orange-200">Identify potential issues</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Document Analysis</p>
                <p className="text-sm text-green-200">Extract key information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Suggested Queries</h3>
              <p className="text-gray-600">Try these questions to get started</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Chat with AI</h3>
              <p className="text-gray-600">Ask questions about your portfolio in natural language</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-600">Ask me anything about your portfolio, compliance, or risk analysis</p>
              </div>
            ) : (
              conversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-xl p-4 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.type === 'ai' && (
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium mb-3 text-gray-700">Sources:</p>
                            <div className="space-y-3">
                              {message.sources.map((source, index) => (
                                <div key={index} className="text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">Document {source.doc_id}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {Math.round(source.similarity * 100)}% match
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                                    {source.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.type === 'ai' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyToClipboard(message.content)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy to clipboard"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl p-4 max-w-3xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-gray-600 font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your portfolio, compliance, risk analysis, or any other questions..."
                  className="input-modern w-full pl-4 pr-12 py-3 resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
                <button
                  onClick={handleQuery}
                  disabled={!query.trim() || isProcessing}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="financial-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
              <p className="text-gray-600">Recent discoveries and recommendations</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="financial-card p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Portfolio Health</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Your portfolio shows moderate risk with 89 high-risk loans requiring attention.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated 2 hours ago</span>
              </div>
            </div>
            
            <div className="financial-card p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Compliance Alerts</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                15 loans are missing required 410A forms and need immediate attention.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated 1 hour ago</span>
              </div>
            </div>
            
            <div className="financial-card p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Performance Insights</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Geographic concentration in California shows 23% of portfolio value.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated 4 hours ago</span>
              </div>
            </div>
            
            <div className="financial-card p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Risk Mitigation</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Consider diversifying geographic exposure to reduce concentration risk.
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated 6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}