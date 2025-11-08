import React, { useState, useEffect } from 'react';
import type { FinalOutput, StudioSelection, LookSelection, FinalImage, CameraAngle, StyleLevel } from '../types';
import { LOOK_PRESETS, STUDIO_PRESETS } from '../constants';
import { MagicWandIcon, PencilIcon, DownloadIcon, EyeIcon } from './Icons';
import ImageModal from './ImageModal';
import { editPhotoshootImage } from '../services/geminiService';

// --- START OF EDIT MODAL COMPONENT ---
interface EditImageModalProps {
  image: FinalImage;
  onClose: () => void;
  onSave: (imageId: number, newUrl: string) => void;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGenerateEdit = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      // Use the most recent image URL for editing (original or already edited one)
      const newUrl = await editPhotoshootImage(editedImageUrl || image.url, prompt);
      setEditedImageUrl(newUrl);
    } catch (e) {
      setError('Не удалось применить правку. Попробуйте другой запрос.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
      if (editedImageUrl) {
          onSave(image.id, editedImageUrl);
      }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full text-white">
        <h2 id="edit-modal-title" className="text-2xl font-bold mb-4">Редактировать фото</h2>
        
        <div className="flex justify-center mb-4 bg-gray-900/50 p-2 rounded-md">
            <img 
                src={editedImageUrl || image.url} 
                alt="Image to edit" 
                className="max-h-[50vh] rounded-lg object-contain"
            />
        </div>

        <div className="space-y-3">
          <textarea
            id="edit-prompt"
            className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            rows={2}
            placeholder="Что изменить? Например: 'добавь улыбку' или 'сделай фон размытым'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          ></textarea>
           <label htmlFor="edit-prompt" className="sr-only">Prompt for editing the image</label>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-4">
            <button 
                onClick={onClose} 
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
            >
                Отмена
            </button>
            {editedImageUrl ? (
                 <button 
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors"
                 >
                    Сохранить
                 </button>
            ) : (
                <button 
                    onClick={handleGenerateEdit}
                    disabled={isLoading || !prompt}
                    className="px-6 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 transition-colors flex items-center gap-2"
                >
                    {isLoading ? 'Применяем...' : 'Применить'}
                    {isLoading && <MagicWandIcon className="w-4 h-4 animate-spin"/>}
                </button>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
// --- END OF EDIT MODAL COMPONENT ---


interface Step4Props {
  userPhoto: string;
  studioSelection: StudioSelection;
  lookSelections: LookSelection[];
  poseSelections: string[];
  onGenerate: (cameraAngle: CameraAngle, styleLevel: StyleLevel, onProgress: (generatedCount: number) => void) => Promise<FinalOutput>;
  onStartOver: () => void;
}

const loadingMessages = [
    "Подбираем освещение...",
    "Проверяем ракурсы...",
    "Стилизуем образы...",
    "Рисуем тени...",
    "Настраиваем фокус...",
    "Последние штрихи...",
];

const Step4Generate: React.FC<Step4Props> = ({ userPhoto, studioSelection, lookSelections, poseSelections, onGenerate, onStartOver }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [finalOutput, setFinalOutput] = useState<FinalOutput | null>(null);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [selectedImage, setSelectedImage] = useState<FinalImage | null>(null);
  const [editingImage, setEditingImage] = useState<FinalImage | null>(null);
  const [progress, setProgress] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const [styleLevel, setStyleLevel] = useState<StyleLevel>('realistic');
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentMessage(prev => {
            const currentIndex = loadingMessages.indexOf(prev);
            return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      const result = await onGenerate(cameraAngle, styleLevel, (p) => setProgress(p));
      setFinalOutput(result);
    } catch (error) {
      console.error("Generation failed:", error);
      let errorMessage = "Произошла ошибка во время генерации. Пожалуйста, попробуйте еще раз.";
      if (typeof error === 'object' && error !== null && 'message' in error) {
          const message = (error as { message: string }).message;
          if (message.includes('429')) {
              errorMessage = "Достигнут лимит запросов. Пожалуйста, проверьте ваш тарифный план и попробуйте позже.";
          }
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, id: number) => {
    const link = document.createElement('a');
    link.href = url;
    const mimeType = url.match(/data:(image\/[a-z]+);/)?.[1];
    const extension = mimeType?.split('/')[1] || 'png';
    link.download = `neuro-photoshoot-${id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    if (!finalOutput) return;
    finalOutput.images.forEach(image => {
        handleDownload(image.url, image.id);
    });
  };
  
  const getStudioName = (selection: StudioSelection) => {
    if (selection.source === 'preset') return STUDIO_PRESETS.find(p => p.id === selection.value)?.name || 'Неизвестная студия';
    if (selection.source === 'generate') return 'Сгенерированная студия';
    return 'Студия по референсу';
  }

  const getLookName = (selection: LookSelection) => {
    if (selection.source === 'preset') return LOOK_PRESETS.find(p => p.id === selection.value)?.name || 'Неизвестный образ';
    if (selection.source === 'generate') return 'Сгенерированный образ';
    return 'Образ по референсу';
  }

  const handleSaveEdit = (imageId: number, newUrl: string) => {
    setFinalOutput(prev => {
        if (!prev) return null;
        return {
            ...prev,
            images: prev.images.map(img => img.id === imageId ? { ...img, url: newUrl } : img)
        };
    });
    setEditingImage(null);
  };

  if (isLoading) {
    return (
        <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
             <div className="relative mb-6">
                <MagicWandIcon className="w-16 h-16 text-indigo-400" />
                <div className="absolute inset-0 -z-10 animate-pulse bg-indigo-500/30 rounded-full blur-2xl"></div>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Создаем вашу фотосессию...</h2>
             <p className="text-gray-400 transition-opacity duration-500 h-6">{currentMessage}</p>
             <div className="w-full max-w-sm bg-gray-700/50 rounded-full h-2.5 mt-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${progress * 20}%` }}></div>
             </div>
             <p className="text-gray-400 mt-2 text-sm font-mono">{progress} / 5</p>
        </div>
    )
  }

  if (finalOutput) {
    return (
        <>
            {selectedImage && (
                <ImageModal 
                    imageUrl={selectedImage.url} 
                    imageName={`neuro-photoshoot-${selectedImage.id}`}
                    onClose={() => setSelectedImage(null)} 
                />
            )}
            {editingImage && (
                <EditImageModal 
                    image={editingImage}
                    onClose={() => setEditingImage(null)}
                    onSave={handleSaveEdit}
                />
            )}
            <div className="text-left">
                <h2 className="text-3xl text-center font-bold text-white mb-4">Ваша фотосессия готова!</h2>
                <p className="text-center text-gray-400 mb-8 -mt-2">Наведите на фото, чтобы редактировать или скачать, или нажмите для просмотра.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                    {finalOutput.images.map(image => (
                        <div key={image.id} className="relative group aspect-[4/5] rounded-lg overflow-hidden">
                            <img 
                                src={image.url} 
                                alt={`Generated photo ${image.id}`} 
                                className="object-cover w-full h-full shadow-lg transition-all duration-300 transform group-hover:scale-105 cursor-pointer" 
                                onClick={() => setSelectedImage(image)}
                            />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(image);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
                                    aria-label="Посмотреть фото"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingImage(image);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
                                    aria-label="Редактировать фото"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(image.url, image.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30"
                                    aria-label="Скачать фото"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">JSON Результат</h3>
                    <pre className="bg-gray-900 text-sm text-indigo-300 p-4 rounded-md overflow-x-auto">
                        <code>{JSON.stringify(finalOutput, null, 2)}</code>
                    </pre>
                </div>

                <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <button 
                        onClick={handleDownloadAll} 
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Скачать все
                    </button>
                    <button onClick={onStartOver} className="w-full sm:w-auto bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-600/20">
                        Создать новую фотосессию
                    </button>
                </div>
            </div>
        </>
    )
  }


  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-2">Шаг 4: Генерация</h2>
      <p className="text-gray-400 mb-8">Проверьте настройки и начнем!</p>

      <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-lg p-6 text-left shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">Резюме:</h3>
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <p className="text-gray-400 w-24">Фото:</p>
                <img src={userPhoto} alt="User" className="w-16 h-16 rounded-md object-cover"/>
            </div>
            <div className="flex items-start gap-4">
                <p className="text-gray-400 w-24 pt-1">Студия:</p>
                <div className="text-white">
                  <p className="font-semibold">{getStudioName(studioSelection)}</p>
                  <p className="text-sm text-gray-300">
                    {studioSelection.details.light} свет, {studioSelection.details.lens}мм, {studioSelection.details.palette} палитра
                  </p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <p className="text-gray-400 w-24 pt-1">Образы:</p>
                <ul className="list-disc list-inside text-white space-y-1">
                    {lookSelections.map((look, i) => <li key={i}>{getLookName(look)}</li>)}
                </ul>
            </div>
            <div className="flex items-start gap-4">
                <p className="text-gray-400 w-24 pt-1">Позы:</p>
                <ul className="list-disc list-inside text-white space-y-1">
                    {poseSelections.map((pose, i) => <li key={i} className="capitalize">{pose}</li>)}
                </ul>
            </div>
             <div className="flex items-start gap-4">
                <p className="text-gray-400 w-24 pt-1">Результат:</p>
                <p className="text-white font-semibold">5 фото</p>
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="camera-angle-select" className="text-gray-400 w-24">Ракурс:</label>
                <select
                    id="camera-angle-select"
                    value={cameraAngle}
                    onChange={e => setCameraAngle(e.target.value as CameraAngle)}
                    className="flex-grow bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="front">Спереди</option>
                    <option value="three_quarters">Три четверти</option>
                    <option value="profile">Профиль</option>
                    <option value="top">Сверху</option>
                    <option value="low">Снизу</option>
                </select>
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="style-level-select" className="text-gray-400 w-24">Стиль:</label>
                <select
                    id="style-level-select"
                    value={styleLevel}
                    onChange={e => setStyleLevel(e.target.value as StyleLevel)}
                    className="flex-grow bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="realistic">Реалистичный</option>
                    <option value="cinematic">Кинематографичный</option>
                    <option value="magazine">Журнальный</option>
                </select>
            </div>
        </div>
      </div>

      <button onClick={handleGenerateClick} className="mt-10 bg-indigo-600 text-white py-4 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold flex items-center gap-2 mx-auto shadow-2xl shadow-indigo-600/30">
        <MagicWandIcon />
        Сгенерировать 5 кадров
      </button>
    </div>
  );
};

export default Step4Generate;