import { prisma } from '@/shared/lib/prisma';
import { ProposalSchema } from '@/features/proposal/types';
import { auth } from '../../../../../../../auth';

/** GET /api/v1/proposals/share/[shareId] — public for public proposals, auth required for private */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  const row = await prisma.proposal.findFirst({
    where: { shareId },
  });

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

  // If proposal is private, require authentication and ownership
  if (!row.isPublic) {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== row.userId) {
      return Response.json({ error: 'Unauthorized - Private proposal' }, { status: 401 });
    }
  }

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
