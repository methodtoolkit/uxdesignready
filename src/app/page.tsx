'use client'

import { useState } from 'react'
import { FileText, AlertCircle, Loader2, ClipboardCopy } from 'lucide-react'

type AnalysisState = 'idle' | 'loading' | 'success' | 'error'

interface AnalysisResponse {
  gapAnalysis: string
  checklist: string
}

async function analyzeContent(content: string): Promise<AnalysisResponse> {
  if (!content.trim()) {
    throw new Error('Please provide content to analyze.')
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Failed to analyze document'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    let data
    try {
      data = await response.json()
    } catch (err) {
      console.error('JSON Parse Error:', err)
      throw new Error('Invalid response from server')
    }
    
    if (!data || !data.gapAnalysis || !data.checklist) {
      throw new Error('Invalid response format from analysis')
    }

    return data as AnalysisResponse
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
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
      const { gapAnalysis: gap, checklist: list } = await analyzeContent(input)
      setGapAnalysis(gap)
      setChecklist(list)
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
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-7 w-7 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-800">
              UX Design Readiness Checker
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Input Document
            </h2>
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your PRD, user stories, or epics here..."
                className="w-full h-64 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              <button
                onClick={handleAnalyze}
                disabled={!input.trim() || analysisState === 'loading'}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {analysisState === 'success' && gapAnalysis && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Gap Analysis
                  </h2>
                  <button
                    onClick={() => copyToClipboard(gapAnalysis)}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {gapAnalysis}
                </pre>
              </div>
            )}

            {analysisState === 'success' && checklist && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Design Checklist
                  </h2>
                  <button
                    onClick={() => copyToClipboard(checklist)}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Copy to clipboard
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {checklist}
                </pre>
              </div>
            )}

            {analysisState === 'error' && (
              <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <h3 className="ml-2 text-sm font-medium text-red-800">
                    Error analyzing document
                  </h3>
                </div>
                <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}