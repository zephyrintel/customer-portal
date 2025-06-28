import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight, X } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
}

interface OnboardingCardProps {
  steps: OnboardingStep[];
  onDismiss: () => void;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({ steps, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  if (!isExpanded) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{completedSteps}/{totalSteps}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Setup Progress</h3>
              <p className="text-xs text-gray-600">{completedSteps} of {totalSteps} steps completed</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Welcome to AcmePump Solutions</h3>
          <p className="text-sm text-gray-600">Complete these steps to get the most out of your equipment portal</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 transform rotate-90" />
          </button>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Setup Progress</span>
          <span>{completedSteps}/{totalSteps} completed</span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
              step.completed ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                step.completed ? 'text-green-900' : 'text-gray-900'
              }`}>
                {step.title}
              </h4>
              <p className={`text-xs ${
                step.completed ? 'text-green-700' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
            </div>
            
            {!step.completed && (
              <button
                onClick={step.action}
                className="flex-shrink-0 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
              >
                Start
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingCard;