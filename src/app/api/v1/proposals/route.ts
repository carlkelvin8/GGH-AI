import { auth } from '../../../../../auth';
import { prisma } from '@/shared/lib/prisma';
import { ProposalSchema } from '@/features/proposal/types';

/** GET /api/v1/proposals — list all proposals for the signed-in user */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { generatedAt: 'desc' },
  });

  const proposals = rows.map(dbRowToProposal);
  return Response.json(proposals);
}

/** POST /api/v1/proposals — save a newly generated proposal */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ProposalSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid proposal', details: parsed.error.flatten() }, { status: 400 });
  }

  const p = parsed.data;

  const row = await prisma.proposal.create({
    data: {
      id: p.id,
      userId: session.user.id,
      input: JSON.stringify(p.input),
      sections: JSON.stringify(p.sections),
      template: JSON.stringify(p.template),
      status: p.status,
      shareId: p.shareId ?? null,
      isPublic: p.isPublic,
      collaborators: JSON.stringify(p.collaborators),
      viewCount: p.stats.viewCount,
      exportCount: p.stats.exportCount,
      lastViewedAt: p.stats.lastViewedAt ? new Date(p.stats.lastViewedAt) : null,
      generatedAt: new Date(p.generatedAt),
    },
  });

  return Response.json(dbRowToProposal(row), { status: 201 });
}

// ─── helpers ────────────────────────────────────────────────────────────────

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
