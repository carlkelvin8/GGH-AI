'use client';

import { useState, useCallback } from 'react';
import { 
  BarChart3, TrendingUp, Eye, Download, FileText,
  Clock, Layout, ArrowUpRight, Target, PieChart,
  ShieldCheck, AlertCircle, Calendar, ChevronRight
} from 'lucide-react';
import { useProposalStore } from '../store/proposal-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { PROPOSAL_TEMPLATES } from '../templates';
import { aggregateTimeSeries, formatBucketLabel, type Granularity } from '../utils/time-series';
import type { Proposal } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function exportCSV(proposals: Proposal[]) {
  const rows = [
    ['ID', 'Client', 'Project', 'Template', 'Status', 'Generated At', 'Views', 'Exports'],
    ...proposals.map(p => [
      p.id,
      p.input.clientName,
      p.input.projectTitle,
      p.template?.name ?? '',
      p.status,
      p.generatedAt,
      String(p.stats?.viewCount ?? 0),
      String(p.stats?.exportCount ?? 0),
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ggh-proposals-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Trend Chart ─────────────────────────────────────────────────────────────

function TrendChart({ proposals }: { proposals: Proposal[] }) {
  const [granularity, setGranularity] = useState<Granularity>('week');
  const buckets = aggregateTimeSeries(proposals, granularity);
  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="p-8 border-b bg-slate-50/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Generation Trend
            </CardTitle>
            <CardDescription className="font-medium">Proposals generated over time.</CardDescription>
          </div>
          {/* Granularity toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {(['day', 'week'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
                  granularity === g
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {g === 'day' ? 'Day' : 'Week'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {buckets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400">No data yet — generate your first proposal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bars */}
            <div className="flex items-end gap-2 h-40">
              {buckets.map(bucket => {
                const heightPct = (bucket.count / maxCount) * 100;
                const label = formatBucketLabel(bucket.date, granularity);
                return (
                  <div key={bucket.date} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-slate-700 bg-white border border-slate-100 shadow-lg rounded-lg px-2 py-1 whitespace-nowrap">
                      {bucket.count} proposal{bucket.count !== 1 ? 's' : ''}
                    </div>
                    {/* Bar */}
                    <div className="w-full flex items-end" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-700 ease-out group-hover:bg-primary/80"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-2">
              {buckets.map(bucket => (
                <div key={bucket.date} className="flex-1 text-center text-[9px] font-bold text-slate-400 truncate min-w-0">
                  {formatBucketLabel(bucket.date, granularity)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const { analytics, history, setProposal } = useProposalStore();
  const [engagementFilter, setEngagementFilter] = useState<'all' | '7d' | '30d'>('all');

  const filteredEngagement = history.filter(p => {
    if (engagementFilter === 'all') return true;
    const cutoff = daysAgo(engagementFilter === '7d' ? 7 : 30);
    return new Date(p.generatedAt) >= cutoff;
  });

  const handleExportCSV = useCallback(() => exportCSV(history), [history]);

  const stats = [
    {
      title: 'Total Proposals',
      value: analytics.totalGenerations,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Proposals generated by OpenClaw',
    },
    {
      title: 'Client Engagement',
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: 'Total views across shared links',
    },
    {
      title: 'Document Exports',
      value: analytics.totalExports,
      icon: Download,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'PDF documents downloaded',
    },
    {
      title: 'Finalized Rate',
      value: `${analytics.totalGenerations > 0 ? Math.round((analytics.statusDistribution['finalized'] || 0) / analytics.totalGenerations * 100) : 0}%`,
      icon: Target,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      description: 'Conversion to finalized state',
    },
  ];

  const topTemplateId = Object.entries(analytics.templateUsage).sort(([, a], [, b]) => b - a)[0]?.[0];
  const topTemplate = PROPOSAL_TEMPLATES.find(t => t.id === topTemplateId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <Card key={stat.title} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn('p-3 rounded-2xl', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-100">Lifetime</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-500">{stat.title}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-4 uppercase tracking-wider">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart — full width */}
      <TrendChart proposals={history} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Distribution */}
        <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b bg-slate-50/30">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-500" /> Success Metrics
            </CardTitle>
            <CardDescription className="font-medium">Proposal lifecycle distribution.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { label: 'Draft', status: 'draft', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Finalized', status: 'finalized', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Expired', status: 'expired', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map(item => {
              const count = analytics.statusDistribution[item.status] || 0;
              const pct = analytics.totalGenerations > 0 ? (count / analytics.totalGenerations) * 100 : 0;
              return (
                <div key={item.status} className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                    <item.icon className={cn('w-5 h-5', item.color)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-900">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-1000', item.color.replace('text', 'bg'))} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Template Performance */}
        <Card className="lg:col-span-8 border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b bg-slate-50/30">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Template Performance
                </CardTitle>
                <CardDescription className="font-medium">Which styles resonate most with your clients.</CardDescription>
              </div>
              {topTemplate && (
                <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                  Top: {topTemplate.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {PROPOSAL_TEMPLATES.map(template => {
              const count = analytics.templateUsage[template.id] || 0;
              const pct = analytics.totalGenerations > 0 ? (count / analytics.totalGenerations) * 100 : 0;
              return (
                <div key={template.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{template.name}</span>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter h-4 px-1 leading-none">{template.style}</Badge>
                    </div>
                    <span className="text-xs font-black text-slate-400">{count} usage{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Engagement Feed */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b bg-slate-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Recent Engagement
              </CardTitle>
              <CardDescription className="font-medium">Activity on your proposals.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Time filter */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {([['all', 'All'], ['7d', '7d'], ['30d', '30d']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setEngagementFilter(val)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                      engagementFilter === val
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* CSV export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={history.length === 0}
                className="h-9 rounded-xl font-bold border-slate-200 text-slate-600"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {filteredEngagement.slice(0, 8).map(proposal => (
              <button
                key={proposal.id}
                onClick={() => setProposal(proposal)}
                className="w-full flex items-center gap-4 group text-left hover:bg-slate-50 rounded-2xl p-2 -mx-2 transition-colors"
              >
                <div className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg',
                  proposal.stats?.viewCount > 0 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-200 shadow-slate-100'
                )}>
                  {proposal.stats?.viewCount > 0 ? <Eye className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-primary transition-colors">
                    {proposal.input.clientName} — {proposal.input.projectTitle}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {proposal.stats?.viewCount ?? 0} Views · {proposal.stats?.exportCount ?? 0} Exports · {new Date(proposal.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}

            {filteredEngagement.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                  <Layout className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  {engagementFilter !== 'all' ? `No proposals in the last ${engagementFilter}.` : 'No activity recorded yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
