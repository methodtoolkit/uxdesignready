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

1. Missing User Flows
- Identify missing user journeys and interactions
- Highlight critical user flows that aren't addressed
- Note any edge cases or alternative paths not considered
- List any missing user roles or permissions
- Identify gaps in user onboarding or offboarding processes

2. Incomplete Technical Requirements
- List missing technical specifications
- Identify undefined system behaviors
- Note missing performance criteria
- Highlight security considerations not addressed
- Point out missing integration requirements
- Note any missing data handling requirements

3. UX/UI Requirements Gaps
- Missing interaction patterns
- Undefined UI states
- Missing responsive design requirements
- Unclear navigation patterns
- Missing content strategy requirements
- Undefined visual design requirements
- Missing feedback mechanisms

4. Accessibility & Inclusivity Gaps
- Missing WCAG compliance requirements
- Unaddressed accessibility scenarios
- Missing internationalization considerations
- Overlooked user diversity needs
- Missing keyboard navigation requirements
- Undefined screen reader requirements
- Missing color contrast specifications

DESIGN CHECKLIST:

1. User States & Flows
□ Initial/empty states
□ Loading states
□ Success states
□ Error states
□ Edge cases
□ User journey maps
□ State transitions

2. Interface Requirements
□ Responsive breakpoints
□ Component specifications
□ Layout grids
□ Typography system
□ Color system
□ Icon system
□ Navigation patterns

3. Interaction Design
□ Input validation
□ Form behaviors
□ Button states
□ Feedback mechanisms
□ Animations/transitions
□ Touch interactions
□ Keyboard interactions

4. Error Handling
□ Validation messages
□ Error prevention
□ Recovery flows
□ System feedback
□ Help documentation
□ Timeout handling
□ Connection issues

5. Accessibility Requirements
□ WCAG compliance level
□ Keyboard navigation
□ Screen reader support
□ Color contrast
□ Text alternatives
□ Focus management
□ ARIA labels

6. Performance Requirements
□ Loading times
□ Animation performance
□ Response times
□ Offline behavior
□ Data caching
□ Resource optimization

Format each section with clear headings and bullet points for readability. Be specific about what's missing and what needs to be defined.`
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