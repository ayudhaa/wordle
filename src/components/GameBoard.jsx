import Tile from './Tile';

const GameBoard = ({ 
  rows, 
  currentRow, 
  currentGuess, 
  isShaking, 
  evaluations, 
  cluePosition, 
  clueLetter,
  wordLength = 5,
  maxRounds = 1 
}) => {

  return (
    <div className="grid gap-1 sm:gap-2 mb-6 sm:mb-8">
      {Array.from({ length: maxRounds }).map((_, rowIndex) => {
        const isCurrentRow = rowIndex === currentRow;
        const rowGuess = rows[rowIndex] || '';
        const display = isCurrentRow ? currentGuess : rowGuess;
        const isSubmitted = rowIndex < currentRow;
        const rowEvaluation = evaluations[rowIndex] || [];

        return (
          <div 
            key={rowIndex} 
            className={`grid grid-cols-5 gap-1 sm:gap-2 ${isShaking && isCurrentRow ? 'animate-shake' : ''}`}
          >
            {Array.from({ length: wordLength }).map((_, cellIndex) => {
              const letter = display[cellIndex] || '';
              let status = null;
              
              if (isSubmitted && rowEvaluation[cellIndex]) {
                status = rowEvaluation[cellIndex];
              }

              // Check if this tile should show clue
              const isClueTile = cluePosition === cellIndex && rowIndex === 0 && !isSubmitted;
              const isClue = isClueTile && !letter;

              return (
                <Tile
                  key={cellIndex}
                  letter={isClueTile ? clueLetter : letter}
                  status={status}
                  isCurrent={isCurrentRow && letter !== ''}
                  isSubmitted={isSubmitted}
                  evaluation={status}
                  isClue={isClue}
                  cluePosition={cluePosition}
                  cellIndex={cellIndex}
                  wordLength={wordLength}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;