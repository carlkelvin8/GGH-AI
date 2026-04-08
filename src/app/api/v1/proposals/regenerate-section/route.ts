import OpenAI from 'openai';
import { z } from 'zod';
import { ProposalInputSchema } from '@/features/proposal/types';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RequestSchema = z.object({
  sectionTitle: z.string().min(1),
  input: ProposalInputSchema,
  tone: z.enum(['formal', 'casual', 'technical']).default('formal'),
});

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }
  
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { sectionTitle, input, tone } = parsed.data;

  const toneGuide = {
    formal: 'Use formal, professional language suitable for executive stakeholders.',
    casual: 'Use approachable, conversational language while remaining professional.',
    technical: 'Use precise technical language with specific implementation details.',
  }[tone];

  const requirementsList = input.requirements
    .map((r) => `- [${r.priority.toUpperCase()}] ${r.title}: ${r.description}`)
    .join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert proposal writer. Regenerate ONLY the "${sectionTitle}" section for a proposal.
Client: ${input.clientName}
Project: ${input.projectTitle}
${input.budgetRange ? `Budget: ${input.budgetRange}` : ''}
${input.timeline ? `Timeline: ${input.timeline}` : ''}
Tone: ${toneGuide}
Requirements:\n${requirementsList}

Return ONLY a JSON object: { "content": "..." } with 2-4 paragraphs of fresh, specific prose.
Do not repeat the previous version. Make it distinct and compelling.`,
        },
        { role: 'user', content: `Regenerate the "${sectionTitle}" section now.` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(raw) as { content?: string };
    const content = result.content ?? 'Could not regenerate this section. Please try again.';

    return Response.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Regeneration failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
