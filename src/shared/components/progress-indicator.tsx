'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '@/shared/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: string;
  progress?: number;
  className?: string;
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  progress,
  className 
}: ProgressIndicatorProps) {
  const currentIndex = currentStep ? steps.findIndex(s => s.id === currentStep) : -1;
  const calculatedProgress = progress ?? (currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            {currentStep ? steps.find(s => s.id === currentStep)?.label : 'Starting...'}
          </span>
          <span className="text-gray-500">
            {Math.round(calculatedProgress)}%
          </span>
        </div>
        <Progress value={calculatedProgress} className="h-2" />
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.status === 'completed' || index < currentIndex;
          const hasError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 text-sm transition-colors',
                isActive && 'text-blue-600 font-medium',
                isCompleted && !hasError && 'text-green-600',
                hasError && 'text-red-600',
                !isActive && !isCompleted && !hasError && 'text-gray-500'
              )}
            >
              <div className="flex-shrink-0">
                {hasError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={cn(
                'transition-opacity',
                !isActive && !isCompleted && 'opacity-60'
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple loading indicator with message
 */
interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingIndicator({ 
  message = 'Loading...', 
  size = 'md',
  className 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
}

/**
 * Hook for managing multi-step progress
 */
export function useProgressSteps(initialSteps: Omit<ProgressStep, 'status'>[]) {
  const [steps, setSteps] = useState<ProgressStep[]>(
    initialSteps.map(step => ({ ...step, status: 'pending' as const }))
  );
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const startStep = (stepId: string) => {
    setCurrentStep(stepId);
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === stepId ? 'active' : step.status
    })));
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === stepId ? 'completed' : step.status
    })));
  };

  const errorStep = (stepId: string) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === stepId ? 'error' : step.status
    })));
  };

  const reset = () => {
    setCurrentStep(null);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  return {
    steps,
    currentStep,
    startStep,
    completeStep,
    errorStep,
    reset,
  };
}