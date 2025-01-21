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
      // Set a shorter prompt to reduce response time
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{ 
          role: "user", 
          content: `Briefly analyze this user story and provide a short checklist: ${content}. Keep your response under 500 words total.`
        }],
        temperature: 1,
        max_tokens: 500, // Reduced token limit for faster response
      });
      
      console.log('Claude response received');
      
      if (!response.content || !response.content[0] || response.content[0].type !== 'text') {
        throw new Error('Invalid response format from Claude');
      }

      // Split the response into two parts
      const fullResponse = response.content[0].text;
      const [analysis, checklist] = fullResponse.split('\n\n');

      return NextResponse.json({
        gapAnalysis: analysis || fullResponse,
        checklist: checklist || fullResponse
      });
      
    } catch (claudeError: unknown) {
      console.error('Claude API Error:', claudeError);
      if (claudeError instanceof Error) {
        throw new Error(`Claude API error: ${claudeError.message}`);
      }
      throw new Error('Unknown error occurred while calling Claude API');
    }

  } catch (error: unknown) {
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