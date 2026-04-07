'use client';

import { useEffect, useState } from 'react';
import { Terminal, Shield, Zap, Wand2, ArrowRight, Sparkles } from 'lucide-react';
import { ProposalGenerator } from '@/features/proposal/components/proposal-generator';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

/**
 * Feature Card component for the landing page.
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-3 bg-slate-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="relative text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="relative text-slate-600 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}

/**
 * HomePage component for the landing page.
 * Displays the main value proposition and entry points.
 */
export function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container relative mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-slate-200/50 text-sm font-semibold text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Proposal Excellence</span>
          </div>

          {/* Hero Section */}
          <header className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
              GGH <span className="text-gradient">Proposal AI</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
              Transform your project vision into winning proposals. 
              Our <span className="text-primary font-bold">OpenClaw-powered</span> engine crafts 
              enterprise-grade documents in minutes.
            </p>
          </header>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="2xl"
                  className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Wand2 className="w-6 h-6 mr-3" /> 
                  Generate Your Next Proposal
                  <ArrowRight className="w-5 h-5 ml-3 opacity-50" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[95vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="flex flex-col h-full bg-white">
                  <DialogHeader className="p-8 border-b bg-slate-50/50 backdrop-blur-sm">
                    <DialogTitle className="text-3xl font-black text-slate-900">AI Proposal Engine</DialogTitle>
                    <DialogDescription className="text-lg text-slate-500">
                      Craft high-impact project proposals tailored to your client's unique vision.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <ProposalGenerator />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="link" className="text-slate-500 font-bold text-lg hover:text-primary transition-colors">
              See Examples
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-16 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <FeatureCard
              icon={<Terminal className="w-8 h-8 text-primary" />}
              title="OpenClaw Agentic Flow"
              description="Our high-fidelity OpenClaw agent deeply analyzes requirements to craft compelling executive summaries."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-emerald-500" />}
              title="Enterprise Quality"
              description="Every word is tuned to meet the highest industry standards for technical precision and professional impact."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Rapid Iteration"
              description="Regenerate sections, track your history, and refine your approach with zero friction. Proposals built for speed."
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-slate-200/60 text-center space-y-4">
          <div className="flex justify-center gap-8 text-slate-400 font-bold text-sm">
            <span>Next.js 14+</span>
            <span>TypeScript</span>
            <span>TanStack Query</span>
            <span>Zustand</span>
          </div>
          <p className="text-slate-400 font-medium italic">
            &copy; {new Date().getFullYear()} GGH Software Development Services &mdash; Proposals that win.
          </p>
        </footer>
      </div>
    </main>
  );
}
