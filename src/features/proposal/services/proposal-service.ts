import { 
  type Proposal, 
  type ProposalInput, 
  ProposalSchema 
} from '../types';
import { 
  createUserFriendlyError, 
  retryWithBackoff, 
  withTimeout 
} from '@/shared/lib/error-handler';

/**
 * Service Layer for Proposal Generation logic.
 * Enhanced with better error handling and user feedback.
 */
export class ProposalService {
  /**
   * Generates a proposal based on the provided input.
   * This simulates an AI-driven generation process.
   */
  static async generate(input: ProposalInput): Promise<Proposal> {
    try {
      // Add timeout and retry logic
      const response = await retryWithBackoff(async () => {
        return withTimeout(
          fetch('/api/v1/proposals/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          }),
          30000 // 30 second timeout
        );
      }, 2); // Retry up to 2 times

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // GGH Standard: Validate API response at the boundary
      const validatedProposal = ProposalSchema.parse(data);

      return validatedProposal;
    } catch (error) {
      console.error('ProposalService.generate failed:', {
        error,
        input,
        timestamp: new Date().toISOString(),
      });
      
      // Convert to user-friendly error
      const userError = createUserFriendlyError(error);
      throw new Error(userError.message);
    }
  }

  /**
   * Generates a proposal using the OpenClaw Agentic Engine.
   * Streams progress steps from the API route, then returns the final proposal.
   * Falls back to local mock generation when no API key is configured.
   */
  static async openClawGenerate(
    input: ProposalInput,
    onStep?: (step: string) => void
  ): Promise<Proposal> {
    const response = await fetch('/api/v1/proposals/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Generation request failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line) as
            | { type: 'step'; data: string }
            | { type: 'done'; data: Proposal }
            | { type: 'error'; data: string };

          if (event.type === 'step' && onStep) {
            onStep(event.data);
          } else if (event.type === 'done') {
            return ProposalSchema.parse(event.data);
          } else if (event.type === 'error') {
            throw new Error(event.data);
          }
        } catch (parseErr) {
          // Skip malformed lines
        }
      }
    }

    throw new Error('Stream ended without a completed proposal.');
  }

  /**
   * Exports a DOM element to a professional, multi-page, text-selectable PDF.
   */
  static async exportToProfessionalPDF(elementId: string, filename: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found for PDF export');

    const opt = {
      margin: [15, 15, 20, 15] as [number, number, number, number],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Professional PDF Export failed:', error);
      throw error;
    }
  }

  /**
   * Sends the proposal to a client via email.
   */
  static async sendToClient(
    proposalId: string, 
    clientEmail: string, 
    clientName: string, 
    projectTitle: string,
    message?: string,
    includeAttachment: boolean = true
  ): Promise<void> {
    try {
      const response = await fetch('/api/v1/proposals/send-to-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          clientEmail,
          clientName,
          projectTitle,
          message,
          includeAttachment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send email: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('ProposalService.sendToClient failed:', error);
      throw error;
    }
  }

  /**
   * Generates a unique share link for a proposal.
   * Persists the shareId to the database so the link works for any recipient.
   */
  static async generateShareLink(proposalId: string, isPublic: boolean = true): Promise<string> {
    const shareId = Math.random().toString(36).substring(2, 15);

    // Persist shareId + isPublic to DB
    await fetch(`/api/v1/proposals/${proposalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareId, isPublic }),
    }).catch(() => {}); // best-effort; Zustand store is source of truth locally

    return `${window.location.origin}/proposals/share/${shareId}`;
  }

  /**
   * Saves a newly generated proposal to the database.
   * Called after openClawGenerate succeeds.
   */
  static async saveToDb(proposal: Proposal): Promise<void> {
    await fetch('/api/v1/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal),
    }).catch((err) => console.warn('DB save failed (offline?):', err));
  }

  /**
   * Syncs a proposal update (status, sections, etc.) to the database.
   */
  static async syncToDb(proposal: Proposal): Promise<void> {
    await fetch(`/api/v1/proposals/${proposal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal),
    }).catch((err) => console.warn('DB sync failed (offline?):', err));
  }

  /**
   * Loads all proposals for the current user from the database.
   * Used to hydrate the Zustand store on first load.
   */
  static async loadFromDb(): Promise<Proposal[]> {
    const res = await fetch('/api/v1/proposals');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Regenerates a single section using AI without touching the rest of the proposal.
   */
  static async regenerateSection(
    sectionTitle: string,
    input: ProposalInput,
    tone: 'formal' | 'casual' | 'technical' = 'formal'
  ): Promise<string> {
    const res = await fetch('/api/v1/proposals/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionTitle, input, tone }),
    });
    if (!res.ok) throw new Error('Regeneration failed');
    const data = await res.json() as { content?: string; error?: string };
    if (data.error) throw new Error(data.error);
    return data.content ?? '';
  }
  static async addCollaborator(proposalId: string, email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // In a real app, this would trigger an invitation email and update the database
    console.log(`Added collaborator ${email} to proposal ${proposalId}`);
  }
}
