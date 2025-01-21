import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  console.log('API Route started');
  
  try {
    const { content } = await request.json();
    console.log('Content received:', content);
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const anthropic = new Anthropic({
      apiKey
    });

    console.log('Making request to Claude');
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        messages: [{ 
          role: "user", 
          content: `As a UX expert, analyze this user story for gaps and create a UX design checklist.

Story to analyze: "${content}"

Provide your response in two clear sections:

GAP ANALYSIS:
1. Missing User Requirements
- Identify missing user scenarios
- Note undefined user types/roles
- List missing prerequisites

2. Technical & Security Gaps
- Authentication requirements
- Security considerations
- Performance criteria
- Data handling needs

3. UX/UI Gaps
- Missing interface states
- Interaction patterns
- Navigation requirements
- Feedback mechanisms

DESIGN CHECKLIST:
1. User States
□ List all required states (logged out, logging in, etc.)
□ Define success states
□ Define error states

2. Authentication Flow
□ Login form requirements
□ Validation rules
□ Error handling
□ Security measures

3. Dashboard Access
□ Navigation requirements
□ Content organization
□ User permissions
□ Loading states

4. Accessibility
□ WCAG compliance needs
□ Keyboard navigation
□ Screen reader support

Keep your analysis focused and actionable.`
        }],
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      console.log('Claude response received');
      
      if (!response.content || !response.content[0] || response.content[0].type !== 'text') {
        throw new Error('Invalid response format from Claude');
      }

      const fullResponse = response.content[0].text;
      const [gapAnalysis, checklist] = fullResponse.split('DESIGN CHECKLIST:');

      return NextResponse.json({
        gapAnalysis: gapAnalysis.replace('GAP ANALYSIS:', '').trim(),
        checklist: checklist?.trim() || 'No checklist generated'
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