'use client';

import { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  ExternalLink, 
  Clock, 
  DollarSign,
  Users,
  Sparkles,
  ChevronRight,
  Building,
  Code,
  Smartphone,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/shared/components/ui/dialog';

interface ExampleProposal {
  id: string;
  title: string;
  client: string;
  industry: string;
  type: string;
  budget: string;
  timeline: string;
  description: string;
  features: string[];
  sections: string[];
  template: string;
  icon: React.ReactNode;
  color: string;
  preview: {
    executive_summary: string;
    scope: string;
    timeline_detail: string;
  };
}

const exampleProposals: ExampleProposal[] = [
  {
    id: 'web-app',
    title: 'E-Commerce Platform Redesign',
    client: 'RetailMax Corporation',
    industry: 'Retail',
    type: 'Web Development',
    budget: '$75,000 - $120,000',
    timeline: '4 months',
    description: 'Complete redesign and development of a modern e-commerce platform with advanced analytics and mobile optimization.',
    features: ['Responsive Design', 'Payment Integration', 'Analytics Dashboard', 'Mobile App', 'Admin Panel'],
    sections: ['Executive Summary', 'Project Scope', 'Technical Approach', 'Timeline & Milestones', 'Investment & ROI'],
    template: 'Modern GGH',
    icon: <Building className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    preview: {
      executive_summary: 'RetailMax Corporation seeks to modernize their e-commerce presence with a cutting-edge platform that drives conversion and enhances user experience. Our proposed solution leverages modern web technologies to create a scalable, high-performance platform that will position RetailMax as an industry leader.',
      scope: 'Complete platform redesign including frontend user interface, backend API development, payment gateway integration, analytics implementation, and mobile application development. The project encompasses user experience optimization, performance enhancement, and comprehensive testing.',
      timeline_detail: 'Phase 1: Discovery & Design (4 weeks), Phase 2: Core Development (8 weeks), Phase 3: Integration & Testing (4 weeks), Phase 4: Launch & Optimization (2 weeks)'
    }
  },
  {
    id: 'mobile-app',
    title: 'Healthcare Mobile Application',
    client: 'MedTech Solutions',
    industry: 'Healthcare',
    type: 'Mobile Development',
    budget: '$95,000 - $150,000',
    timeline: '5 months',
    description: 'HIPAA-compliant mobile application for patient management and telemedicine with real-time communication features.',
    features: ['HIPAA Compliance', 'Video Calling', 'Patient Records', 'Appointment Scheduling', 'Secure Messaging'],
    sections: ['Executive Summary', 'Compliance Framework', 'Technical Architecture', 'Security Measures', 'Implementation Plan'],
    template: 'Enterprise Executive',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-500',
    preview: {
      executive_summary: 'MedTech Solutions requires a comprehensive mobile healthcare platform that ensures patient data security while providing seamless telemedicine capabilities. Our solution combines cutting-edge mobile technology with stringent healthcare compliance standards.',
      scope: 'Development of iOS and Android applications with telemedicine features, patient portal, secure messaging system, appointment management, and integration with existing healthcare systems. Full HIPAA compliance and security audit included.',
      timeline_detail: 'Phase 1: Compliance & Architecture (3 weeks), Phase 2: Core App Development (12 weeks), Phase 3: Security Implementation (4 weeks), Phase 4: Testing & Certification (3 weeks)'
    }
  },
  {
    id: 'ai-integration',
    title: 'AI-Powered Analytics Platform',
    client: 'DataFlow Enterprises',
    industry: 'Technology',
    type: 'AI/ML Integration',
    budget: '$120,000 - $200,000',
    timeline: '6 months',
    description: 'Enterprise-grade analytics platform with machine learning capabilities for predictive insights and automated reporting.',
    features: ['Machine Learning', 'Predictive Analytics', 'Real-time Dashboards', 'API Integration', 'Custom Reports'],
    sections: ['Executive Summary', 'AI Strategy', 'Technical Implementation', 'Data Architecture', 'Success Metrics'],
    template: 'Creative Partner',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    preview: {
      executive_summary: 'DataFlow Enterprises seeks to harness the power of artificial intelligence to transform their data analytics capabilities. Our proposed AI-powered platform will provide predictive insights, automated reporting, and intelligent data visualization to drive strategic decision-making.',
      scope: 'Development of machine learning models, real-time analytics dashboard, automated reporting system, API integrations, and comprehensive data pipeline. Includes model training, deployment infrastructure, and ongoing optimization.',
      timeline_detail: 'Phase 1: Data Analysis & Model Design (4 weeks), Phase 2: ML Development (12 weeks), Phase 3: Platform Integration (6 weeks), Phase 4: Testing & Optimization (4 weeks)'
    }
  },
  {
    id: 'security-audit',
    title: 'Cybersecurity Assessment & Implementation',
    client: 'SecureBank Financial',
    industry: 'Finance',
    type: 'Security Consulting',
    budget: '$60,000 - $100,000',
    timeline: '3 months',
    description: 'Comprehensive security audit and implementation of advanced cybersecurity measures for financial institution.',
    features: ['Security Audit', 'Penetration Testing', 'Compliance Review', 'Staff Training', 'Incident Response'],
    sections: ['Executive Summary', 'Current State Assessment', 'Risk Analysis', 'Implementation Roadmap', 'Compliance Framework'],
    template: 'Minimalist Clean',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
    preview: {
      executive_summary: 'SecureBank Financial requires a comprehensive cybersecurity overhaul to meet evolving regulatory requirements and protect against sophisticated threats. Our security assessment and implementation plan will establish industry-leading protection measures.',
      scope: 'Complete security audit, vulnerability assessment, penetration testing, security policy development, staff training programs, and implementation of advanced security technologies. Includes ongoing monitoring and incident response planning.',
      timeline_detail: 'Phase 1: Security Assessment (4 weeks), Phase 2: Vulnerability Remediation (6 weeks), Phase 3: Policy Implementation (2 weeks), Phase 4: Training & Documentation (2 weeks)'
    }
  }
];

interface ExamplesModalProps {
  children: React.ReactNode;
  onTryGenerator?: () => void;
  onUseTemplate?: (templateData: any) => void;
}

export function ExamplesModal({ children, onTryGenerator, onUseTemplate }: ExamplesModalProps) {
  const [selectedProposal, setSelectedProposal] = useState<ExampleProposal | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="flex flex-col h-full bg-gradient-to-br from-white via-slate-50/30 to-white">
          <DialogHeader className="p-8 border-b bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-slate-900">
                  Proposal Examples
                </DialogTitle>
                <p className="text-slate-600 mt-1">
                  Explore real-world examples of AI-generated proposals across different industries
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-600">4 Industry Examples</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-600">Generated in 2-3 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-600">Enterprise Quality</span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {!selectedProposal ? (
              // Examples Grid
              <ScrollArea className="h-full p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {exampleProposals.map((proposal) => (
                    <Card 
                      key={proposal.id} 
                      className="group cursor-pointer border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${proposal.color}`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-r ${proposal.color} text-white rounded-lg`}>
                              {proposal.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {proposal.title}
                              </CardTitle>
                              <p className="text-slate-600 text-sm">{proposal.client}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {proposal.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {proposal.industry}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {proposal.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {proposal.template}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-700">{proposal.budget}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-slate-700">{proposal.timeline}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-slate-500">
                            {proposal.sections.length} sections • {proposal.features.length} features
                          </span>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              // Detailed View
              <div className="flex h-full">
                <div className="w-1/3 border-r bg-slate-50/50 p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedProposal(null)}
                    className="mb-6"
                  >
                    ← Back to Examples
                  </Button>
                  
                  {onUseTemplate && (
                    <DialogClose asChild>
                      <Button 
                        className="w-full mb-4"
                        onClick={() => onUseTemplate({
                          clientName: selectedProposal.client,
                          projectTitle: selectedProposal.title,
                          budgetRange: selectedProposal.budget,
                          timeline: selectedProposal.timeline,
                          requirements: [
                            {
                              id: crypto.randomUUID(),
                              title: selectedProposal.features[0] || 'Main Feature',
                              description: selectedProposal.description,
                              priority: 'high' as const
                            }
                          ]
                        })}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Use This Template
                      </Button>
                    </DialogClose>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <div className={`p-3 bg-gradient-to-r ${selectedProposal.color} text-white rounded-lg w-fit mb-3`}>
                        {selectedProposal.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {selectedProposal.title}
                      </h3>
                      <p className="text-slate-600">{selectedProposal.client}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Project Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Industry:</span>
                            <span className="text-sm font-medium">{selectedProposal.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Type:</span>
                            <span className="text-sm font-medium">{selectedProposal.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Budget:</span>
                            <span className="text-sm font-medium">{selectedProposal.budget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Timeline:</span>
                            <span className="text-sm font-medium">{selectedProposal.timeline}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Key Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedProposal.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Proposal Sections</h4>
                        <div className="space-y-1">
                          {selectedProposal.sections.map((section, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span className="text-sm text-slate-600">{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  <Tabs defaultValue="preview" className="h-full flex flex-col">
                    <TabsList className="w-fit mb-6">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="sections">All Sections</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="flex-1 m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-8 pr-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Executive Summary</h4>
                            <p className="text-slate-700 leading-relaxed">
                              {selectedProposal.preview.executive_summary}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Project Scope</h4>
                            <p className="text-slate-700 leading-relaxed">
                              {selectedProposal.preview.scope}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Timeline & Approach</h4>
                            <p className="text-slate-700 leading-relaxed">
                              {selectedProposal.preview.timeline_detail}
                            </p>
                          </div>
                          
                          <div className="bg-slate-50 rounded-lg p-6 border">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-slate-900">AI Generation Note</h4>
                            </div>
                            <p className="text-sm text-slate-600">
                              This proposal was generated using our OpenClaw AI engine in approximately 2.3 seconds. 
                              The content is tailored to the specific client requirements and industry best practices.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="sections" className="flex-1 m-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                          {selectedProposal.sections.map((section, i) => (
                            <Card key={i} className="border border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-slate-900">{section}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    Section {i + 1}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                  This section would contain detailed content about {section.toLowerCase()}, 
                                  tailored specifically for {selectedProposal.client} and their {selectedProposal.type.toLowerCase()} needs.
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t bg-white/90 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>✨ Generated with OpenClaw AI</span>
                <span>•</span>
                <span>🚀 Enterprise Quality</span>
                <span>•</span>
                <span>⚡ 2-3 Second Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
                <DialogClose asChild>
                  <Button size="sm" onClick={onTryGenerator}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Generator
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}