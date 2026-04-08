import { z } from 'zod';

/**
 * Requirement Schema for Proposal Input.
 */
export const ProposalRequirementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high']),
});

/**
 * Proposal Template Definition.
 */
export const ProposalTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  style: z.enum(['modern', 'minimal', 'enterprise', 'creative']),
  sections: z.array(z.string()), // Default section titles
  config: z.object({
    primaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
    layoutType: z.enum(['standard', 'wide', 'split']).default('standard'),
    showTableOfContents: z.boolean().default(true),
    includeRiskAssessment: z.boolean().default(false),
  }).optional(),
});

export type ProposalTemplate = z.infer<typeof ProposalTemplateSchema>;

/**
 * Proposal Generation Input.
 */
export const ProposalInputSchema = z.object({
  clientName: z.string().min(2),
  projectTitle: z.string().min(3),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  requirements: z.array(ProposalRequirementSchema).min(1),
  templateId: z.string(),
  tone: z.enum(['formal', 'casual', 'technical']).default('formal'),
  customSections: z.array(z.string()).optional(),
});

/**
 * Generated Proposal Section.
 */
export const ProposalSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
});

/**
 * Full Generated Proposal.
 */
export const ProposalSchema = z.object({
  id: z.string().uuid(),
  input: ProposalInputSchema,
  sections: z.array(ProposalSectionSchema),
  generatedAt: z.string().datetime(),
  status: z.enum(['draft', 'finalized', 'expired']).default('draft'),
  shareId: z.string().optional(),
  isPublic: z.boolean().default(false),
  collaborators: z.array(z.string().email()).default([]),
  template: ProposalTemplateSchema,
  stats: z.object({
    viewCount: z.number().default(0),
    exportCount: z.number().default(0),
    lastViewedAt: z.string().datetime().optional(),
  }).default({ viewCount: 0, exportCount: 0 }),
});

/**
 * Global Analytics Schema.
 */
export const AnalyticsSchema = z.object({
  totalGenerations: z.number().default(0),
  totalExports: z.number().default(0),
  totalViews: z.number().default(0),
  templateUsage: z.record(z.string(), z.number()).default({}), // templateId -> count
  statusDistribution: z.record(z.string(), z.number()).default({}), // status -> count
});

export type ProposalRequirement = z.infer<typeof ProposalRequirementSchema>;
export type ProposalInput = z.infer<typeof ProposalInputSchema>;
export type ProposalSection = z.infer<typeof ProposalSectionSchema>;
export type Proposal = z.infer<typeof ProposalSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;

export interface ProposalState {
  currentProposal: Proposal | null;
  history: Proposal[];
  isGenerating: boolean;
  error: string | null;
  analytics: Analytics;
}

export interface ProposalActions {
  setGenerating: (isGenerating: boolean) => void;
  setProposal: (proposal: Proposal | null) => void;
  updateSection: (sectionId: string, content: string) => void;
  updateTemplate: (template: ProposalTemplate) => void;
  updateStatus: (proposalId: string, status: Proposal['status']) => void;
  duplicateProposal: (proposalId: string) => void;
  addToHistory: (proposal: Proposal) => void;
  removeFromHistory: (proposalId: string) => void;
  setShareId: (proposalId: string, shareId: string) => void;
  addCollaborator: (proposalId: string, email: string) => void;
  setError: (error: string | null) => void;
  
  // Analytics Actions
  trackView: (proposalId: string) => void;
  trackExport: (proposalId: string) => void;
  updateAnalytics: () => void; // Recalculate global stats from history
  
  reset: () => void;
}
