'use client'

import React, { useState } from 'react';
import { FileText, AlertCircle, Loader2, ClipboardCopy } from 'lucide-react';

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [input, setInput] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [gapAnalysis, setGapAnalysis] = useState('');
  const [checklist, setChecklist] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setAnalysisState('loading');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');

      setGapAnalysis(data.gapAnalysis || '');
      setChecklist(data.checklist || '');
      setAnalysisState('success');
    } catch (error) {
      console.error('Error:', error);
      setAnalysisState('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">UX Design Readiness Checker</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Input Document</h2>
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your PRD, user stories, or epics here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAnalyze}
                disabled={!input.trim() || analysisState === 'loading'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analysisState === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Document'
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          {analysisState === 'success' && (
            <>
              {/* Gap Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Gap Analysis</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(gapAnalysis)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCopy className="h-4 w-4" />
                      Copy to clipboard
                    </div>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">{gapAnalysis}</pre>
              </div>

              {/* Design Checklist */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Design Checklist</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(checklist)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCopy className="h-4 w-4" />
                      Copy to clipboard
                    </div>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">{checklist}</pre>
              </div>
            </>
          )}

          {/* Error State */}
          {analysisState === 'error' && (
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <h3 className="ml-2 text-sm font-medium text-red-800">
                  Error analyzing document
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700">
                Please try again. If the problem persists, contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}