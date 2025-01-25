'use client'

import { useState } from 'react'
import { FileText, AlertCircle, Loader2, ClipboardCopy } from 'lucide-react'

type AnalysisState = 'idle' | 'loading' | 'success' | 'error'

interface AnalysisResponse {
  gapAnalysis: string
  checklist: string
}

export default function Home() {
  const [input, setInput] = useState<string>('')
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [gapAnalysis, setGapAnalysis] = useState<string>('')
  const [checklist, setChecklist] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setErrorMessage('Please enter some content to analyze.')
      setAnalysisState('error')
      return
    }
    
    setAnalysisState('loading')
    setErrorMessage('')
    setGapAnalysis('')
    setChecklist('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze document')
      }

      const data = await response.json()
      setGapAnalysis(data.gapAnalysis)
      setChecklist(data.checklist)
      setAnalysisState('success')
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      setAnalysisState('error')
    }
  }

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              UX Design Readiness Checker
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Input Document
              </h2>
              <div className="space-y-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your PRD, user stories, or epics here..."
                  className="block w-full h-64 px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!input.trim() || analysisState === 'loading'}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analysisState === 'loading' ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Document'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="space-y-6">
            {analysisState === 'success' && gapAnalysis && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Gap Analysis
                    </h2>
                    <button
                      onClick={() => copyToClipboard(gapAnalysis)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copy to clipboard
                    </button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {gapAnalysis}
                  </pre>
                </div>
              </div>
            )}

            {analysisState === 'success' && checklist && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Design Checklist
                    </h2>
                    <button
                      onClick={() => copyToClipboard(checklist)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copy to clipboard
                    </button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {checklist}
                  </pre>
                </div>
              </div>
            )}

            {analysisState === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="ml-2 text-sm font-medium text-red-800">
                      Error analyzing document
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}