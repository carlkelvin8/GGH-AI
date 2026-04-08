'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Sparkles,
  User,
  Briefcase,
  FileText,
  Wand2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { FormField } from '@/shared/components/form-field';
import { Badge } from '@/shared/components/ui/badge';

interface SmartFormWizardProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
  tips: string[];
}

export function SmartFormWizard({ onComplete, onBack }: SmartFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    clientName: '',
    projectTitle: '',
    budgetRange: '',
    timeline: '',
    industry: '',
    projectType: '',
    requirements: [{ title: '', description: '', priority: 'medium' }]
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: WizardStep[] = [
    {
      id: 'client-info',
      title: 'Client Information',
      description: 'Tell us about your client and project basics',
      icon: <User className="w-5 h-5" />,
      fields: ['clientName', 'projectTitle'],
      tips: [
        'Use the client\'s official company name',
        'Make the project title specific and compelling',
        'Consider including the main benefit or outcome'
      ]
    },
    {
      id: 'project-scope',
      title: 'Project Scope',
      description: 'Define the project parameters and constraints',
      icon: <Briefcase className="w-5 h-5" />,
      fields: ['budgetRange', 'timeline', 'industry', 'projectType'],
      tips: [
        'Budget ranges help set realistic expectations',
        'Be specific with timelines (e.g., "3 months" vs "Q1")',
        'Industry context helps tailor the proposal tone'
      ]
    },
    {
      id: 'requirements',
      title: 'Requirements',
      description: 'Detail the specific needs and objectives',
      icon: <FileText className="w-5 h-5" />,
      fields: ['requirements'],
      tips: [
        'Start with the most critical requirements',
        'Use action-oriented language',
        'Include measurable outcomes when possible'
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Validate current step
  const isStepValid = () => {
    const step = steps[currentStep];
    return step.fields.every(field => {
      if (field === 'requirements') {
        return formData.requirements.some(req => req.title.trim() && req.description.trim());
      }
      return formData[field as keyof typeof formData]?.toString().trim();
    });
  };

  // Update completed steps
  useEffect(() => {
    if (isStepValid()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentStep);
        return newSet;
      });
    }
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { title: '', description: '', priority: 'medium' }]
    }));
  };

  const updateRequirement = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Your Proposal</h2>
            <p className="text-slate-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-500 mb-1">Progress</div>
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-primary text-white' 
                  : completedSteps.has(index)
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {completedSteps.has(index) && index !== currentStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  step.icon
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {currentStepData.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                  <p className="text-slate-600 text-sm mt-1">{currentStepData.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Client Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <FormField
                    label="Client Name"
                    name="clientName"
                    value={formData.clientName}
                    onChange={(value) => updateFormData('clientName', value)}
                    placeholder="e.g., Acme Corporation"
                    required
                    hint="Use the official company name as it appears in contracts"
                  />
                  <FormField
                    label="Project Title"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={(value) => updateFormData('projectTitle', value)}
                    placeholder="e.g., Digital Transformation Initiative"
                    required
                    hint="Make it specific and outcome-focused"
                  />
                </div>
              )}

              {/* Step 2: Project Scope */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Budget Range"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={(value) => updateFormData('budgetRange', value)}
                      placeholder="e.g., $50k - $100k"
                      hint="Helps set realistic expectations"
                    />
                    <FormField
                      label="Timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={(value) => updateFormData('timeline', value)}
                      placeholder="e.g., 3 months"
                      hint="Be specific about duration"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Industry</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select industry...</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Project Type</label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => updateFormData('projectType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select type...</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-app">Mobile App</option>
                        <option value="software-integration">Software Integration</option>
                        <option value="consulting">Consulting</option>
                        <option value="maintenance">Maintenance & Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Project Requirements</h3>
                      <p className="text-sm text-slate-600">Define what needs to be accomplished</p>
                    </div>
                    <Button onClick={addRequirement} variant="outline" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Add Requirement
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.requirements.map((req, index) => (
                      <Card key={index} className="border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium text-slate-900">Requirement {index + 1}</h4>
                            {formData.requirements.length > 1 && (
                              <Button
                                onClick={() => removeRequirement(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <FormField
                              label="Title"
                              name={`requirement-title-${index}`}
                              value={req.title}
                              onChange={(value) => updateRequirement(index, 'title', value)}
                              placeholder="e.g., User Authentication System"
                              required
                            />
                            <FormField
                              label="Description"
                              name={`requirement-description-${index}`}
                              type="textarea"
                              value={req.description}
                              onChange={(value) => updateRequirement(index, 'description', value)}
                              placeholder="Describe the specific need and expected outcome..."
                              required
                              minLength={10}
                            />
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Priority</label>
                              <div className="flex gap-2">
                                {['low', 'medium', 'high'].map((priority) => (
                                  <button
                                    key={priority}
                                    type="button"
                                    onClick={() => updateRequirement(index, 'priority', priority)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      req.priority === priority
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Tips and Progress */}
        <div className="space-y-6">
          {/* Tips Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Pro Tips</h3>
              </div>
              <div className="space-y-3">
                {currentStepData.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {isStepValid() ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="font-semibold text-slate-900">Step Status</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                {isStepValid() 
                  ? "All required fields completed! Ready to continue."
                  : "Please complete all required fields to proceed."
                }
              </p>
              <div className="space-y-2">
                {currentStepData.fields.map((field) => {
                  const isFieldValid = field === 'requirements' 
                    ? formData.requirements.some(req => req.title.trim() && req.description.trim())
                    : formData[field as keyof typeof formData]?.toString().trim();
                  
                  return (
                    <div key={field} className="flex items-center gap-2">
                      {isFieldValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                      <span className="text-sm text-slate-600 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Back to Welcome' : 'Previous'}
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {completedSteps.size} of {steps.length} steps completed
          </span>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Proposal
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}