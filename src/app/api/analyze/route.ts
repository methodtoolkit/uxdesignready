import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    // Log that we're starting the request
    console.log('Starting analysis request');

    const { content } = await request.json();
    console.log('Received content length:', content.length);

    // Log that we're initializing Anthropic
    console.log('Initializing Anthropic client');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Log that we're making the API call
    console.log('Making Claude API request');
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `As a UX design expert, analyze this PRD/user story content for gaps and create a comprehensive design checklist. Input: ${content}

[Rest of your prompt remains the same...]`
      }]
    });

    console.log('Received response from Claude');
    console.log('Response type:', typeof response);
    console.log('Response content:', JSON.stringify(response.content[0]));

    // Access the response content with type checking
    if (!response.content || !response.content[0]) {
      throw new Error('Invalid response structure from Claude');
    }

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error(`Unexpected content type: ${contentBlock.type}`);
    }

    const result = contentBlock.text;

    // Split the result into gap analysis and checklist
    const sections = result.split('DESIGN CHECKLIST:');
    const gapAnalysis = sections[0].replace('GAP ANALYSIS:', '').trim();
    const checklist = sections.length > 1 ? sections[1].trim() : '';

    console.log('Successfully processed response');

    return NextResponse.json({
      gapAnalysis,
      checklist
    });
  } catch (error: unknown) {
    console.error('Detailed error information:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
    });

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze document',
        details: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}