import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      messages: [{ 
        role: "user", 
        content: content 
      }],
      temperature: 0,
      max_tokens: 1024,
    });

    // Type check the response content
    const messageContent = response.content[0];
    if (messageContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      gapAnalysis: messageContent.text,
      checklist: messageContent.text
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}