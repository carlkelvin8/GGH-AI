/**
 * Server-side in-memory presence channel.
 * Holds SSE subscribers per proposal and broadcasts events to all of them.
 * Lives in Node.js module scope — survives across requests in the same process.
 */

export type PresenceEvent =
  | { type: 'join';   userId: string; name: string; color: string }
  | { type: 'leave';  userId: string }
  | { type: 'cursor'; userId: string; sectionId: string | null }
  | { type: 'peers';  peers: Peer[] };

export interface Peer {
  userId: string;
  name: string;
  color: string;
  sectionId: string | null;
}

// proposalId → Map<userId, { controller, peer }>
const channels = new Map<
  string,
  Map<string, { controller: ReadableStreamDefaultController; peer: Peer }>
>();

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];

function colorFor(userId: string) {
  let hash = 0;
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export function subscribe(
  proposalId: string,
  userId: string,
  name: string,
  controller: ReadableStreamDefaultController
) {
  if (!channels.has(proposalId)) channels.set(proposalId, new Map());
  const room = channels.get(proposalId)!;

  const peer: Peer = { userId, name, color: colorFor(userId), sectionId: null };
  room.set(userId, { controller, peer });

  // Send current peers snapshot to the new subscriber
  send(controller, { type: 'peers', peers: [...room.values()].map(v => v.peer) });

  // Broadcast join to everyone else
  broadcast(proposalId, { type: 'join', userId, name, color: peer.color }, userId);
}

export function unsubscribe(proposalId: string, userId: string) {
  const room = channels.get(proposalId);
  if (!room) return;
  room.delete(userId);
  if (room.size === 0) channels.delete(proposalId);
  broadcast(proposalId, { type: 'leave', userId });
}

export function updateCursor(proposalId: string, userId: string, sectionId: string | null) {
  const room = channels.get(proposalId);
  if (!room) return;
  const entry = room.get(userId);
  if (!entry) return;
  entry.peer.sectionId = sectionId;
  broadcast(proposalId, { type: 'cursor', userId, sectionId });
}

function broadcast(proposalId: string, event: PresenceEvent, excludeUserId?: string) {
  const room = channels.get(proposalId);
  if (!room) return;
  for (const [uid, { controller }] of room) {
    if (uid === excludeUserId) continue;
    try { send(controller, event); } catch { /* subscriber disconnected */ }
  }
}

function send(controller: ReadableStreamDefaultController, event: PresenceEvent) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}
