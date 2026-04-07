import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { type ProposalState, type ProposalActions, type Proposal } from '../types';

/**
 * Zustand store for Proposal state management.
 * Persists the user's proposal history.
 */
export const useProposalStore = create<ProposalState & ProposalActions>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        currentProposal: null,
        history: [],
        isGenerating: false,
        error: null,
        analytics: {
          totalGenerations: 0,
          totalExports: 0,
          totalViews: 0,
          templateUsage: {},
          statusDistribution: {},
        },

        // Actions
        setGenerating: (isGenerating) =>
          set(
            (state) => ({
              ...state,
              isGenerating,
            }),
            false,
            'proposal/setGenerating'
          ),

        setProposal: (proposal) =>
          set(
            (state) => ({
              ...state,
              currentProposal: proposal,
            }),
            false,
            'proposal/setProposal'
          ),

        updateSection: (sectionId, content) =>
          set(
            (state) => {
              if (!state.currentProposal) return state;
              const updatedSections = state.currentProposal.sections.map((s) =>
                s.id === sectionId ? { ...s, content } : s
              );
              const updatedProposal = { ...state.currentProposal, sections: updatedSections };
              const newState = {
                ...state,
                currentProposal: updatedProposal,
                history: state.history.map((p) =>
                  p.id === updatedProposal.id ? updatedProposal : p
                ),
              };
              return newState;
            },
            false,
            'proposal/updateSection'
          ),

        updateTemplate: (template) =>
          set(
            (state) => {
              if (!state.currentProposal) return state;
              const updatedProposal = { ...state.currentProposal, template };
              const newState = {
                ...state,
                currentProposal: updatedProposal,
                history: state.history.map((p) =>
                  p.id === updatedProposal.id ? updatedProposal : p
                ),
              };
              return newState;
            },
            false,
            'proposal/updateTemplate'
          ),

        updateStatus: (proposalId, status) =>
          set(
            (state) => {
              const update = (p: Proposal) => (p.id === proposalId ? { ...p, status } : p);
              const newHistory = state.history.map(update);
              
              // Recalculate global analytics distribution
              const statusDistribution: Record<string, number> = {};
              newHistory.forEach((p) => {
                statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
              });

              return {
                ...state,
                currentProposal: state.currentProposal?.id === proposalId ? update(state.currentProposal) : state.currentProposal,
                history: newHistory,
                analytics: {
                  ...state.analytics,
                  statusDistribution,
                },
              };
            },
            false,
            'proposal/updateStatus'
          ),

        duplicateProposal: (proposalId) =>
          set(
            (state) => {
              const original = state.history.find((p) => p.id === proposalId);
              if (!original) return state;

              const duplicate: Proposal = {
                ...original,
                id: crypto.randomUUID(),
                generatedAt: new Date().toISOString(),
                status: 'draft',
                shareId: undefined,
                isPublic: false,
                collaborators: [],
                stats: { viewCount: 0, exportCount: 0 },
                input: {
                  ...original.input,
                  projectTitle: `${original.input.projectTitle} (Copy)`,
                },
              };

              const newHistory = [duplicate, ...state.history];
              
              // Recalculate analytics
              const templateUsage: Record<string, number> = {};
              const statusDistribution: Record<string, number> = {};
              newHistory.forEach((p) => {
                if (p.template?.id) templateUsage[p.template.id] = (templateUsage[p.template.id] || 0) + 1;
                statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
              });

              return {
                ...state,
                history: newHistory,
                analytics: {
                  ...state.analytics,
                  totalGenerations: newHistory.length,
                  templateUsage,
                  statusDistribution,
                },
              };
            },
            false,
            'proposal/duplicateProposal'
          ),

        addToHistory: (proposal) =>
          set(
            (state) => {
              const newHistory = [proposal, ...state.history.filter((p) => p.id !== proposal.id)];
              
              // Recalculate global analytics
              const templateUsage: Record<string, number> = {};
              const statusDistribution: Record<string, number> = {};
              let totalViews = 0;
              let totalExports = 0;

              newHistory.forEach((p) => {
                if (p.template?.id) templateUsage[p.template.id] = (templateUsage[p.template.id] || 0) + 1;
                statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
                totalViews += p.stats?.viewCount || 0;
                totalExports += p.stats?.exportCount || 0;
              });

              return {
                ...state,
                history: newHistory,
                analytics: {
                  ...state.analytics,
                  totalGenerations: newHistory.length,
                  totalExports,
                  totalViews,
                  templateUsage,
                  statusDistribution,
                },
              };
            },
            false,
            'proposal/addToHistory'
          ),

        removeFromHistory: (proposalId) =>
          set(
            (state) => {
              const newHistory = state.history.filter((p) => p.id !== proposalId);
              
              // Recalculate global analytics
              const templateUsage: Record<string, number> = {};
              const statusDistribution: Record<string, number> = {};
              let totalViews = 0;
              let totalExports = 0;

              newHistory.forEach((p) => {
                if (p.template?.id) templateUsage[p.template.id] = (templateUsage[p.template.id] || 0) + 1;
                statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
                totalViews += p.stats?.viewCount || 0;
                totalExports += p.stats?.exportCount || 0;
              });

              return {
                ...state,
                history: newHistory,
                currentProposal: state.currentProposal?.id === proposalId ? null : state.currentProposal,
                analytics: {
                  ...state.analytics,
                  totalGenerations: newHistory.length,
                  totalExports,
                  totalViews,
                  templateUsage,
                  statusDistribution,
                },
              };
            },
            false,
            'proposal/removeFromHistory'
          ),

        setShareId: (proposalId, shareId) =>
          set(
            (state) => {
              const update = (p: Proposal) => (p.id === proposalId ? { ...p, shareId, isPublic: true } : p);
              return {
                ...state,
                currentProposal: state.currentProposal ? update(state.currentProposal) : null,
                history: state.history.map(update),
              };
            },
            false,
            'proposal/setShareId'
          ),

        addCollaborator: (proposalId, email) =>
          set(
            (state) => {
              const update = (p: Proposal) =>
                p.id === proposalId
                  ? { ...p, collaborators: [...new Set([...p.collaborators, email])] }
                  : p;
              return {
                ...state,
                currentProposal: state.currentProposal ? update(state.currentProposal) : null,
                history: state.history.map(update),
              };
            },
            false,
            'proposal/addCollaborator'
          ),

        trackView: (proposalId) =>
          set(
            (state) => {
              const update = (p: Proposal) => {
                if (p.id === proposalId) {
                  return {
                    ...p,
                    stats: {
                      ...p.stats,
                      viewCount: (p.stats?.viewCount || 0) + 1,
                      lastViewedAt: new Date().toISOString(),
                    },
                  };
                }
                return p;
              };

              const newHistory = state.history.map(update);
              const totalViews = newHistory.reduce((acc, p) => acc + (p.stats?.viewCount || 0), 0);

              return {
                ...state,
                currentProposal: state.currentProposal ? update(state.currentProposal) : null,
                history: newHistory,
                analytics: {
                  ...state.analytics,
                  totalViews,
                },
              };
            },
            false,
            'proposal/trackView'
          ),

        trackExport: (proposalId) =>
          set(
            (state) => {
              const update = (p: Proposal) => {
                if (p.id === proposalId) {
                  return {
                    ...p,
                    stats: {
                      ...p.stats,
                      exportCount: (p.stats?.exportCount || 0) + 1,
                    },
                  };
                }
                return p;
              };

              const newHistory = state.history.map(update);
              const totalExports = newHistory.reduce((acc, p) => acc + (p.stats?.exportCount || 0), 0);

              return {
                ...state,
                currentProposal: state.currentProposal ? update(state.currentProposal) : null,
                history: newHistory,
                analytics: {
                  ...state.analytics,
                  totalExports,
                },
              };
            },
            false,
            'proposal/trackExport'
          ),

        updateAnalytics: () =>
          set(
            (state) => {
              const templateUsage: Record<string, number> = {};
              const statusDistribution: Record<string, number> = {};
              let totalViews = 0;
              let totalExports = 0;

              state.history.forEach((p) => {
                if (p.template?.id) templateUsage[p.template.id] = (templateUsage[p.template.id] || 0) + 1;
                statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
                totalViews += p.stats?.viewCount || 0;
                totalExports += p.stats?.exportCount || 0;
              });

              return {
                ...state,
                analytics: {
                  totalGenerations: state.history.length,
                  totalExports,
                  totalViews,
                  templateUsage,
                  statusDistribution,
                },
              };
            },
            false,
            'proposal/updateAnalytics'
          ),

        setError: (error) =>
          set(
            (state) => ({
              ...state,
              error,
            }),
            false,
            'proposal/setError'
          ),

        reset: () =>
          set(
            (state) => ({
              ...state,
              currentProposal: null,
              error: null,
            }),
            false,
            'proposal/reset'
          ),
      }),
      {
        name: 'ggh-proposal-storage',
        version: 2,
        migrate(persistedState: unknown, version: number) {
          const state = persistedState as Record<string, unknown>;
          // v1 → v2: ensure every proposal has template, collaborators, stats
          if (version < 2 && Array.isArray(state.history)) {
            state.history = (state.history as Record<string, unknown>[]).map((p) => ({
              ...p,
              template: p.template ?? null,
              collaborators: p.collaborators ?? [],
              stats: p.stats ?? { viewCount: 0, exportCount: 0 },
            }));
          }
          return state;
        },
      }
    )
  )
);
