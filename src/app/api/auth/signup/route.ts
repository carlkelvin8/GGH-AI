import { prisma } from '@/shared/lib/prisma';
import { z } from 'zod';

export const runtime = 'nodejs';

const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const parsed = SignUpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Lazy import so bcryptjs only loads in Node.js runtime
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({ data: { name, email, password: hashed } });

    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[signup] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
