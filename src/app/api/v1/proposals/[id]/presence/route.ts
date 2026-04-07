import { auth } from '../../../../../../../auth';
import {
  subscribe,
  unsubscribe,
  updateCursor,
} from '@/features/proposal/services/presence-channel';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/proposals/[id]/presence
 * SSE stream — client connects and receives real-time presence events.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: proposalId } = await params;
  const userId = session.user.id;
  const name = session.user.name ?? session.user.email ?? 'Anonymous';

  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      subscribe(proposalId, userId, name, controller);
    },
    cancel() {
      unsubscribe(proposalId, userId);
    },
  });

  // Clean up when the client disconnects
  req.signal.addEventListener('abort', () => {
    unsubscribe(proposalId, userId);
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

/**
 * POST /api/v1/proposals/[id]/presence
 * Client sends cursor updates: { sectionId: string | null }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: proposalId } = await params;
  const { sectionId } = await req.json() as { sectionId: string | null };

  updateCursor(proposalId, session.user.id, sectionId ?? null);
  return new Response(null, { status: 204 });
}
