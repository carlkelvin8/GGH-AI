'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Loader2, 
  History, 
  Wand2, 
  Download, 
  Send, 
  Briefcase, 
  User, 
  Clock, 
  DollarSign,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Share2,
  Users,
  Copy,
  Mail,
  Layout,
  Palette,
  Eye,
  BarChart3,
  MoreVertical,
  CopyPlus,
  ArrowRightLeft,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { ProposalInputSchema, type ProposalInput } from '../types';
import { usePresence } from '../hooks/use-presence';
import { PROPOSAL_TEMPLATES } from '../templates';
import { ProposalService } from '../services/proposal-service';
import { useProposalStore } from '../store/proposal-store';
import { AnalyticsDashboard } from './analytics-dashboard';
import { HistorySkeleton } from './history-skeleton';
import { WelcomeScreen } from './welcome-screen';
import { SmartFormWizard } from './smart-form-wizard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/shared/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';

/**
 * Proposal Generator Component.
 * AI-powered tool to generate professional project proposals.
 */
export function ProposalGenerator() {
  const { 
    currentProposal, 
    setProposal, 
    updateSection,
    addToHistory, 
    removeFromHistory,
    setShareId,
    addCollaborator,
    trackExport,
    updateStatus,
    duplicateProposal,
    isGenerating, 
    setGenerating, 
    history 
  } = useProposalStore();
  
  // UI State Management
  const [mode, setMode] = useState<'welcome' | 'wizard' | 'generator'>('welcome');
  const [activeTab, setActiveTab] = useState('generator');
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isPublicShare, setIsPublicShare] = useState(true);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized' | 'expired'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [tone, setTone] = useState<'formal' | 'casual' | 'technical'>('formal');
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DRAFT_KEY = 'ggh-proposal-draft';

  // Simulate loading for history tab on mount
  useEffect(() => {
    const timer = setTimeout(() => setHistoryLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl+S to save, Esc to cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editingSectionId) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSectionId, editContent]);

  const { peers, updateCursor } = usePresence({
    proposalId: currentProposal?.id,
    enabled: activeTab === 'preview',
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset: resetForm,
  } = useForm<ProposalInput>({
    resolver: zodResolver(ProposalInputSchema) as never,
    defaultValues: (() => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(DRAFT_KEY);
          if (saved) return JSON.parse(saved) as ProposalInput;
        } catch { /* ignore */ }
      }
      return {
        requirements: [{ id: crypto.randomUUID(), title: '', description: '', priority: 'medium' as const }],
        templateId: 'modern',
        tone: 'formal' as const,
      };
    })(),
  });

  const formValues = watch();

  // Persist form draft to localStorage on every change
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(formValues)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [formValues]);

  const selectedTemplateId = watch('templateId');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const onSubmit = async (data: ProposalInput) => {
    const hasValidRequirements = data.requirements.some(r => r.title.trim() && r.description.trim());
    if (!hasValidRequirements) {
      toast.error('Add at least one complete requirement with a title and description.');
      return;
    }

    setGenerating(true);
    setCurrentStep('Initializing OpenClaw Agent...');
    try {
      const payload = { ...data, tone, customSections: customSections.length > 0 ? customSections : undefined };
      const proposal = await ProposalService.openClawGenerate(payload, (step) => {
        setCurrentStep(step);
      });
      setProposal(proposal);
      addToHistory(proposal);
      ProposalService.saveToDb(proposal).catch(() => {});
      // Clear draft after successful generation
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setActiveTab('preview');
      toast.success('Proposal generated successfully.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Generation failed.';
      toast.error(msg);
    } finally {
      setGenerating(false);
      setCurrentStep(null);
    }
  };

  const handleExportPDF = async () => {
    if (!currentProposal) return;
    setIsExporting(true);
    const toastId = toast.loading('Exporting PDF…');
    try {
      const filename = `${currentProposal.input.clientName.replace(/\s+/g, '_')}_Proposal`;
      await ProposalService.exportToProfessionalPDF('proposal-preview-content', filename);
      trackExport(currentProposal.id);
      toast.success('PDF exported.', { id: toastId });
    } catch (error) {
      toast.error('PDF export failed.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendToClient = async () => {
    if (!currentProposal) return;
    setIsSending(true);
    const toastId = toast.loading('Sending to client…');
    try {
      await ProposalService.sendToClient(currentProposal.id);
      toast.success('Sent to client.', { id: toastId });
    } catch {
      toast.error('Failed to send.', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const handleStartEdit = (sectionId: string, content: string) => {
    setEditingSectionId(sectionId);
    setEditContent(content);
    setIsDirty(false);
    updateCursor(sectionId);
  };

  const handleSaveEdit = useCallback(() => {
    if (editingSectionId) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      updateSection(editingSectionId, editContent);
      setEditingSectionId(null);
      setIsDirty(false);
      updateCursor(null);
    }
  }, [editingSectionId, editContent, updateSection, updateCursor]);

  const handleCancelEdit = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setEditingSectionId(null);
    setIsDirty(false);
    updateCursor(null);
  }, [updateCursor]);

  const handleRegenerateSection = async (sectionId: string, sectionTitle: string) => {
    if (!currentProposal) return;
    setRegeneratingSectionId(sectionId);
    const toastId = toast.loading(`Regenerating "${sectionTitle}"…`);
    try {
      const newContent = await ProposalService.regenerateSection(
        sectionTitle,
        currentProposal.input,
        tone
      );
      updateSection(sectionId, newContent);
      toast.success('Section regenerated.', { id: toastId });
    } catch {
      toast.error('Regeneration failed.', { id: toastId });
    } finally {
      setRegeneratingSectionId(null);
    }
  };

  const handleEditContentChange = (value: string) => {    setEditContent(value);
    setIsDirty(true);
    // Auto-save after 2s of inactivity
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (editingSectionId) {
        updateSection(editingSectionId, value);
        setIsDirty(false);
      }
    }, 2000);
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    selectedIds.forEach(id => removeFromHistory(id));
    setSelectedIds(new Set());
    toast.success(`Deleted ${count} proposal${count !== 1 ? 's' : ''}.`);
  };

  const handleShareProposal = async () => {
    if (!currentProposal) return;
    setIsSharing(true);
    const toastId = toast.loading('Generating share link…');
    try {
      const link = await ProposalService.generateShareLink(currentProposal.id, isPublicShare);
      const shareId = link.split('/').pop() || '';
      setShareId(currentProposal.id, shareId);
      setShareLink(link);
      toast.success('Share link ready.', { id: toastId });
    } catch {
      toast.error('Failed to generate link.', { id: toastId });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard.');
    }
  };

  const handleInviteCollaborator = async () => {
    if (!currentProposal || !collaboratorEmail) return;
    setIsInviting(true);
    const toastId = toast.loading('Sending invitation…');
    try {
      await ProposalService.addCollaborator(currentProposal.id, collaboratorEmail);
      addCollaborator(currentProposal.id, collaboratorEmail);
      setCollaboratorEmail('');
      toast.success('Invitation sent.', { id: toastId });
    } catch {
      toast.error('Failed to invite collaborator.', { id: toastId });
    } finally {
      setIsInviting(false);
    }
  };

  const filteredHistory = history.filter((p) => {
    const matchesSearch = 
      p.input.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.input.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Welcome Screen */}
      {mode === 'welcome' && (
        <WelcomeScreen
          onGetStarted={() => setMode('wizard')}
          onSkip={() => setMode('generator')}
        />
      )}

      {/* Smart Form Wizard */}
      {mode === 'wizard' && (
        <SmartFormWizard
          onComplete={(data) => {
            // Pre-fill the form with wizard data
            setValue('clientName', data.clientName);
            setValue('projectTitle', data.projectTitle);
            setValue('budgetRange', data.budgetRange);
            setValue('timeline', data.timeline);
            setValue('requirements', data.requirements);
            setMode('generator');
          }}
          onBack={() => setMode('welcome')}
        />
      )}

      {/* Main Generator Interface */}
      {mode === 'generator' && (
        <>
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('welcome')}
                className="text-slate-500 hover:text-slate-700"
              >
                ← Back to Welcome
              </Button>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Proposal Generator</h2>
                <p className="text-slate-600">Create professional proposals with AI assistance</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('wizard')}
                className="hidden sm:flex"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Use Wizard
              </Button>
            </div>
          </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="px-1 mb-8">
          <TabsList className="w-full max-w-lg h-12 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
            <TabsTrigger value="generator" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              <Wand2 className="w-4 h-4 mr-2" /> Generator
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!currentProposal} className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              <FileText className="w-4 h-4 mr-2" /> Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              <History className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generator" className="flex-1 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="p-8 border-b bg-linear-to-br from-white to-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-black">Project Context</CardTitle>
                      <CardDescription className="text-base font-medium">
                        Provide the foundational details for your AI-generated proposal.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                      Powered by OpenClaw Engine
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form id="proposal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    {/* Client & Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="clientName" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-primary" /> Client Name
                        </Label>
                        <Input 
                          id="clientName" 
                          {...register('clientName')} 
                          placeholder="e.g. Acme Corporation" 
                          className="h-12 px-4 rounded-xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
                        />
                        {errors.clientName && <p className="text-xs font-bold text-destructive">{errors.clientName.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="projectTitle" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                          <Briefcase className="w-4 h-4 text-primary" /> Project Title
                        </Label>
                        <Input 
                          id="projectTitle" 
                          {...register('projectTitle')} 
                          placeholder="e.g. Digital Transformation Strategy" 
                          className="h-12 px-4 rounded-xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
                        />
                        {errors.projectTitle && <p className="text-xs font-bold text-destructive">{errors.projectTitle.message}</p>}
                      </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="budgetRange" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                          <DollarSign className="w-4 h-4 text-primary" /> Budget Range
                        </Label>
                        <Input 
                          id="budgetRange" 
                          {...register('budgetRange')} 
                          placeholder="e.g. $50k - $100k" 
                          className="h-12 px-4 rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="timeline" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-primary" /> Timeline
                        </Label>
                        <Input 
                          id="timeline" 
                          {...register('timeline')} 
                          placeholder="e.g. 6 months" 
                          className="h-12 px-4 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-black text-slate-900">Select Proposal Template</Label>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200">
                          {PROPOSAL_TEMPLATES.length} Designs Available
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {PROPOSAL_TEMPLATES.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => setValue('templateId', template.id)}
                            className={cn(
                              "group relative p-6 rounded-3xl border-2 transition-all cursor-pointer",
                              selectedTemplateId === template.id
                                ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg"
                            )}
                          >
                            {selectedTemplateId === template.id && (
                              <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                <div className="bg-primary text-white p-1.5 rounded-full shadow-lg shadow-primary/20">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                                  template.style === 'enterprise' ? "bg-slate-900 text-white" :
                                  template.style === 'creative' ? "bg-pink-500 text-white" :
                                  template.style === 'minimal' ? "bg-slate-100 text-slate-600" :
                                  "bg-primary text-white"
                                )}>
                                  {template.style === 'enterprise' ? <Layout className="w-6 h-6" /> :
                                   template.style === 'creative' ? <Palette className="w-6 h-6" /> :
                                   template.style === 'minimal' ? <FileText className="w-6 h-6" /> :
                                   <Wand2 className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-900">{template.name}</h3>
                                  <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0">
                                    {template.style}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {template.description}
                              </p>

                              <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <Sparkles className="w-3 h-3" /> Included Sections
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {template.sections.map((s) => (
                                    <Badge key={s} variant="outline" className="text-[9px] px-2 py-0.5 rounded-lg border-slate-100 bg-slate-50/50 text-slate-600 font-bold whitespace-nowrap">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Live Preview Available
                                </span>
                                {template.config?.includeRiskAssessment && (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] font-black uppercase">
                                    Risk Ready
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-black text-slate-900">Project Requirements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ id: crypto.randomUUID(), title: '', description: '', priority: 'medium' })}
                          className="h-9 rounded-lg font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Requirement
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {fields.map((field, index) => (
                          <div 
                            key={field.id} 
                            className="group relative p-6 bg-slate-50/50 rounded-2xl border border-slate-200/60 transition-all hover:bg-white hover:shadow-lg"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Delete requirement ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="space-y-4 pr-10">
                              <Input
                                {...register(`requirements.${index}.title` as const)}
                                placeholder="Feature or objective title"
                                className="h-10 border-none bg-transparent font-bold text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 px-0"
                              />
                              <Textarea
                                {...register(`requirements.${index}.description` as const)}
                                placeholder="Describe the specific need or outcome..."
                                className="min-h-[80px] border-none bg-transparent resize-none text-slate-600 placeholder:text-slate-400 focus-visible:ring-0 px-0"
                              />
                              {/* Priority selector */}
                              <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map((p) => {
                                  const current = watch(`requirements.${index}.priority`);
                                  return (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setValue(`requirements.${index}.priority`, p)}
                                      className={cn(
                                        'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                                        current === p
                                          ? p === 'high' ? 'bg-rose-100 text-rose-600'
                                            : p === 'medium' ? 'bg-amber-100 text-amber-600'
                                            : 'bg-slate-100 text-slate-500'
                                          : 'bg-transparent text-slate-300 hover:text-slate-500'
                                      )}
                                    >
                                      {p}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tone Selector */}
                    <div className="space-y-4">
                      <Label className="text-lg font-black text-slate-900">Writing Tone</Label>
                      <div className="flex gap-3">
                        {([
                          { value: 'formal', label: 'Formal', desc: 'Executive-ready' },
                          { value: 'casual', label: 'Casual', desc: 'Approachable' },
                          { value: 'technical', label: 'Technical', desc: 'Detail-focused' },
                        ] as const).map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setTone(t.value)}
                            className={cn(
                              'flex-1 p-4 rounded-2xl border-2 text-left transition-all',
                              tone === t.value
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-100 hover:border-slate-200'
                            )}
                          >
                            <p className="font-black text-sm text-slate-900">{t.label}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Section Builder */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-lg font-black text-slate-900">Custom Sections</Label>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Override template sections with your own</p>
                        </div>
                        {customSections.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCustomSections([])}
                            className="text-[10px] font-bold text-slate-400 hover:text-destructive uppercase tracking-widest"
                          >
                            Reset to template
                          </button>
                        )}
                      </div>
                      {customSections.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {customSections.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-xl">
                              <span className="text-xs font-bold text-primary">{s}</span>
                              <button
                                type="button"
                                onClick={() => setCustomSections(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-primary/50 hover:text-primary"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newSectionName.trim();
                              if (trimmed && !customSections.includes(trimmed)) {
                                setCustomSections(prev => [...prev, trimmed]);
                                setNewSectionName('');
                              }
                            }
                          }}
                          placeholder="e.g. Security Considerations"
                          className="h-10 rounded-xl border-slate-200 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-xl font-bold border-primary/20 text-primary"
                          aria-label="Add custom section"
                          onClick={() => {
                            const trimmed = newSectionName.trim();
                            if (trimmed && !customSections.includes(trimmed)) {
                              setCustomSections(prev => [...prev, trimmed]);
                              setNewSectionName('');
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="p-8 border-t bg-slate-50/30 flex justify-between items-center">
                  <Button type="button" variant="ghost" onClick={() => { resetForm(); try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }} className="font-bold text-slate-500 hover:text-slate-900">
                    Clear Form
                  </Button>
                  <Button 
                    type="submit" 
                    form="proposal-form" 
                    disabled={isGenerating}
                    className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all active:scale-95 min-w-[280px]"
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center">
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Generating...
                        </div>
                        {currentStep && (
                          <span className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest animate-pulse">
                            {currentStep}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        Generate Proposal <ChevronRight className="w-5 h-5 ml-2 opacity-50" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-primary text-white overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-black">AI Assistance</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6 text-primary-foreground/90 font-medium">
                  <p>Our engine will generate a comprehensive proposal including:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</div>
                      Executive Summary
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</div>
                      Strategic Scope of Work
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">3</div>
                      Implementation Timeline
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">4</div>
                      Budgetary Allocation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
                <h4 className="font-black text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> OpenClaw Pro Tip
                </h4>
                <p className="text-blue-700/80 text-sm font-medium leading-relaxed">
                  The OpenClaw agent works best with specific requirements! The more detail you provide, the more tailored and effective the generated proposal will be.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0 focus-visible:outline-none">
          {currentProposal && (
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="p-10 border-b bg-slate-50/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <Badge className={cn(
                      "border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1",
                      currentProposal.template?.style === 'enterprise' ? "bg-slate-900 text-white" : 
                      currentProposal.template?.style === 'creative' ? "bg-pink-500 text-white" :
                      currentProposal.template?.style === 'minimal' ? "bg-slate-200 text-slate-700" :
                      "bg-primary/10 text-primary"
                    )}>
                      {currentProposal.template?.name ?? 'Proposal'} v1.0
                    </Badge>
                    <CardTitle className={cn(
                      "text-4xl font-black text-slate-900",
                      currentProposal.template?.style === 'minimal' && "font-medium tracking-tight",
                      currentProposal.template?.style === 'creative' && "text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-violet-600"
                    )}>
                      {currentProposal.input.projectTitle}
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-slate-500">
                      Prepared exclusively for <span className="text-slate-900 font-bold">{currentProposal.input.clientName}</span>
                    </CardDescription>
                  </div>
                    <div className="flex gap-3">
                      {/* Presence avatars — live collaborators */}
                      {peers.length > 0 && (
                        <div className="flex items-center gap-1 px-3 h-12 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex -space-x-2 mr-2">
                            {peers.slice(0, 4).map((peer) => (
                              <div
                                key={peer.userId}
                                title={`${peer.name}${peer.sectionId ? ' — editing a section' : ' — viewing'}`}
                                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                style={{ backgroundColor: peer.color }}
                              >
                                {peer.name[0].toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            {peers.length} online
                          </span>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-100">
                            <ArrowRightLeft className="w-4 h-4 mr-2" /> 
                            {currentProposal.status.charAt(0).toUpperCase() + currentProposal.status.slice(1)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-slate-100">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1.5">
                            Update Status
                          </DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => updateStatus(currentProposal.id, 'draft')}
                            className={cn("rounded-xl cursor-pointer font-bold", currentProposal.status === 'draft' && "bg-primary/5 text-primary")}
                          >
                            <FileText className="w-4 h-4 mr-2" /> Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateStatus(currentProposal.id, 'finalized')}
                            className={cn("rounded-xl cursor-pointer font-bold", currentProposal.status === 'finalized' && "bg-emerald-50 text-emerald-600")}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Finalized
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateStatus(currentProposal.id, 'expired')}
                            className={cn("rounded-xl cursor-pointer font-bold", currentProposal.status === 'expired' && "bg-rose-50 text-rose-600")}
                          >
                            <Clock className="w-4 h-4 mr-2" /> Expired
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100 my-1" />
                          <DropdownMenuItem 
                            onClick={() => duplicateProposal(currentProposal.id)}
                            className="rounded-xl cursor-pointer font-bold text-slate-600"
                          >
                            <CopyPlus className="w-4 h-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-100">
                          <Users className="w-4 h-4 mr-2" /> Collaborators
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black">Collaboration</DialogTitle>
                          <DialogDescription>Invite team members to refine this proposal.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-bold">Invite by Email</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="colleague@example.com" 
                                value={collaboratorEmail}
                                onChange={(e) => setCollaboratorEmail(e.target.value)}
                                className="rounded-xl"
                              />
                              <Button 
                                onClick={handleInviteCollaborator} 
                                disabled={isInviting || !collaboratorEmail}
                                className="rounded-xl bg-primary"
                              >
                                {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                              </Button>
                            </div>
                            </div>                          <div className="space-y-3">
                            <Label className="text-sm font-bold">Active Collaborators</Label>
                            <div className="space-y-2">
                              {(currentProposal.collaborators?.length ?? 0) > 0 ? (
                                currentProposal.collaborators?.map(email => (
                                  <div key={email} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                      {email[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">{email}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic">No collaborators invited yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-100">
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black">Share Proposal</DialogTitle>
                          <DialogDescription>Generate a secure link to share with your client.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {!shareLink ? (
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">Sharing Options</Label>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    id="public-share"
                                    name="share-type"
                                    checked={isPublicShare}
                                    onChange={() => setIsPublicShare(true)}
                                    className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                                  />
                                  <Label htmlFor="public-share" className="text-sm text-slate-600 cursor-pointer">
                                    <span className="font-semibold">Public</span> - Anyone with the link can view
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    id="private-share"
                                    name="share-type"
                                    checked={!isPublicShare}
                                    onChange={() => setIsPublicShare(false)}
                                    className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                                  />
                                  <Label htmlFor="private-share" className="text-sm text-slate-600 cursor-pointer">
                                    <span className="font-semibold">Private</span> - Only you can access (requires login)
                                  </Label>
                                </div>
                              </div>
                              <Button 
                                onClick={handleShareProposal} 
                                disabled={isSharing}
                                className="w-full h-12 rounded-xl bg-primary font-bold shadow-lg"
                              >
                                {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                                Generate Share Link
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                                <code className="text-xs font-mono text-slate-500 truncate flex-1">{shareLink}</code>
                                <Button size="icon" variant="ghost" onClick={handleCopyLink} className="h-8 w-8 rounded-lg">
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-slate-400 text-center">
                                {isPublicShare 
                                  ? "Anyone with this link can view the proposal." 
                                  : "Only you can access this proposal (requires login)."}
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-100"
                      onClick={handleExportPDF}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export PDF
                    </Button>
                    <Button 
                      className={cn(
                        "h-12 px-6 rounded-xl font-bold text-white shadow-lg transition-all",
                        "bg-slate-900 hover:bg-slate-800"
                      )}
                      onClick={handleSendToClient}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send to Client
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  <div id="proposal-preview-content" className="bg-white">
                    {/* PDF Header - Only visible in PDF */}
                    <div className="pdf-only p-12 border-b-2 border-primary/10 flex justify-between items-center bg-slate-50/30">
                      <div className="space-y-1 text-left">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">GGH <span className="text-primary">Proposal AI</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Solutions</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
                        <p className="text-[8px] font-medium text-slate-400">Ref: {currentProposal.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "max-w-4xl mx-auto p-12 space-y-16",
                      currentProposal.template?.config?.layoutType === 'wide' && "max-w-6xl",
                      currentProposal.template?.config?.layoutType === 'split' && "grid grid-cols-1 md:grid-cols-12 gap-12"
                    )}>
                      {/* Document Title Section */}
                      <div className={cn(
                        "space-y-4 pb-8 border-b border-slate-100",
                        currentProposal.template?.config?.layoutType === 'split' && "md:col-span-12"
                      )}>
                        <Badge className={cn(
                          "bg-primary/5 text-primary border-none font-bold uppercase tracking-[0.2em] text-[10px] px-0",
                          currentProposal.template?.style === 'creative' && "text-pink-600 bg-pink-50"
                        )}>
                          Project Proposal
                        </Badge>
                        <h1 className={cn(
                          "text-5xl font-black text-slate-900 tracking-tight leading-[1.1]",
                          currentProposal.template?.style === 'creative' && "text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-violet-600",
                          currentProposal.template?.style === 'minimal' && "font-medium"
                        )}>
                          {currentProposal.input.projectTitle}
                        </h1>
                        <div className="flex flex-wrap gap-8 pt-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                            <p className="text-sm font-bold text-slate-900">{currentProposal.input.clientName}</p>
                          </div>
                          {currentProposal.input.timeline && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                              <p className="text-sm font-bold text-slate-900">{currentProposal.input.timeline}</p>
                            </div>
                          )}
                          {currentProposal.input.budgetRange && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                              <p className="text-sm font-bold text-slate-900">{currentProposal.input.budgetRange}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Sections */}
                      <div className={cn(
                        "space-y-16",
                        currentProposal.template?.config?.layoutType === 'split' && "md:col-span-8 space-y-12"
                      )}>
                        {currentProposal.sections.map((section) => {
                          const editingPeers = peers.filter(p => p.sectionId === section.id);
                          return (
                          <section key={section.id} className="group/section space-y-6 relative break-inside-avoid">
                            <div className="flex items-center gap-4">
                              {currentProposal.template?.style !== 'minimal' && <div className="h-px flex-1 bg-slate-100" />}
                              <h3 className={cn(
                                "text-xs font-black uppercase tracking-[0.2em]",
                                currentProposal.template?.style === 'enterprise' ? "text-slate-900 border-l-4 border-primary pl-3" : 
                                currentProposal.template?.style === 'creative' ? "text-pink-600" :
                                "text-primary"
                              )}>
                                {section.title}
                              </h3>
                              {/* Per-section presence indicators */}
                              {editingPeers.length > 0 && (
                                <div className="flex -space-x-1 pdf-hide">
                                  {editingPeers.map(peer => (
                                    <div
                                      key={peer.userId}
                                      title={`${peer.name} is editing`}
                                      className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white animate-pulse"
                                      style={{ backgroundColor: peer.color }}
                                    >
                                      {peer.name[0].toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {currentProposal.template?.style !== 'minimal' && <div className="h-px flex-1 bg-slate-100" />}
                              {editingSectionId !== section.id && (
                                <div className="flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity pdf-hide">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleStartEdit(section.id, section.content)}
                                    className="h-8 w-8 rounded-full"
                                    title="Edit section"
                                    aria-label={`Edit ${section.title} section`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRegenerateSection(section.id, section.title)}
                                    disabled={regeneratingSectionId === section.id}
                                    className="h-8 w-8 rounded-full"
                                    title="Regenerate with AI"
                                    aria-label={`Regenerate ${section.title} section with AI`}
                                  >
                                    {regeneratingSectionId === section.id
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      : <Sparkles className="w-3.5 h-3.5" />
                                    }
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {editingSectionId === section.id ? (
                              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 pdf-hide">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => handleEditContentChange(e.target.value)}
                                  className="min-h-[200px] text-lg font-medium leading-relaxed rounded-2xl border-primary/20 focus:ring-primary/10"
                                />
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {isDirty ? (
                                        <span className="text-amber-500 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                                          Unsaved changes
                                        </span>
                                      ) : (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                          Saved
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-300 font-bold">
                                      {editContent.length} chars · {editContent.trim() ? editContent.trim().split(/\s+/).length : 0} words
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="rounded-lg font-bold">
                                      <X className="w-4 h-4 mr-2" /> Cancel <span className="ml-1 text-[10px] opacity-50">Esc</span>
                                    </Button>
                                    <Button size="sm" onClick={handleSaveEdit} className="rounded-lg font-bold bg-primary text-white">
                                      <Save className="w-4 h-4 mr-2" /> Save <span className="ml-1 text-[10px] opacity-70">⌘S</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="prose prose-slate max-w-none">
                                <div className={cn(
                                  "text-slate-700 leading-relaxed text-lg font-medium whitespace-pre-wrap",
                                  currentProposal.template?.style === 'minimal' && "text-slate-600 font-normal"
                                )}>
                                  {section.content}
                                </div>
                              </div>
                            )}
                          </section>
                        );
                        })}
                      </div>

                      {/* Split Layout Sidebar (Only if split) */}
                      {currentProposal.template?.config?.layoutType === 'split' && (
                        <div className="md:col-span-4 space-y-8">
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 sticky top-8">
                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Project Metadata</h4>
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Version</p>
                                <p className="text-sm font-bold text-slate-900">1.0.0-OpenClaw</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Strategy</p>
                                <Badge className="bg-primary text-white text-[9px] font-bold">{currentProposal.template?.name}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PDF Footer - Only visible in PDF */}
                       <div className="pdf-only pt-16 border-t border-slate-100 flex justify-between items-end">
                         <div className="space-y-2 text-left">
                           <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Signature</p>
                           <div className="h-12 w-48 border-b border-slate-200" />
                           <p className="text-[8px] font-medium text-slate-400 italic">GGH Software Development Services</p>
                         </div>
                         <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em]">Confidential</p>
                       </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-8 border-t bg-slate-50/30 flex justify-center">
                <p className="text-sm text-slate-400 font-bold">
                  Generated by GGH Proposal AI &bull; {new Date(currentProposal.generatedAt).toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 focus-visible:outline-none">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-2xl font-black">Generation History</CardTitle>
                  <CardDescription className="text-base font-medium">Review and manage your previously generated proposals.</CardDescription>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="rounded-xl font-bold h-10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedIds.size}
                    </Button>
                  )}
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search proposals..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10 px-4 rounded-xl font-bold border-slate-200">
                        <Filter className="w-4 h-4 mr-2" /> 
                        {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-xl border-slate-100">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')} className="rounded-lg cursor-pointer font-bold">All</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('draft')} className="rounded-lg cursor-pointer font-bold">Draft</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('finalized')} className="rounded-lg cursor-pointer font-bold">Finalized</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('expired')} className="rounded-lg cursor-pointer font-bold">Expired</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {historyLoading ? (
                <HistorySkeleton />
              ) : (
              <ScrollArea className="h-[50vh]">
                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                      <History className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="font-bold text-lg">
                      {searchQuery ? 'No matching proposals found.' : 'No proposals generated yet.'}
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        if (history.length === 0) setActiveTab('generator');
                      }}
                      className="text-primary font-bold mt-2"
                    >
                      {searchQuery ? 'Clear search' : 'Start your first one'}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredHistory.map((proposal) => (
                      <Card 
                        key={proposal.id} 
                        className={cn(
                          "group border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer rounded-3xl overflow-hidden bg-white",
                          selectedIds.has(proposal.id) ? "border-primary/40 shadow-md shadow-primary/10" : "border-slate-100"
                        )}
                        onClick={() => {
                          if (selectedIds.size > 0) {
                            toggleSelect(proposal.id);
                          } else {
                            setProposal(proposal);
                            setActiveTab('preview');
                          }
                        }}
                      >
                        <CardHeader className="p-6 border-b bg-slate-50/30 group-hover:bg-primary/5 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(proposal.id); }}
                                className={cn(
                                  "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                  selectedIds.has(proposal.id)
                                    ? "bg-primary border-primary text-white"
                                    : "border-slate-300 opacity-0 group-hover:opacity-100"
                                )}
                                aria-label="Select proposal"
                              >
                                {selectedIds.has(proposal.id) && (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </button>
                              <div className="space-y-1">
                                <CardTitle className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                  {proposal.input.projectTitle}
                                </CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  {proposal.input.clientName}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-xl border-slate-100">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateProposal(proposal.id);
                                    }}
                                    className="rounded-lg cursor-pointer font-bold"
                                  >
                                    <CopyPlus className="w-4 h-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteHistory(e, proposal.id);
                                    }}
                                    className="rounded-lg cursor-pointer font-bold text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0">
                              {proposal.template?.name ?? 'Proposal'}
                            </Badge>
                            <Badge className={cn(
                              "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none",
                              proposal.status === 'finalized' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {proposal.status || 'draft'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-black text-slate-600">{proposal.stats?.viewCount || 0} Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-black text-slate-600">{proposal.stats?.exportCount || 0} Exports</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 border-t bg-slate-50/10 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(proposal.generatedAt).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="flex-1 m-0 focus-visible:outline-none">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}
