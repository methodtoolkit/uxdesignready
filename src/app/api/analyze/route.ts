import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `As a UX design expert, analyze this PRD/user story content for gaps and create a comprehensive design checklist. Input: ${content}

Your analysis should follow this structure:

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
      }]
    });

    const result = response.content[0].text;

    // Split the result into gap analysis and checklist
    const sections = result.split('DESIGN CHECKLIST:');
    const gapAnalysis = sections[0].replace('GAP ANALYSIS:', '').trim();
    const checklist = sections.length > 1 ? sections[1].trim() : '';

    return NextResponse.json({
      gapAnalysis,
      checklist
    });
} catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze document';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}