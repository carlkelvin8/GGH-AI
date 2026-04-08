import OpenAI from 'openai';
import { ProposalInputSchema, ProposalSchema, type ProposalInput } from '@/features/proposal/types';
import { PROPOSAL_TEMPLATES } from '@/features/proposal/templates';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Builds the system + user prompt for a given proposal input and template.
 */
function buildPrompt(input: ProposalInput, templateName: string, sections: string[]): string {
  const requirementsList = input.requirements
    .map((r) => `- [${r.priority.toUpperCase()}] ${r.title}: ${r.description}`)
    .join('\n');

  const toneGuide = {
    formal: 'Use formal, professional language suitable for executive stakeholders.',
    casual: 'Use approachable, conversational language while remaining professional.',
    technical: 'Use precise technical language with specific implementation details and terminology.',
  }[input.tone ?? 'formal'];

  return `You are an expert proposal writer for GGH Software Development Services, a Philippine-based software development company.

Generate a professional project proposal with EXACTLY these sections in order: ${sections.join(', ')}.

Client: ${input.clientName}
Project: ${input.projectTitle}
${input.timeline ? `Timeline: ${input.timeline}` : ''}
Template style: ${templateName}
Tone: ${toneGuide}

Requirements:
${requirementsList}

PRICING GUIDELINES:
- You must calculate and include specific pricing in Philippine Pesos (₱)
- Base pricing range: ₱20,000 to ₱500,000 depending on project complexity
- Consider these factors for pricing:
  * Number and complexity of requirements
  * Priority levels (high priority = more expensive)
  * Technical complexity and development time
  * Integration requirements
  * Custom features vs standard implementations
- Always include a detailed budget breakdown
- Offer optional Support & Maintenance packages:
  * Basic Support: ₱2,000-5,000/month (bug fixes, minor updates)
  * Premium Support: ₱5,000-10,000/month (priority support, feature updates, monitoring)
  * Enterprise Support: ₱10,000-20,000/month (24/7 support, dedicated developer, monthly reviews)

IMPORTANT PRICING RULES:
- Simple projects (1-3 basic requirements): ₱20,000-80,000
- Medium projects (4-6 requirements with moderate complexity): ₱80,000-200,000
- Complex projects (7+ requirements, high complexity, integrations): ₱200,000-500,000
- Always justify the pricing based on the specific requirements provided
- Include payment terms (e.g., 50% upfront, 50% on completion)

Rules:
- Return ONLY a JSON object, no markdown fences, no extra text.
- The JSON must have a "sections" array where each item has "title" (string) and "content" (string).
- Section titles must match exactly: ${sections.map((s) => `"${s}"`).join(', ')}.
- Each section content should be 2-4 paragraphs of professional, specific prose.
- Reference the client name, project title, and requirements naturally throughout.
- Include specific peso amounts (₱) in budget-related sections.
- Always include support and maintenance options as separate line items.
- Do not use placeholder text like "Lorem ipsum" or "TBD".
- Make pricing realistic and competitive for the Philippine market.`;
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json({ 
      error: 'Invalid request format. Please check your input and try again.' 
    }, { status: 400 });
  }
  
  const parsed = ProposalInputSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
      .join('; ');
    
    return Response.json({ 
      error: 'Please check your form inputs',
      details: errorMessages || 'Invalid input format'
    }, { status: 400 });
  }

  const input = parsed.data;
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ 
      error: 'AI service is temporarily unavailable. Please try again later or contact support.' 
    }, { status: 503 });
  }

  const template = PROPOSAL_TEMPLATES.find((t) => t.id === input.templateId) ?? PROPOSAL_TEMPLATES[0];
  // Use custom sections if provided, otherwise fall back to template defaults
  const sections = (input.customSections && input.customSections.length > 0)
    ? input.customSections
    : template.sections;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      };

      try {
        // Emit progress steps while the LLM is thinking
        const steps = [
          'Initializing AI proposal generator...',
          'Analyzing your project requirements...',
          `Applying '${template.name}' template structure...`,
          'Breaking down requirements into strategic objectives...',
          'Generating professional content with AI...',
          'Creating scope of work section...',
          'Calculating timeline and budget estimates...',
          'Finalizing proposal structure and quality check...',
        ];

        // Start the OpenAI call immediately; emit steps while we wait
        const completionPromise = openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildPrompt(input, template.name, sections) },
            { role: 'user', content: 'Generate the proposal now.' },
          ],
        });

        // Emit steps with a small delay between each while the LLM works
        for (const step of steps) {
          send({ type: 'step', data: step });
          await new Promise((r) => setTimeout(r, 600));
        }

        const completion = await completionPromise;
        const raw = completion.choices[0]?.message?.content ?? '{}';
        
        let parsed;
        try {
          parsed = JSON.parse(raw) as { sections: { title: string; content: string }[] };
        } catch (parseError) {
          throw new Error('AI generated invalid response format. Please try again.');
        }

        // Map LLM sections to our schema, filling gaps if the model missed any
        const sectionResults = sections.map((title) => {
          const match = parsed.sections?.find(
            (s) => s.title.toLowerCase().trim() === title.toLowerCase().trim()
          );
          return {
            id: crypto.randomUUID(),
            title,
            content: match?.content ?? `Content for ${title} could not be generated. Please try regenerating this section.`,
          };
        });

        const proposal = ProposalSchema.parse({
          id: crypto.randomUUID(),
          input,
          sections: sectionResults,
          generatedAt: new Date().toISOString(),
          status: 'draft',
          template,
          isPublic: false,
          collaborators: [],
        });

        send({ type: 'done', data: proposal });
      } catch (err) {
        console.error('Proposal generation error:', err);
        
        let userMessage = 'Failed to generate proposal. Please try again.';
        
        if (err instanceof Error) {
          if (err.message.includes('rate_limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (err.message.includes('insufficient_quota')) {
            userMessage = 'AI service quota exceeded. Please contact support.';
          } else if (err.message.includes('timeout')) {
            userMessage = 'Request timed out. Please try with shorter requirements.';
          } else if (err.message.includes('invalid_api_key')) {
            userMessage = 'AI service configuration error. Please contact support.';
          }
        }
        
        send({ type: 'error', data: userMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
