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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-7 w-7 text-blue-600" />
          <h1 className="text-3xl font-semibold tracking-tight">UX Design Readiness Checker</h1>
        </div>

        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-xl font-semibold mb-4">Input Document</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your PRD, user stories, or epics here..."
              className="w-full h-64 p-4 text-base border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || analysisState === 'loading'}
              className="mt-4 w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analysisState === 'loading' ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                'Analyze Document'
              )}
            </button>
          </div>

          {analysisState === 'success' && (
            <>
              {/* Gap Analysis Section */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Gap Analysis</h2>
                  <button
                    onClick={() => handleCopy(gapAnalysis)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600 font-mono">
                  {gapAnalysis}
                </pre>
              </div>

              {/* Design Checklist Section */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Design Checklist</h2>
                  <button
                    onClick={() => handleCopy(checklist)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600 font-mono">
                  {checklist}
                </pre>
              </div>
            </>
          )}

          {/* Error State */}
          {analysisState === 'error' && (
            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <h3 className="text-base font-medium text-red-800">
                  Error analyzing document
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700 ml-8">
                Please try again. If the problem persists, contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}