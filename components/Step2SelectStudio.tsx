import React, { useState } from 'react';
import type { StudioSelection, StudioHistoryItem } from '../types';
import { STUDIO_PRESETS } from '../constants';
import Card from './Card';
import { PaletteIcon, MagicWandIcon, LinkIcon, HistoryIcon } from './Icons';
import { generateStudioImage } from '../services/geminiService';
import { useLocalStorage } from '../utils';

interface Step2Props {
  studioSelection: StudioSelection | null;
  onStudioSelect: (selection: StudioSelection) => void;
}

type Tab = 'preset' | 'generate' | 'reference';

const Step2SelectStudio: React.FC<Step2Props> = ({ studioSelection, onStudioSelect }) => {
  const [activeTab, setActiveTab] = useState<Tab>(studioSelection?.source || 'preset');
  const [prompt, setPrompt] = useState(studioSelection?.source === 'generate' ? studioSelection.value : '');
  const [referenceUrl, setReferenceUrl] = useState(studioSelection?.source === 'reference' ? studioSelection.value : '');
  // FIX: Explicitly type the `details` state to prevent TypeScript from widening the types of its properties to general `string` or `number`.
  const [details, setDetails] = useState<StudioSelection['details']>(studioSelection?.details || { light: 'мягкий', lens: 50, palette: 'нейтральная' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | undefined>(studioSelection?.generatedImageUrl);
  const [history, setHistory] = useLocalStorage<StudioHistoryItem[]>('studio_selection_history', []);

  const updateHistory = (selection: StudioSelection) => {
    let historyItem: StudioHistoryItem | null = null;
    
    if (selection.source === 'preset') {
        const preset = STUDIO_PRESETS.find(p => p.id === selection.value);
        if (!preset) return;
        historyItem = {
            source: 'preset',
            value: preset.id,
            imageUrl: preset.imageUrl,
            name: preset.name,
        };
    } else if (selection.source === 'generate' && selection.generatedImageUrl) {
        historyItem = {
            source: 'generate',
            value: selection.value, // prompt
            imageUrl: selection.generatedImageUrl,
            name: selection.value, // prompt as name
            generatedImageUrl: selection.generatedImageUrl,
        };
    } else if (selection.source === 'reference' && selection.value) {
        // Basic URL validation
        if (!selection.value.startsWith('http')) return;
        historyItem = {
            source: 'reference',
            value: selection.value, // url
            imageUrl: selection.value, // use url as image
            name: 'Студия по референсу',
        };
    }

    if (historyItem) {
      const finalHistoryItem = historyItem;
      setHistory(prev => {
        const nextHistory = prev.filter(
            item => !(item.source === finalHistoryItem.source && item.value === finalHistoryItem.value)
        );
        return [finalHistoryItem, ...nextHistory].slice(0, 6);
      });
    }
  };

  const handleSelect = (source: 'preset' | 'generate' | 'reference', value: string, generatedImageUrl?: string) => {
    const selection: StudioSelection = { source, value, details, generatedImageUrl };
    onStudioSelect(selection);
    updateHistory(selection);
  };
  
  const handleDetailsChange = <K extends keyof StudioSelection['details']>(key: K, value: StudioSelection['details'][K]) => {
    const newDetails = { ...details, [key]: value };
    setDetails(newDetails);
    if(studioSelection) {
        onStudioSelect({ ...studioSelection, details: newDetails });
    }
  };

  const handleGenerateClick = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedImage(undefined);
    try {
        const imageUrl = await generateStudioImage(prompt);
        setGeneratedImage(imageUrl);
        handleSelect('generate', prompt, imageUrl);
    } catch (error) {
        alert("Не удалось сгенерировать студию. Попробуйте снова.");
    } finally {
        setIsGenerating(false);
    }
  }

  const handleHistorySelect = (item: StudioHistoryItem) => {
    const newSelection: StudioSelection = {
        source: item.source,
        value: item.value,
        details: details,
        generatedImageUrl: item.generatedImageUrl,
    };
    onStudioSelect(newSelection);
    setActiveTab(item.source);
    if (item.source === 'generate') {
        setPrompt(item.value);
        setGeneratedImage(item.generatedImageUrl);
        setReferenceUrl('');
    } else if (item.source === 'reference') {
        setReferenceUrl(item.value);
        setPrompt('');
        setGeneratedImage(undefined);
    } else {
        setPrompt('');
        setReferenceUrl('');
        setGeneratedImage(undefined);
    }
    updateHistory(newSelection);
  }


  const renderTabs = () => (
    <div className="flex justify-center bg-gray-800/60 p-1 rounded-lg gap-2 max-w-sm mx-auto mb-8">
      <button onClick={() => setActiveTab('preset')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'preset' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><PaletteIcon className="w-5 h-5" />Пресеты</button>
      <button onClick={() => setActiveTab('generate')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><MagicWandIcon className="w-5 h-5" />Сгенерировать</button>
      <button onClick={() => setActiveTab('reference')} className={`w-full px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'reference' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}><LinkIcon className="w-5 h-5" />По референсу</button>
    </div>
  );

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-2">Шаг 2: Выберите студию</h2>
      <p className="text-gray-400 mb-8">Где будет проходить ваша фотосессия?</p>
      {renderTabs()}

      <div className="mb-8">
        {activeTab === 'preset' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STUDIO_PRESETS.map(preset => (
              // FIX: Pass `title` prop to Card component explicitly instead of spreading.
              <Card 
                key={preset.id} 
                title={preset.name}
                description={preset.description}
                imageUrl={preset.imageUrl}
                isSelected={studioSelection?.source === 'preset' && studioSelection.value === preset.id}
                onSelect={() => handleSelect('preset', preset.id)}
              />
            ))}
          </div>
        )}
        {activeTab === 'generate' && (
          <div className="max-w-lg mx-auto text-left">
            <textarea
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={3}
              placeholder="Опишите студию: материалы, свет, цвет... Например: 'Светлая минималистичная комната с большим окном и деревянным полом'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
            <button onClick={handleGenerateClick} disabled={isGenerating || !prompt} className="mt-4 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {isGenerating ? 'Генерация...' : 'Сгенерировать студию'}
            </button>
            {isGenerating && <div className="mt-4 text-center text-gray-300">Создаем вашу уникальную студию...</div>}
            {generatedImage && (
                <div className="mt-4">
                    <p className="text-center text-green-400 mb-2">Студия сгенерирована!</p>
                    <img src={generatedImage} alt="Сгенерированная студия" className="rounded-lg w-full"/>
                </div>
            )}
          </div>
        )}
        {activeTab === 'reference' && (
            <div className="max-w-lg mx-auto text-left">
                <input
                    type="text"
                    className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Вставьте ссылку на изображение студии"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    onBlur={(e) => handleSelect('reference', e.target.value)}
                />
                 <p className="text-xs text-gray-500 mt-2">Вставьте URL-адрес изображения и кликните вне поля. Убедитесь, что он доступен публично.</p>
            </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="my-12 py-8 border-t border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center gap-3">
                <HistoryIcon className="w-6 h-6 text-gray-400" />
                <span>История выбора</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                {history.map((item, index) => (
                    <div 
                        key={`${item.source}-${item.value.slice(0,10)}-${index}`}
                        onClick={() => handleHistorySelect(item)}
                        className="cursor-pointer group relative rounded-lg overflow-hidden border-2 border-gray-700 hover:border-indigo-500 transition-all aspect-square"
                        role="button"
                        tabIndex={0}
                        aria-label={`Select from history: ${item.name}`}
                    >
                        <img 
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/0A0A0A/4F46E5?text=Ref'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all flex flex-col justify-end p-2">
                            <p className="text-white text-xs font-semibold truncate" title={item.name}>{item.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Настройки съемки</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Свет</label>
                {/* FIX: Use specific type assertion for onChange event value. */}
                <select value={details.light} onChange={e => handleDetailsChange('light', e.target.value as StudioSelection['details']['light'])} className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:ring-2 focus:ring-indigo-500">
                    <option value="мягкий">Мягкий</option>
                    <option value="жёсткий">Жёсткий</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Объектив (мм)</label>
                {/* FIX: Use specific type assertion for onChange event value. */}
                <select value={details.lens} onChange={e => handleDetailsChange('lens', parseInt(e.target.value, 10) as StudioSelection['details']['lens'])} className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:ring-2 focus:ring-indigo-500">
                    <option value="35">35 мм</option>
                    <option value="50">50 мм</option>
                    <option value="85">85 мм</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Палитра</label>
                {/* FIX: Use specific type assertion for onChange event value. */}
                <select value={details.palette} onChange={e => handleDetailsChange('palette', e.target.value as StudioSelection['details']['palette'])} className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:ring-2 focus:ring-indigo-500">
                    <option value="тёплая">Тёплая</option>
                    <option value="нейтральная">Нейтральная</option>
                    <option value="холодная">Холодная</option>
                </select>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Step2SelectStudio;