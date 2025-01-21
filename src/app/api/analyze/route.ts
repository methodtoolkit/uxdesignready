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
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      messages: [{ 
        role: "user", 
        content: `Analyze this user story for UX/UI gaps and create a design checklist: ${content}`
      }],
      temperature: 0,
      max_tokens: 1024,
    });
    console.log('Response received from Claude:', JSON.stringify(response, null, 2));

    // Type check the response content
    const messageContent = response.content[0];
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('Sending response back to client');
    return NextResponse.json({
      gapAnalysis: messageContent.text,
      checklist: messageContent.text
    });

  } catch (error) {
    console.error('Detailed error information:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : 'No stack trace'
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