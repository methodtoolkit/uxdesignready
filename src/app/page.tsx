'use client'

import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, Loader2, ClipboardCopy } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto pt-8 px-4">
        <div className="flex items-center gap-2 mb-8">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold">UX Design Readiness Checker</h1>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Input Document</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your PRD, user stories, or epics here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md resize-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || analysisState === 'loading'}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analysisState === 'loading' ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze Document'
              )}
            </button>
          </div>

          {analysisState === 'success' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Gap Analysis</h2>
                  <button
                    onClick={() => handleCopy(gapAnalysis)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {gapAnalysis}
                </pre>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Design Checklist</h2>
                  <button
                    onClick={() => handleCopy(checklist)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {checklist}
                </pre>
              </div>
            </>
          )}

          {analysisState === 'error' && (
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <h3 className="text-sm font-medium text-red-800">
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