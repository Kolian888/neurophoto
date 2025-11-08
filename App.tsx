import React, { useState, useCallback } from 'react';
import type { ShotType, StudioSelection, LookSelection, FinalOutput, Scenario, CameraAngle, StyleLevel } from './types';
import StepIndicator from './components/StepIndicator';
import Step1UploadPhoto from './components/Step1UploadPhoto';
import Step2SelectStudio from './components/Step2SelectStudio';
import Step3SelectLooks from './components/Step3SelectLooks';
import Step4Generate from './components/Step4Generate';
import Scenarios from './components/Scenarios';
import { ChevronLeftIcon, ChevronRightIcon } from './components/Icons';
import { generatePhotoshootImage } from './services/geminiService';
import { LOOK_PRESETS, STUDIO_PRESETS } from './constants';

type AppView = 'scenarios' | 'wizard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('scenarios');
  const [currentStep, setCurrentStep] = useState(1);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [shotType, setShotType] = useState<ShotType | null>(null);
  const [studioSelection, setStudioSelection] = useState<StudioSelection | null>(null);
  const [lookSelections, setLookSelections] = useState<LookSelection[]>([]);
  const [poseSelections, setPoseSelections] = useState<string[]>([]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = async (file: File) => {
    const base64 = await fileToBase64(file);
    setUserPhoto(base64);
  };
  
  const resetState = () => {
    setCurrentStep(1);
    setUserPhoto(null);
    setShotType(null);
    setStudioSelection(null);
    setLookSelections([]);
    setPoseSelections([]);
  };

  const startNewSession = () => {
    resetState();
    setCurrentView('scenarios');
  };
  
  const handleSelectScenario = (scenario: Scenario) => {
    resetState();
    setStudioSelection(scenario.studioSelection);
    setLookSelections(scenario.lookSelections);
    setCurrentView('wizard');
    setCurrentStep(1);
  };

  const handleStartFromScratch = () => {
    resetState();
    setCurrentView('wizard');
  };

  const handleGenerate = useCallback(async (
    cameraAngle: CameraAngle,
    styleLevel: StyleLevel,
    onProgress: (generatedCount: number) => void
  ): Promise<FinalOutput> => {
    if (!userPhoto || !studioSelection || lookSelections.length === 0 || poseSelections.length === 0) {
      throw new Error("Missing required selections");
    }
    
    const diversity = {
      lenses: [35, 50, 85],
      shot_types: ["portrait", "half", "full"] as ShotType[],
      light: ["softbox", "rim", "butterfly", "split"]
    };

    const generatedImages: FinalOutput['images'] = [];

    for (let i = 0; i < 5; i++) {
        const look = lookSelections[i % lookSelections.length];
        const lens = diversity.lenses[i % diversity.lenses.length];
        const shot_type = diversity.shot_types[i % diversity.shot_types.length];
        const light_setup = diversity.light[i % diversity.light.length];
        const pose = poseSelections[i % poseSelections.length];

        let studioPrompt: string;
        if (studioSelection.source === 'preset') {
            const preset = STUDIO_PRESETS.find(p => p.id === studioSelection.value);
            studioPrompt = `A studio with this background: ${preset?.name}, ${preset?.description}.`;
        } else if (studioSelection.source === 'generate') {
            studioPrompt = `A studio with this background: ${studioSelection.value}.`;
        } else {
            studioPrompt = `A studio that looks like the one from the reference image.`;
        }

        let lookPrompt: string;
        if (look.source === 'preset') {
            const preset = LOOK_PRESETS.find(p => p.id === look.value);
            lookPrompt = `${preset?.name}, ${preset?.description}.`;
        } else if (look.source === 'generate') {
            lookPrompt = `${look.value}.`;
        } else {
            lookPrompt = `An outfit similar to the one in the reference image.`;
        }
        
        const fullPrompt = `Task: Generate a high-quality, photorealistic professional photoshoot image.
**Primary Objective**: Faithfully transfer the exact face and identity of the person from the input image onto a new body and scene. The person's face, including all features, expression, and structure, **MUST** remain identical to the source photo. Do not alter or regenerate the face.

Photoshoot details:
- **Pose**: ${pose}.
- **Studio Background**: ${studioPrompt}.
- **Outfit**: ${lookPrompt}.
- **Shot Framing**: ${shot_type}.
- **Camera Angle**: ${cameraAngle}.
- **Lens Style**: ${lens}mm.
- **Lighting Setup**: ${light_setup}.
- **Style Level**: ${styleLevel}.

The final image must look like a real photograph, seamlessly integrating the original, unaltered face into the new context.`;
        
        try {
            const url = await generatePhotoshootImage(userPhoto, fullPrompt);
            generatedImages.push({
                id: i + 1,
                url: url,
                metadata: { lens, shot_type, light_setup, camera_angle: cameraAngle, pose, style_level: styleLevel }
            });
            onProgress(i + 1);
        } catch(error) {
            console.error(`Error generating image ${i + 1}:`, error);
            // Re-throw to be caught in the UI component
            throw error;
        }
    }
    
    const finalOutput: FinalOutput = {
      images: generatedImages,
      session_metadata: {
        user_photo_url: "user_photo_url_placeholder", // In a real app, this would be a URL
        studio: studioSelection,
        looks: lookSelections,
        diversity,
      },
      publishing_kit: {
        post_ideas: [
          "Новый образ - что скажете?",
          "Эксперименты со стилем.",
          "За кулисами фотосессии."
        ],
        hashtags: ["#нейрофотосессия", "#aiart", "#digitalfashion", "#style"]
      }
    };

    return finalOutput;
  }, [userPhoto, studioSelection, lookSelections, poseSelections]);
  
  const isNextDisabled = (): boolean => {
    if (currentStep === 1) return !userPhoto || !shotType;
    if (currentStep === 2) return !studioSelection;
    if (currentStep === 3) return lookSelections.length === 0 || poseSelections.length === 0;
    return false;
  };
  
  const renderWizardStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1UploadPhoto userPhoto={userPhoto} shotType={shotType} onPhotoChange={handlePhotoChange} onShotTypeChange={setShotType} />;
      case 2:
        return <Step2SelectStudio studioSelection={studioSelection} onStudioSelect={setStudioSelection} />;
      case 3:
        return <Step3SelectLooks 
            userPhoto={userPhoto} 
            lookSelections={lookSelections} 
            onLooksChange={setLookSelections}
            poseSelections={poseSelections}
            onPosesChange={setPoseSelections}
        />;
      case 4:
        return <Step4Generate 
            userPhoto={userPhoto!} 
            studioSelection={studioSelection!} 
            lookSelections={lookSelections}
            poseSelections={poseSelections}
            onGenerate={handleGenerate}
            onStartOver={startNewSession}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="text-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tighter">
            Нейро<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">фотосессия</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            {currentView === 'scenarios' 
              ? 'Профессиональные фото в один клик' 
              : 'Создайте фотосессию в 4 простых шага'}
          </p>
        </header>

        {currentView === 'wizard' && currentStep < 4 && (
            <div className="mb-12 mt-8 flex justify-center">
                <StepIndicator currentStep={currentStep} />
            </div>
        )}
        
        <main className="bg-gray-900/50 backdrop-blur-sm p-6 sm:p-10 rounded-2xl shadow-2xl shadow-indigo-900/20 border border-gray-700/50">
           {currentView === 'scenarios' ? (
             <Scenarios onSelectScenario={handleSelectScenario} onStartFromScratch={handleStartFromScratch} />
           ) : (
             renderWizardStepContent()
           )}
        </main>

        {currentView === 'wizard' && currentStep < 4 && (
            <footer className="mt-10 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Назад
                </button>
                <button 
                    onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
                    disabled={isNextDisabled()}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                >
                    Далее
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;