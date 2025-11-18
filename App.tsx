
import React, { useState } from 'react';
import { Stepper } from './components/Stepper';
import { Step1_MarketAnalysis } from './components/Step1_MarketAnalysis';
import { Step2_IdeaGeneration } from './components/Step2_IdeaGeneration';
import { Step3_ContentWriting } from './components/Step3_ContentWriting';
import { Step4_VisualGeneration } from './components/Step4_VisualGeneration';
import { Step5_VoiceGeneration } from './components/Step5_VoiceGeneration';
import { Step6_Publish } from './components/Step6_Publish';
import { STEPS } from './constants';
import type { AppState, ContentIdea } from './types';
import { AppStatus } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [appState, setAppState] = useState<AppState>({
    status: AppStatus.IDLE,
    industry: '',
    marketAnalysis: '',
    contentIdeas: [],
    selectedIdea: null,
    writtenContent: '',
    generatedImage: null,
    generatedAudio: null,
    publishDescription: '',
    error: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setAppState(prevState => ({ ...prevState, ...updates }));
  };
  
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(1);
    setAppState({
      status: AppStatus.IDLE,
      industry: '',
      marketAnalysis: '',
      contentIdeas: [],
      selectedIdea: null,
      writtenContent: '',
      generatedImage: null,
      generatedAudio: null,
      publishDescription: '',
      error: null,
    });
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_MarketAnalysis appState={appState} updateState={updateState} onNext={handleNext} />;
      case 2:
        return <Step2_IdeaGeneration appState={appState} updateState={updateState} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3_ContentWriting appState={appState} updateState={updateState} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4_VisualGeneration appState={appState} updateState={updateState} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step5_VoiceGeneration appState={appState} updateState={updateState} onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <Step6_Publish appState={appState} updateState={updateState} onBack={handleBack} onRestart={restart} />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          Saudi Content AI Studio
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Your end-to-end content creation partner for the Saudi market.
        </p>
      </header>
      
      <div className="w-full max-w-4xl mx-auto">
        <Stepper currentStep={currentStep} steps={STEPS.map(s => s.name)} />
        <main className="mt-8 bg-slate-800/50 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-700">
          {renderStepContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
