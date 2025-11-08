import React, { useState } from 'react';
import type { LookSelection } from '../types';
import { LOOK_PRESETS, PROFESSIONAL_POSES } from '../constants';
import Card from './Card';
import { ShirtIcon, MagicWandIcon, LinkIcon, HistoryIcon } from './Icons';
import { useLocalStorage } from '../utils';

interface Step3Props {
  userPhoto: string | null;
  lookSelections: LookSelection[];
  onLooksChange: (selections: LookSelection[]) => void;
  poseSelections: string[];
  onPosesChange: (poses: string[]) => void;
}

type Tab = 'preset' | 'generate' | 'reference';

const Step3SelectLooks: React.FC<Step3Props> = ({ userPhoto, lookSelections, onLooksChange, poseSelections, onPosesChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preset');
  const [prompt, setPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [history, setHistory] = useLocalStorage<string[]>('look_generation_history', []);

  const handleTogglePreset = (presetId: string) => {
    const isSelected = lookSelections.some(s => s.source === 'preset' && s.value === presetId);
    let newSelections: LookSelection[];
    if (isSelected) {
      newSelections = lookSelections.filter(s => !(s.source === 'preset' && s.value === presetId));
    } else {
      if (lookSelections.length >= 3) {
        alert("Можно выбрать до 3 образов.");
        return;
      }
      newSelections = [...lookSelections, { source: 'preset', value: presetId }];
    }
    onLooksChange(newSelections);
  };
  
  const handleAddLook = (source: 'generate' | 'reference', value: string) => {
    if (lookSelections.length >= 3) {
      alert("Можно выбрать до 3 образов.");
      return;
    }
    if (!value.trim()) return;
    onLooksChange([...lookSelections, { source, value }]);

    if (source === 'generate') {
      setPrompt('');
      const trimmedValue = value.trim();
      // Add to history if not already present, keeping the last 10
      if (trimmedValue && !history.includes(trimmedValue)) {
        setHistory(prev => [trimmedValue, ...prev].slice(0, 10));
      }
    }
    if (source === 'reference') setReferenceUrl('');
  }

  const handleRemoveLook = (index: number) => {
    onLooksChange(lookSelections.filter((_, i) => i !== index));
  }
  
  const handleTogglePose = (pose: string) => {
    const isSelected = poseSelections.includes(pose);
    let newSelections: string[];
    if (isSelected) {
      newSelections = poseSelections.filter(p => p !== pose);
    } else {
      if (poseSelections.length >= 5) {
        alert("Можно выбрать до 5 поз.");
        return;
      }
      newSelections = [...poseSelections, pose];
    }
    onPosesChange(newSelections);
  };


  const renderTabs = () => (
    <div className="flex justify-center bg-gray-800/60 p-1 rounded-lg gap-2 max-w-sm mx-auto mb-8">
      <button onClick={() => setActiveTab('preset')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'preset' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><ShirtIcon className="w-5 h-5" />Пресеты</button>
      <button onClick={() => setActiveTab('generate')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><MagicWandIcon className="w-5 h-5" />Сгенерировать</button>
      <button onClick={() => setActiveTab('reference')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'reference' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><LinkIcon className="w-5 h-5" />По референсу</button>
    </div>
  );

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-2">Шаг 3: Выберите позы и образы</h2>
      <p className="text-gray-400 mb-8">Определите стиль и настроение вашей фотосессии.</p>
      
      {lookSelections.length > 0 && (
          <div className="max-w-4xl mx-auto mb-10 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Предпросмотр образов ({lookSelections.length}/3):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lookSelections.map((look, index) => {
                      let lookName = 'Неизвестный образ';
                      let lookImageUrl: string | null = null;
                      let LookIcon: React.FC<{className?: string}> | null = null;

                      if (look.source === 'preset') {
                          const preset = LOOK_PRESETS.find(p => p.id === look.value);
                          if (preset) {
                              lookName = preset.name;
                              lookImageUrl = preset.imageUrl;
                          }
                      } else if (look.source === 'generate') {
                          lookName = look.value;
                          LookIcon = MagicWandIcon;
                      } else if (look.source === 'reference') {
                          lookName = 'Образ по референсу';
                          lookImageUrl = look.value;
                      }

                      return (
                          <div key={index} className="bg-gray-900/60 rounded-lg p-3 flex items-center gap-3 relative border border-gray-700 shadow-md">
                              {userPhoto && (
                                  <img src={userPhoto} alt="User" className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                              )}
                              <span className="text-indigo-400 font-bold text-xl flex-shrink-0">+</span>
                              
                              <div className="w-14 h-14 rounded-md bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {lookImageUrl ? (
                                      <img src={lookImageUrl} alt={lookName} className="w-full h-full object-cover" />
                                  ) : LookIcon ? (
                                      <LookIcon className="w-8 h-8 text-indigo-400" />
                                  ) : (
                                      <ShirtIcon className="w-8 h-8 text-gray-500" />
                                  )}
                              </div>

                              <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-semibold truncate" title={lookName}>{lookName}</p>
                                  <p className="text-xs text-gray-400 capitalize">{look.source === 'generate' ? 'Свой образ' : look.source}</p>
                              </div>
                              
                              <button 
                                  onClick={() => handleRemoveLook(index)} 
                                  className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors text-lg font-bold"
                                  aria-label="Удалить образ"
                              >
                                  &times;
                              </button>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      <div className="max-w-4xl mx-auto mb-10 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="block text-lg font-semibold text-white mb-3">Позы ({poseSelections.length}/5):</h3>
         <div className="flex flex-wrap gap-2 justify-center">
            {PROFESSIONAL_POSES.map((pose, index) => {
                const isSelected = poseSelections.includes(pose);
                return (
                    <button 
                        key={index}
                        onClick={() => handleTogglePose(pose)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border-gray-600'
                        }`}
                    >
                        {pose}
                    </button>
                )
            })}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-4">Выберите образы (до 3)</h3>
      {renderTabs()}
      
      <div className="mt-8">
        {activeTab === 'preset' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOOK_PRESETS.map(preset => (
              // FIX: Pass `title` prop to Card component explicitly instead of spreading.
              <Card 
                key={preset.id}
                title={preset.name}
                description={preset.description}
                imageUrl={preset.imageUrl}
                isSelected={lookSelections.some(s => s.source === 'preset' && s.value === preset.id)}
                onSelect={() => handleTogglePreset(preset.id)}
              />
            ))}
          </div>
        )}
        {activeTab === 'generate' && (
          <div className="max-w-lg mx-auto text-left">
            <textarea
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={3}
              placeholder="Опишите образ: стиль, силуэт, ткань, цвет, аксессуары..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
            <button onClick={() => handleAddLook('generate', prompt)} disabled={lookSelections.length >= 3 || !prompt} className="mt-4 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20">Добавить образ</button>
            {history.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2 justify-center">
                        <HistoryIcon className="w-5 h-5 text-gray-400" />
                        <span>История генераций</span>
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                        {history.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleAddLook('generate', item)}
                                disabled={lookSelections.length >= 3}
                                className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={item}
                            >
                                <span className="truncate">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
        {activeTab === 'reference' && (
            <div className="max-w-lg mx-auto text-left">
                <input
                    type="text"
                    className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Вставьте ссылку на фото одежды или образа"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                />
                <button onClick={() => handleAddLook('reference', referenceUrl)} disabled={lookSelections.length >= 3 || !referenceUrl} className="mt-4 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20">Добавить референс</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Step3SelectLooks;