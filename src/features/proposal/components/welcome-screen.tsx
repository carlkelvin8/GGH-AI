'use client';

import { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onGetStarted, onSkip }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Wand2 className="w-8 h-8 text-primary" />,
      title: "AI-Powered Generation",
      description: "Our advanced OpenClaw engine analyzes your requirements and generates professional proposals in seconds.",
      features: ["Smart content generation", "Industry best practices", "Professional formatting"]
    },
    {
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      title: "Multiple Templates",
      description: "Choose from enterprise-grade templates designed for different industries and project types.",
      features: ["Modern designs", "Customizable sections", "Brand consistency"]
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Collaboration Ready",
      description: "Share proposals, invite collaborators, and track engagement with built-in analytics.",
      features: ["Real-time collaboration", "Share links", "View analytics"]
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="min-h-[600px] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-bold">Welcome to AI Proposal Engine</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Create Winning Proposals in Minutes
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform your project ideas into professional, compelling proposals with the power of AI
          </p>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Current Step Detail */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentStep ? 'bg-primary' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500 font-medium">
                      {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {currentStepData.description}
              </p>
              
              <div className="space-y-3">
                {currentStepData.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-8">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={onGetStarted}
                    className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  >
                    Get Started
                    <Wand2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats & Benefits */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-amber-500" />
                  <h4 className="text-lg font-bold text-slate-900">Lightning Fast</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary">2.3s</div>
                    <div className="text-xs text-slate-500 font-medium">Average Generation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-600">98%</div>
                    <div className="text-xs text-slate-500 font-medium">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500/5 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-emerald-500" />
                  <h4 className="text-lg font-bold text-slate-900">Enterprise Grade</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>End-to-end Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>GDPR Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  <h4 className="text-lg font-bold text-slate-900">Smart Analytics</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Track proposal performance, client engagement, and conversion rates with built-in analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        </div>
      </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 border-t bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-slate-500 hover:text-slate-700"
          >
            Skip Introduction
          </Button>
          <div className="w-px h-6 bg-slate-200" />
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </div>
      </div>
    </div>
  );
}