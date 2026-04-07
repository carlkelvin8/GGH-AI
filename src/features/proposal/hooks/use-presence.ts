'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Peer } from '../services/presence-channel';

export type { Peer };

interface UsePresenceOptions {
  proposalId: string | undefined;
  enabled?: boolean;
}

export function usePresence({ proposalId, enabled = true }: UsePresenceOptions) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!proposalId || !enabled) return;

    const es = new EventSource(`/api/v1/proposals/${proposalId}/presence`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as
          | { type: 'peers'; peers: Peer[] }
          | { type: 'join'; userId: string; name: string; color: string }
          | { type: 'leave'; userId: string }
          | { type: 'cursor'; userId: string; sectionId: string | null };

        if (event.type === 'peers') {
          setPeers(event.peers);
        } else if (event.type === 'join') {
          setPeers(prev => {
            if (prev.some(p => p.userId === event.userId)) return prev;
            return [...prev, { userId: event.userId, name: event.name, color: event.color, sectionId: null }];
          });
        } else if (event.type === 'leave') {
          setPeers(prev => prev.filter(p => p.userId !== event.userId));
        } else if (event.type === 'cursor') {
          setPeers(prev =>
            prev.map(p => p.userId === event.userId ? { ...p, sectionId: event.sectionId } : p)
          );
        }
      } catch { /* ignore parse errors */ }
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [proposalId, enabled]);

  /** Call when the local user focuses/blurs a section */
  const updateCursor = useCallback((sectionId: string | null) => {
    if (!proposalId) return;
    fetch(`/api/v1/proposals/${proposalId}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId }),
    }).catch(() => {});
  }, [proposalId]);

  return { peers, updateCursor };
}
