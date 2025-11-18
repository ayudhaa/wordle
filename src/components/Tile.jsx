import { useEffect, useState } from 'react';

const Tile = ({ 
  letter, 
  status, 
  isCurrent, 
  isSubmitted, 
  evaluation, 
  isClue, 
  cluePosition, 
  cellIndex,
  wordLength = 5 
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  
  useEffect(() => {
    if (isSubmitted && status) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, status]);

  // Responsive size based on word length
  const getTileSize = () => {
    if (wordLength <= 4) return 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl';
    if (wordLength === 5) return 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-2xl';
    if (wordLength === 6) return 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-xl';
    return 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg'; // 7+ letters
  };

  const getTileClass = () => {
    if (isClue) {
      return 'bg-green-100 border-2 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300';
    }
    
    if (!status) return 'bg-white border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600';
    
    switch (status) {
      case 'correct':
        return 'bg-wordle-correct text-white';
      case 'present':
        return 'bg-wordle-present text-white';
      case 'absent':
        return 'bg-wordle-absent text-white';
      default:
        return 'bg-white border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  const getTextClass = () => {
    if (isClue) return 'text-green-700 dark:text-green-300 font-bold';
    if (evaluation) return 'text-white';
    return 'text-gray-800 dark:text-white';
  };

  return (
    <div 
      className={`
        flex items-center justify-center 
        font-bold rounded-md transition-all duration-200 shadow-md
        ${getTileSize()}
        ${getTileClass()}
        ${isFlipping ? 'animate-flip' : ''}
        ${isCurrent && letter && !isClue ? 'border-2 border-blue-500' : ''}
        ${isClue ? 'animate-pulse' : ''}
        relative
      `}
    >
      <span className={getTextClass()}>
        {letter}
      </span>
      {isClue && (
        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
};

export default Tile;