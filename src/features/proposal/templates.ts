import { type ProposalTemplate } from './types';

/**
 * Default Proposal Templates for GGH Proposal AI.
 */
export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'modern',
    name: 'Modern GGH',
    description: 'A sleek, balanced layout with subtle gradients and clear typography. Best for tech startups.',
    style: 'modern',
    sections: ['Executive Summary', 'Strategic Scope', 'Implementation Timeline', 'Investment Details'],
    config: {
      primaryColor: '#3b82f6', // blue-500
      layoutType: 'standard',
      showTableOfContents: true,
      includeRiskAssessment: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Executive',
    description: 'A formal, high-fidelity structure with emphasis on security and standards. Best for corporate clients.',
    style: 'enterprise',
    sections: ['Executive Overview', 'Technical Architecture', 'Risk Mitigation', 'Budgetary Allocation', 'Next Steps'],
    config: {
      primaryColor: '#0f172a', // slate-900
      layoutType: 'wide',
      showTableOfContents: true,
      includeRiskAssessment: true,
    },
  },
  {
    id: 'minimal',
    name: 'Minimalist Clean',
    description: 'A focused, distraction-free layout that lets the requirements speak for themselves.',
    style: 'minimal',
    sections: ['Overview', 'Deliverables', 'Timeline', 'Cost'],
    config: {
      primaryColor: '#1e293b', // slate-800
      layoutType: 'standard',
      showTableOfContents: false,
      includeRiskAssessment: false,
    },
  },
  {
    id: 'creative',
    name: 'Creative Partner',
    description: 'A bold, high-contrast design with visual flair. Best for design or marketing-led projects.',
    style: 'creative',
    sections: ['The Vision', 'Creative Roadmap', 'Milestones', 'Commercials'],
    config: {
      primaryColor: '#ec4899', // pink-500
      layoutType: 'split',
      showTableOfContents: true,
      includeRiskAssessment: false,
    },
  },
];
