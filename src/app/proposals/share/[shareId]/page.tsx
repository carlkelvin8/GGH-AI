import { prisma } from '@/shared/lib/prisma';
import { ProposalSchema } from '@/features/proposal/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { FileText, Ghost, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { auth } from '../../../../../auth';

/**
 * Public Share Page — Server Component.
 * Fetches the proposal from the database by shareId.
 * Works for public proposals or private proposals for authenticated owners.
 */
export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const row = await prisma.proposal.findFirst({
    where: { shareId },
  });

  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl inline-block">
            <Ghost className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Proposal Not Found</h2>
          <p className="text-slate-500 font-medium">
            The link might be expired or the proposal no longer exists.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Back to GGH AI</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if proposal is private and user has access
  if (!row.isPublic) {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== row.userId) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl inline-block">
              <Lock className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Private Proposal</h2>
            <p className="text-slate-500 font-medium">
              This proposal is private and requires authentication to view.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full rounded-xl">
                <Link href="/auth/signin">Sign In to View</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href="/">Back to GGH AI</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Increment view count server-side (fire and forget)
  prisma.proposal
    .update({
      where: { id: row.id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
    })
    .catch(() => {});

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
      viewCount: row.viewCount,
      exportCount: row.exportCount,
      lastViewedAt: row.lastViewedAt?.toISOString(),
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              GGH <span className="text-primary">Proposal AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-widest text-[10px]">
              Official Proposal
            </Badge>
            {!proposal.isPublic && (
              <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Private
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          {/* Hero header */}
          <div
            className={cn(
              'p-10 md:p-16 border-b',
              proposal.template?.style === 'enterprise'
                ? 'bg-slate-900 text-white'
                : proposal.template?.style === 'creative'
                ? 'bg-linear-to-br from-pink-500/5 to-violet-600/5'
                : 'bg-slate-50/30 backdrop-blur-sm'
            )}
          >
            <div className="space-y-4">
              <Badge
                className={cn(
                  'border-none font-bold uppercase tracking-[0.2em] text-[10px] px-0',
                  proposal.template?.style === 'enterprise'
                    ? 'text-primary'
                    : proposal.template?.style === 'creative'
                    ? 'text-pink-600 bg-pink-50 px-2 rounded-lg'
                    : 'text-primary'
                )}
              >
                {proposal.template?.name ?? 'Proposal'} Proposal
              </Badge>
              <h1
                className={cn(
                  'text-4xl md:text-6xl font-black tracking-tight leading-[1.1]',
                  proposal.template?.style === 'enterprise' ? 'text-white' : 'text-slate-900',
                  proposal.template?.style === 'minimal' && 'font-medium',
                  proposal.template?.style === 'creative' &&
                    'text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-violet-600'
                )}
              >
                {proposal.input.projectTitle}
              </h1>
              <div className="flex flex-wrap gap-8 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Prepared For
                  </p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      proposal.template?.style === 'enterprise' ? 'text-slate-200' : 'text-slate-900'
                    )}
                  >
                    {proposal.input.clientName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Generated On
                  </p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      proposal.template?.style === 'enterprise' ? 'text-slate-200' : 'text-slate-900'
                    )}
                  >
                    {new Date(proposal.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={cn(
              'p-10 md:p-16 space-y-20',
              proposal.template?.config?.layoutType === 'split' &&
                'grid grid-cols-1 md:grid-cols-12 gap-12'
            )}
          >
            <div
              className={cn(
                'space-y-20',
                proposal.template?.config?.layoutType === 'split' && 'md:col-span-8'
              )}
            >
              {proposal.sections.map((section) => (
                <section key={section.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    {proposal.template?.style !== 'minimal' && (
                      <div className="h-px flex-1 bg-slate-100" />
                    )}
                    <h3
                      className={cn(
                        'text-xs font-black uppercase tracking-[0.2em]',
                        proposal.template?.style === 'enterprise'
                          ? 'text-slate-900 border-l-4 border-primary pl-3'
                          : proposal.template?.style === 'creative'
                          ? 'text-pink-600'
                          : 'text-primary'
                      )}
                    >
                      {section.title}
                    </h3>
                    {proposal.template?.style !== 'minimal' && (
                      <div className="h-px flex-1 bg-slate-100" />
                    )}
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <div
                      className={cn(
                        'text-slate-700 leading-relaxed text-xl font-medium whitespace-pre-wrap',
                        proposal.template?.style === 'minimal' && 'text-slate-600 font-normal'
                      )}
                    >
                      {section.content}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {proposal.template?.config?.layoutType === 'split' && (
              <div className="md:col-span-4 space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-8 sticky top-8">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                    Document Info
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Version
                      </p>
                      <p className="text-base font-bold text-slate-900">1.0.0-OpenClaw</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Design System
                      </p>
                      <Badge className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {proposal.template?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 border-t bg-slate-50/30 flex justify-center text-center">
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Authorized by GGH Software Development Services
              </p>
              <p className="text-[10px] text-slate-300 font-medium italic">
                Ref: {proposal.id.slice(0, 8).toUpperCase()} &bull; Confidential
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center py-8">
          <p className="text-slate-400 font-bold text-xs">
            Powered by OpenClaw Agentic Engine &mdash; Build it right, build it once.
          </p>
        </footer>
      </div>
    </div>
  );
}
