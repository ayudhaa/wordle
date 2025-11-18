const Keyboard = ({ onKeyPress, usedLetters }) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  const getKeyColor = (key) => {
    if (!usedLetters[key]) return 'bg-gray-200 hover:bg-gray-300';
    
    switch (usedLetters[key]) {
      case 'correct':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'present':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'absent':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  return (
    <div className="space-y-2 max-w-md mx-auto">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`
                flex-1 h-12 md:h-14 flex items-center justify-center 
                text-sm md:text-base font-semibold rounded-md 
                transition-colors duration-200 min-w-8
                ${getKeyColor(key)}
                ${key === 'ENTER' || key === '⌫' ? 'flex-[1.5] text-xs' : ''}
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;