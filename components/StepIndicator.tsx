
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ["Фото", "Студия", "Образы", "Генерация"];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-lg">
      {steps.map((step, stepIdx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center text-center">
            <p className={`text-sm font-bold transition-colors duration-500 ${currentStep > stepIdx ? 'text-indigo-400' : 'text-gray-500'}`}>
              0{stepIdx + 1}
            </p>
            <p className={`mt-1 text-xs uppercase tracking-wider transition-colors duration-500 ${currentStep > stepIdx ? 'text-white' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
          {stepIdx < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-500 mx-4 ${currentStep > stepIdx + 1 ? 'border-indigo-500' : 'border-gray-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;