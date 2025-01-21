import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  console.log('API Route started');
  
  try {
    console.log('Parsing request body');
    const { content } = await request.json();
    console.log('Content received:', content);
    
    console.log('Checking API key');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('API key not found');
    }
    console.log('API key present');

    console.log('Initializing Anthropic client');
    const anthropic = new Anthropic({
      apiKey
    });

    console.log('Making request to Claude');
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{ 
          role: "user", 
          content: `Analyze this user story for UX/UI gaps and create a design checklist: ${content}`
        }],
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      console.log('Claude response received');
      
      if (!response.content || !response.content[0] || response.content[0].type !== 'text') {
        throw new Error('Invalid response format from Claude');
      }

      return NextResponse.json({
        gapAnalysis: response.content[0].text,
        checklist: response.content[0].text
      });
      
    } catch (claudeError) {
      console.error('Claude API Error:', claudeError);
      throw new Error(`Claude API error: ${claudeError.message}`);
    }

  } catch (error) {
    console.error('Detailed error information:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze document',
        details: error instanceof Error ? error.stack : 'No additional details'
      },
      { status: 500 }
    );
  }
}