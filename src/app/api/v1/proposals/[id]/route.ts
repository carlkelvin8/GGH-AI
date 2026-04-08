import { auth } from '../../../../../../auth';
import { prisma } from '@/shared/lib/prisma';
import { ProposalSchema } from '@/features/proposal/types';

/** GET /api/v1/proposals/[id] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const row = await prisma.proposal.findFirst({ where: { id, userId: session.user.id } });
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json(dbRowToProposal(row));
}

/** PUT /api/v1/proposals/[id] — update status, sections, shareId, collaborators, stats */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.proposal.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  let body;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch (error) {
    return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Accept either a full Proposal or a partial patch object
  const fullParsed = ProposalSchema.safeParse(body);

  if (fullParsed.success) {
    const p = fullParsed.data;
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        sections: JSON.stringify(p.sections),
        template: JSON.stringify(p.template),
        status: p.status,
        shareId: p.shareId ?? null,
        isPublic: p.isPublic,
        collaborators: JSON.stringify(p.collaborators),
        viewCount: p.stats.viewCount,
        exportCount: p.stats.exportCount,
        lastViewedAt: p.stats.lastViewedAt ? new Date(p.stats.lastViewedAt) : null,
      },
    });
    return Response.json(dbRowToProposal(updated));
  }

  // Partial patch — only update provided fields
  const patch: Record<string, unknown> = {};
  if (typeof body.status === 'string') patch.status = body.status;
  if (typeof body.shareId === 'string') patch.shareId = body.shareId;
  if (typeof body.isPublic === 'boolean') patch.isPublic = body.isPublic;
  if (Array.isArray(body.collaborators)) patch.collaborators = JSON.stringify(body.collaborators);
  if (Array.isArray(body.sections)) patch.sections = JSON.stringify(body.sections);

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const updated = await prisma.proposal.update({ where: { id }, data: patch });
  return Response.json(dbRowToProposal(updated));
}

/** DELETE /api/v1/proposals/[id] */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.proposal.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  await prisma.proposal.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

// ─── helper ─────────────────────────────────────────────────────────────────

function dbRowToProposal(row: {
  id: string;
  input: string;
  sections: string;
  template: string;
  status: string;
  shareId: string | null;
  isPublic: boolean;
  collaborators: string;
  viewCount: number;
  exportCount: number;
  lastViewedAt: Date | null;
  generatedAt: Date;
}) {
  return ProposalSchema.parse({
    id: row.id,
    input: JSON.parse(row.input),
    sections: JSON.parse(row.sections),
    template: JSON.parse(row.template),
    status: row.status,
    shareId: row.shareId ?? undefined,
    isPublic: row.isPublic,
    collaborators: JSON.parse(row.collaborators),
    generatedAt: row.generatedAt.toISOString(),
    stats: {
      viewCount: row.viewCount,
      exportCount: row.exportCount,
      lastViewedAt: row.lastViewedAt?.toISOString(),
    },
  });
}
