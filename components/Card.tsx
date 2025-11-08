
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, imageUrl, isSelected, onSelect }) => {
  const borderClass = isSelected 
    ? 'border-indigo-500 ring-2 ring-indigo-500/50' 
    : 'border-gray-700 hover:border-indigo-600/50';

  return (
    <div
      onClick={onSelect}
      className={`bg-gray-800/50 rounded-xl overflow-hidden border ${borderClass} cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col relative`}
    >
       {isSelected && <div className="absolute inset-0 -z-10 bg-indigo-500/10 blur-xl"></div>}
      <img src={imageUrl} alt={title} className="w-full h-32 object-cover" />
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <h3 className="font-bold text-lg text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        {isSelected && (
          <div className="mt-3 text-sm font-semibold text-indigo-400">
            Выбрано
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;