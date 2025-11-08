
import React from 'react';
import type { ShotType } from '../types';
import { UploadIcon } from './Icons';

interface Step1Props {
  userPhoto: string | null;
  shotType: ShotType | null;
  onPhotoChange: (file: File) => void;
  onShotTypeChange: (type: ShotType) => void;
}

const shotTypes: { id: ShotType; label: string }[] = [
  { id: 'portrait', label: 'Портрет' },
  { id: 'half', label: 'По пояс' },
  { id: 'full', label: 'В полный рост' },
];

const Step1UploadPhoto: React.FC<Step1Props> = ({ userPhoto, shotType, onPhotoChange, onShotTypeChange }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onPhotoChange(event.target.files[0]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-2">Шаг 1: Загрузите ваше фото</h2>
      <p className="text-gray-400 mb-8">Нам нужно одно фото, чтобы начать магию.</p>

      <div className="max-w-md mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-colors"
        >
          {userPhoto ? (
            <img src={userPhoto} alt="Предпросмотр" className="max-h-60 mx-auto rounded-lg shadow-xl shadow-indigo-500/20" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <UploadIcon className="w-12 h-12 mb-4 text-gray-500" />
              <p className="font-semibold text-white">Нажмите, чтобы загрузить фото</p>
              <p className="text-sm">PNG, JPG, WEBP</p>
            </div>
          )}
        </div>
      </div>
      
      {userPhoto && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Укажите тип кадра:</h3>
            <div className="flex justify-center gap-4 flex-wrap">
                {shotTypes.map((type) => (
                    <button 
                        key={type.id}
                        onClick={() => onShotTypeChange(type.id)}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                            shotType === type.id 
                            ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-indigo-500' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Step1UploadPhoto;