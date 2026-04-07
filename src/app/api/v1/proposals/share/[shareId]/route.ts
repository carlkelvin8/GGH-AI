import { prisma } from '@/shared/lib/prisma';
import { ProposalSchema } from '@/features/proposal/types';

/** GET /api/v1/proposals/share/[shareId] — public, no auth */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  const row = await prisma.proposal.findFirst({
    where: { shareId, isPublic: true },
  });

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

  // Increment view count
  await prisma.proposal.update({
    where: { id: row.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  const proposal = ProposalSchema.parse({
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
      viewCount: row.viewCount + 1,
      exportCount: row.exportCount,
      lastViewedAt: new Date().toISOString(),
    },
  });

  return Response.json(proposal);
}
