import { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import Modal from './components/Modal';
import { pickRandomWord, isValidWord } from './utils/words';
import { Notify } from 'notiflix';

const WORD_LENGTH = 5;
const MAX_ROUNDS = 6;

function App() {
  const [answer, setAnswer] = useState(null);
  const [rows, setRows] = useState(Array(MAX_ROUNDS).fill(''));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState('playing');
  const [isShaking, setIsShaking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [evaluations, setEvaluations] = useState(Array(MAX_ROUNDS).fill(null));
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: Array(MAX_ROUNDS).fill(0)
  });
  
  const [cluePosition, setCluePosition] = useState(null);
  const [clueLetter, setClueLetter] = useState('');
  const [wordHint, setWordHint] = useState({ category: '', hint: '' });
  const gameStartedRef = useRef(false);
  const notificationShownRef = useRef(false);

  useEffect(() => {
    if (gameStartedRef.current) return;
    gameStartedRef.current = true;

    const savedStats = localStorage.getItem('wordle-stats');
    const savedDarkMode = localStorage.getItem('wordle-dark-mode');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    
    startNewGame();
  }, []);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wordle-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const getTileSize = (wordLength) => {
    if (wordLength <= 4) {
      return {
        mobile: 'w-14 h-14 text-xl',
        desktop: 'sm:w-16 sm:h-16 sm:text-2xl',
        gap: 'gap-3'
      };
    } else if (wordLength === 5) {
      return {
        mobile: 'w-12 h-12 text-lg',
        desktop: 'sm:w-14 sm:h-14 sm:text-2xl',
        gap: 'gap-2 sm:gap-3'
      };
    } else if (wordLength === 6) {
      return {
        mobile: 'w-10 h-10 text-base',
        desktop: 'sm:w-12 sm:h-12 sm:text-xl',
        gap: 'gap-2'
      };
    } else if (wordLength === 7) {
      return {
        mobile: 'w-9 h-9 text-sm',
        desktop: 'sm:w-11 sm:h-11 sm:text-lg',
        gap: 'gap-1 sm:gap-2'
      };
    } else {
      return {
        mobile: 'w-8 h-8 text-xs',
        desktop: 'sm:w-10 sm:h-10 sm:text-base',
        gap: 'gap-1'
      };
    }
  };

  const generateClue = useCallback((word) => {
    const letters = word.split('');
    const randomPos = Math.floor(Math.random() * WORD_LENGTH);
    return {
      position: randomPos,
      letter: letters[randomPos]
    };
  }, []);

  const startNewGame = useCallback(() => {
    const newAnswer = pickRandomWord();
    
    setAnswer(newAnswer);
    setRows(Array(MAX_ROUNDS).fill(''));
    setCurrentRow(0);
    setCurrentGuess('');
    setStatus('playing');
    setEvaluations(Array(MAX_ROUNDS).fill(null));
    
    const clue = generateClue(newAnswer.word);
    setCluePosition(clue.position);
    setClueLetter(clue.letter);
    
    setWordHint({
      category: newAnswer.category,
      hint: newAnswer.hint
    });

    if (!notificationShownRef.current) {
      Notify.info('Game baru dimulai! Selamat bermain! 🎮', {
        timeout: 2000,
      });
      notificationShownRef.current = true;
      
      setTimeout(() => {
        notificationShownRef.current = false;
      }, 3000);
    }
  }, [generateClue]);

  const showWinNotification = useCallback((attempts) => {
    const messages = [
      `Luar biasa! 🎉 Kamu menebak "${answer?.word}" dalam ${attempts} percobaan!`,
      `Hebat! 🔥 "${answer?.word}" berhasil ditebak dalam ${attempts} percobaan!`,
      `Mantap! ⚡ Tebakan tepat! "${answer?.word}" dalam ${attempts} percobaan!`,
      `Keren! 🚀 Kamu berhasil menebak "${answer?.word}" dengan ${attempts} percobaan!`,
      `Sempurna! 🌟 "${answer?.word}" tertebak dalam ${attempts} percobaan!`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    Notify.success(randomMessage, {
      timeout: 3000,
    });

    
    setTimeout(() => {
      startNewGame();
    }, 3000);
  }, [answer, startNewGame]);

  const showLoseNotification = useCallback(() => {
    Notify.failure(
      `Yah, kesempatan habis! 😢 Kata yang benar: ${answer?.word}. Coba lagi ya!`,
      {
        timeout: 3000,
      }
    );

    
    setTimeout(() => {
      startNewGame();
    }, 3000);
  }, [answer, startNewGame]);

  const showInvalidWordNotification = useCallback(() => {
    Notify.warning(
      'Kata tidak valid! ❌ Coba kata lain yang ada dalam kamus.',
      {
        timeout: 2000,
      }
    );
  }, []);

  const showIncompleteWordNotification = useCallback(() => {
    Notify.info(
      `Kata harus tepat ${WORD_LENGTH} huruf! 📝`,
      {
        timeout: 2000,
      }
    );
  }, []);

  const updateStats = useCallback((won, attempts) => {
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + (won ? 1 : 0),
      currentStreak: won ? stats.currentStreak + 1 : 0,
      maxStreak: Math.max(stats.maxStreak, won ? stats.currentStreak + 1 : 0),
      distribution: won 
        ? stats.distribution.map((count, idx) => 
            idx === attempts - 1 ? count + 1 : count
          )
        : stats.distribution
    };
    setStats(newStats);
    localStorage.setItem('wordle-stats', JSON.stringify(newStats));
  }, [stats]);

  const shakeRow = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const evaluateGuess = (guess) => {
    if (!answer) return [];
    
    const evaluation = [];
    const answerLetters = answer.word.split('');
    const guessLetters = guess.split('');

    
    guessLetters.forEach((letter, index) => {
      if (letter === answerLetters[index]) {
        evaluation[index] = 'correct';
        answerLetters[index] = null;
      }
    });

    
    guessLetters.forEach((letter, index) => {
      if (!evaluation[index]) {
        if (answerLetters.includes(letter)) {
          evaluation[index] = 'present';
          const foundIndex = answerLetters.indexOf(letter);
          answerLetters[foundIndex] = null;
        } else {
          evaluation[index] = 'absent';
        }
      }
    });

    return evaluation;
  };

  const handleKeyPress = useCallback((e) => {
    
    if (status !== 'playing') {
      if (e.key === 'Enter') {
        startNewGame();
      }
      return;
    }

    
    if (!answer) return;

    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        shakeRow();
        showIncompleteWordNotification();
        return;
      }

      if (!isValidWord(currentGuess)) {
        shakeRow();
        showInvalidWordNotification();
        return;
      }

      const newRows = [...rows];
      newRows[currentRow] = currentGuess;
      setRows(newRows);

      const evaluation = evaluateGuess(currentGuess);
      const newEvaluations = [...evaluations];
      newEvaluations[currentRow] = evaluation;
      setEvaluations(newEvaluations);

      if (currentGuess === answer.word) {
        setStatus('win');
        updateStats(true, currentRow + 1);
        setTimeout(() => showWinNotification(currentRow + 1), 500);
      } else if (currentRow + 1 >= MAX_ROUNDS) {
        setStatus('lose');
        updateStats(false);
        setTimeout(() => showLoseNotification(), 500);
      } else {
        setCurrentRow(currentRow + 1);
        setCurrentGuess('');
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  }, [
    currentGuess, currentRow, status, rows, answer, evaluations, updateStats, 
    showWinNotification, showLoseNotification, showInvalidWordNotification, 
    showIncompleteWordNotification, startNewGame
  ]);

  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  const maxDistribution = Math.max(...stats.distribution);

  
  const tileSize = getTileSize(WORD_LENGTH);

  if (!answer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-4 px-3 sm:py-8 sm:px-4 transition-colors duration-300">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <div className="text-center flex-1 mx-2">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">
              TEBAK KATA YUKK
            </h1>
          </div>

          <div className="w-8 sm:w-10"></div>
        </div>

        {/* Word Hint Section - RESPONSIVE */}
        {wordHint.category && (
          <div className="mb-3 sm:mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="text-center">
              
              {/* Grid responsive untuk mobile dan desktop */}
              <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Kategori</div>
                  <div className="font-bold text-purple-700 dark:text-purple-300 text-sm sm:text-base break-words px-1">
                    {wordHint.category}
                  </div>
                </div>
                
                <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Deskripsi</div>
                  <div className="font-bold text-purple-700 dark:text-purple-300 text-xs sm:text-sm break-words leading-tight px-1 min-h-[2.5rem] flex items-center justify-center">
                    <span className="line-clamp-2">
                      {wordHint.hint}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single Row Game Board - RESPONSIVE SIZE */}
        <div className="mb-6 sm:mb-8">
          <div className={`grid grid-cols-5 ${tileSize.gap} mx-auto max-w-xs ${isShaking ? 'animate-shake' : ''}`}>
            {Array.from({ length: WORD_LENGTH }).map((_, cellIndex) => {
              const isClueTile = cluePosition === cellIndex;
              const displayLetter = isClueTile ? clueLetter : currentGuess[cellIndex] || '';
              const isClue = isClueTile && !currentGuess[cellIndex];
              
              return (
                <div 
                  key={cellIndex}
                  className={`
                    flex items-center justify-center 
                    font-bold rounded-lg transition-all duration-200
                    shadow-md relative
                    ${tileSize.mobile} ${tileSize.desktop}
                    ${isClue 
                      ? 'bg-green-100 border-2 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300 animate-pulse' 
                      : currentGuess[cellIndex] 
                      ? 'bg-blue-100 border-2 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300' 
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500'
                    }
                  `}
                >
                  {displayLetter}
                  {isClue && (
                    <div className={`absolute -top-1 -right-1 ${
                      WORD_LENGTH <= 5 ? 'w-2 h-2 sm:w-3 sm:h-3' : 'w-1.5 h-1.5 sm:w-2 sm:h-2'
                    } bg-green-500 rounded-full animate-ping`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Guess Display - RESPONSIVE */}
        <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 break-words">
            {status === 'playing' ? 'Ketik kata:' : 'Game Selesai! Tekan Enter untuk main lagi'}
          </p>
          <p className={`font-mono font-bold text-gray-800 dark:text-white mb-3 tracking-wider ${
            WORD_LENGTH <= 5 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}>
            {currentGuess.padEnd(WORD_LENGTH, ' ').split('').map((char, index) => (
              <span 
                key={index} 
                className={`
                  inline-block ${
                    WORD_LENGTH <= 5 
                      ? 'min-w-[1.2rem] sm:min-w-[1.5rem]' 
                      : WORD_LENGTH === 6
                      ? 'min-w-[1rem] sm:min-w-[1.3rem]'
                      : 'min-w-[0.9rem] sm:min-w-[1.1rem]'
                  }
                  ${cluePosition === index 
                    ? 'text-green-600 dark:text-green-400 underline' 
                    : currentGuess[index] 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400'
                  }
                `}
              >
                {char || '_'}
              </span>
            ))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 break-words px-2">
            {status === 'playing' 
              ? `Panjang: ${currentGuess.length}/${WORD_LENGTH} • Enter = Submit • Backspace = Hapus`
              : `Tekan ENTER untuk game baru`
            }
          </p>
        </div>

        {/* Game Status Info - RESPONSIVE */}
        {status === 'playing' && (
          <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Percobaan: {currentRow + 1}/{MAX_ROUNDS}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;