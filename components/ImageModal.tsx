import React, { useState, useRef, MouseEvent, WheelEvent } from 'react';
import { DownloadIcon, RefreshIcon } from './Icons';

interface ImageModalProps {
  imageUrl: string;
  imageName?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, imageName, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startDragPos = useRef({ x: 0, y: 0 });

  // Handle Escape key press to close the modal
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    
    const mimeType = imageUrl.match(/data:(image\/[a-z]+);/)?.[1];
    const extension = mimeType?.split('/')[1] || 'png';
    
    link.download = imageName ? `${imageName}.${extension}` : `download.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle clicks on the backdrop to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Zoom handler
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    let newScale = scale;
    if (e.deltaY > 0) {
      newScale = Math.max(1, scale - scaleAmount); // Zoom out, min 1x
    } else {
      newScale = Math.min(4, scale + scaleAmount); // Zoom in, max 4x
    }
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    setScale(newScale);
  };
  
  // Pan handlers
  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    startDragPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale === 1) return;
    e.preventDefault();
    const newX = e.clientX - startDragPos.current.x;
    const newY = e.clientY - startDragPos.current.y;
    setPosition({ x: newX, y: newY });
  };
  
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
        <div className="absolute top-4 right-4 flex gap-2 z-20">
            {scale > 1 && (
                <button 
                  onClick={resetZoom}
                  className="text-white bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  aria-label="Сбросить увеличение"
                >
                    <RefreshIcon className="w-6 h-6" />
                </button>
            )}
            {imageName && (
                <button 
                  onClick={handleDownload}
                  className="text-white bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  aria-label="Скачать фото"
                >
                    <DownloadIcon className="w-6 h-6" />
                </button>
            )}
            <button 
              onClick={onClose} 
              className="text-white bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClick={handleBackdropClick}
        >
            <img 
              src={imageUrl} 
              alt="Enlarged view" 
              className="object-contain rounded-lg transition-transform duration-100 ease-out" 
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                maxWidth: '90vw',
                maxHeight: '90vh',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
              onMouseDown={handleMouseDown}
              onClick={(e) => e.stopPropagation()}
              draggable="false"
            />
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

export default ImageModal;