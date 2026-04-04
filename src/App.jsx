import { useState, useRef, useCallback, useEffect } from 'react';

// ==================== CONSTANTS ====================

const BOARD_SIZE = 600;

const COLORS_ORIGINAL = {
  red: { main: '#ef4444', light: '#fef2f2', dark: '#dc2626', emoji: '🔴', name: 'Red' },
  yellow: { main: '#f59e0b', light: '#fefce8', dark: '#d97706', emoji: '🟡', name: 'Yellow' },
  blue: { main: '#6366f1', light: '#eef2ff', dark: '#4f46e5', emoji: '🔵', name: 'Blue' },
  green: { main: '#14b8a6', light: '#f0fdfa', dark: '#0d9488', emoji: '🟢', name: 'Green' },
};
const COLORS_ANIMALS = {
  red: { main: '#ef4444', light: '#fef2f2', dark: '#dc2626', emoji: '🦁', name: 'Red Lion' },
  blue: { main: '#6366f1', light: '#eef2ff', dark: '#4f46e5', emoji: '🐯', name: 'Blue Tiger' },
  yellow: { main: '#f59e0b', light: '#fefce8', dark: '#d97706', emoji: '🐼', name: 'Yellow Panda' },
  green: { main: '#14b8a6', light: '#f0fdfa', dark: '#0d9488', emoji: '🐘', name: 'Green Elephant' },
};

const ALL_COLORS = ['red', 'yellow', 'blue', 'green'];

const POSITIONS = [
  {x:56,y:195},{x:93,y:180},{x:126,y:180},{x:163,y:196},
  {x:194,y:164},{x:179,y:128},{x:180,y:94},{x:194,y:57},
  {x:231,y:45},{x:265,y:44},{x:299,y:45},{x:334,y:45},
  {x:358,y:74},{x:390,y:86},{x:404,y:119},{x:404,y:150},
  {x:390,y:184},{x:416,y:212},{x:448,y:198},{x:477,y:198},
  {x:508,y:212},{x:519,y:244},{x:518,y:276},{x:520,y:307},
  {x:519,y:336},{x:519,y:366},{x:508,y:399},{x:477,y:413},
  {x:447,y:413},{x:416,y:400},{x:391,y:428},{x:405,y:461},
  {x:404,y:491},{x:390,y:526},{x:358,y:536},{x:328,y:537},
  {x:299,y:537},{x:270,y:537},{x:239,y:536},{x:210,y:526},
  {x:195,y:491},{x:196,y:460},{x:210,y:427},{x:182,y:398},
  {x:151,y:413},{x:122,y:413},{x:90,y:399},{x:81,y:366},
  {x:79,y:335},{x:80,y:305},{x:80,y:275},{x:82,y:245},
  // finish channels yellow 52-57
  {x:93,y:299},{x:129,y:299},{x:161,y:300},{x:195,y:300},{x:229,y:299},{x:269,y:300},
  // finish channels blue 58-63
  {x:300,y:94},{x:298,y:127},{x:300,y:162},{x:299,y:197},{x:300,y:231},{x:299,y:271},
  // finish channels red 64-69
  {x:506,y:301},{x:470,y:301},{x:437,y:301},{x:403,y:301},{x:369,y:299},{x:329,y:301},
  // finish channels green 70-75
  {x:299,y:505},{x:299,y:471},{x:300,y:438},{x:298,y:404},{x:300,y:370},{x:299,y:331},
  // takeoff 76-79
  {x:15,y:170},{x:429,y:17},{x:582,y:430},{x:168,y:582},
  // yellow base 80-83
  {x:44,y:45},{x:100,y:45},{x:45,y:98},{x:98,y:96},
  // blue base 84-87
  {x:500,y:44},{x:553,y:45},{x:500,y:98},{x:555,y:99},
  // red base 88-91
  {x:501,y:501},{x:555,y:503},{x:501,y:554},{x:554,y:554},
  // green base 92-95
  {x:45,y:501},{x:97,y:501},{x:44,y:554},{x:98,y:554},
];

const START_POINTS = { yellow: 76, blue: 77, red: 78, green: 79 };
const HOME_POSITIONS = {
  yellow: [80,81,82,83], blue: [84,85,86,87],
  red: [88,89,90,91], green: [92,93,94,95],
};
const FINISH_CHANNELS = {
  yellow: { start: 52, end: 57, entry: 49 },
  blue:   { start: 58, end: 63, entry: 10 },
  red:    { start: 64, end: 69, entry: 23 },
  green:  { start: 70, end: 75, entry: 36 },
};
const SHORTCUTS = {
  yellow: { trigger: 17, destination: 29 },
  blue:   { trigger: 30, destination: 42 },
  red:    { trigger: 43, destination: 3 },
  green:  { trigger: 4,  destination: 16 },
};
const PATH_COLORS = {
  yellow: [1,5,9,13,17,21,25,29,33,37,41,45,49],
  blue:   [2,6,10,14,18,22,26,30,34,38,42,46,50],
  red:    [3,7,11,15,19,23,27,31,35,39,43,47,51],
  green:  [0,4,8,12,16,20,24,28,32,36,40,44,48],
};
const FINISH_ENTRY_INDEX = { yellow: 49, blue: 10, red: 23, green: 36 };
const PATH_START_INDEX = { yellow: 0, blue: 13, red: 26, green: 39 };

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

// ==================== TRANSLATIONS ====================
const TR = {
  en: {
    gameTitle: '🎲 Ludo Game 🎲', selectPlayers: 'Select number of players (2-4)',
    settings: '⚙️ Game Settings', pieceStyle: 'Piece Style',
    styleOriginal: 'Original Colors', styleAnimals: 'Animal Avatars', startGame: 'Start Game',
    rollDice: 'Roll Dice', planeTakeoff: 'Plane takes off!', rollSixAgain: 'Rolled 6! Roll again',
    turnToPlayer: 'Turn:', reachedFinish: 'Reached the finish! 🎉',
    exceedFinish: 'Exceeded finish, bounce back', steps: ' steps! ↩️',
    triggerShortcut: 'Triggered shortcut! ✈️', colorJump: 'Landed on ', colorTile: ' tile, jump! ✈️',
    captured: 'captured', selectPiece: 'Select a piece to move',
    playerWins: 'player wins! 🎊', noMovable: 'No movable pieces',
    gameStarted: 'Game started!',
    yellowPlayer: '🟡 Yellow', bluePlayer: '🔵 Blue',
    redPlayer: '🔴 Red', greenPlayer: '🟢 Green',
    correct: 'Correct! Move forward', wrong: 'Wrong! Stay in place', timeout: "Time's up! Stay in place",
    aiAnswering: 'AI is answering...', quizStats: 'Quiz Stats',
    rightCount: 'Correct', wrongCount: 'Wrong', playerType: 'Player Type',
    human: 'Human', ai: 'AI', victory: '🎊 Victory! 🎊',
    quizSummary: 'Quiz Summary', totalQuestions: 'Total', accuracy: 'Accuracy', points: ' pts',
  },
};

// ==================== QUESTION BANK (30 questions) ====================
const QUESTION_BANK = [
  // --- Sentence Example → Term (20) ---
  {q:"\"Peter Piper picked a peck of pickled peppers\" — Which rhetorical device is used?",c:["Allegory","Allusion","Alliteration","Analogy"],a:2},
  {q:"\"She was the Juliet to my Romeo\" — Which rhetorical device is used?",c:["Allusion","Analogy","Alliteration","Allegory"],a:0},
  {q:"\"I'm so hungry, I could eat a horse\" — Which rhetorical device is used?",c:["Personification","Metaphor","Symbolism","Hyperbole"],a:3},
  {q:"\"Accurate estimate\" — Which rhetorical device is used?",c:["Paradox","Oxymoron","Irony","Symbolism"],a:1},
  {q:"\"I have a dream that one day even the state of Mississippi... I have a dream that my four little children... I have a dream today!\" — Which rhetorical device is used?",c:["Repetition","Symbolism","Hyperbole","Alliteration"],a:0},
  {q:"\"Life is like a box of chocolates — you never know what you're going to get\" — Which rhetorical device is used?",c:["Alliteration","Oxymoron","Irony","Analogy"],a:3},
  {q:"\"Knee jerk reaction = a quick or automatic response\" — Which rhetorical term best describes this phrase?",c:["Connotation","Denotation","Colloquialism","Euphemism"],a:2},
  {q:"\"Y'all ain't gonna believe what happened down at the creek\" — Which rhetorical device is used?",c:["Colloquial","Dialect","Diction","Allusion"],a:1},
  {q:"\"I told my dog he was a terrible singer — he really needs to work on his howling career\" — Which rhetorical device is used?",c:["Facetious language","Homily","Irony","Sarcasm"],a:0},
  {q:"\"Time flies when you're having fun\" — Which rhetorical device is used?",c:["Metaphor","Simile","Allusion","Pun"],a:3},
  {q:"\"Do unto others as you would have them do unto you\" — Which rhetorical device is used?",c:["Allegory","Parody","Homily","Dialect"],a:2},
  {q:"\"The wind screamed through the broken window\" — Which rhetorical device is used?",c:["Imagery","Personification","Metaphor","Symbolism"],a:1},
  {q:"\"Her voice was like velvet — smooth and warm\" — Which rhetorical device is used?",c:["Simile","Metaphor","Allusion","Analogy"],a:0},
  {q:"\"The white dove landed between the two soldiers\" — Which rhetorical device is used?",c:["Imagery","Allegory","Symbolism","Denotation"],a:2},
  {q:"\"The bees buzzed and the clock ticked in the quiet room\" — Which rhetorical device is used?",c:["Alliteration","Imagery","Repetition","Onomatopoeia"],a:3},
  {q:"\"Animal Farm uses farm animals rebelling against their owner to represent the Russian Revolution\" — Which rhetorical device is used?",c:["Parody","Allegory","Satire","Symbolism"],a:1},
  {q:"\"He passed away peacefully in his sleep\" — Which rhetorical device is used?",c:["Euphemism","Litotes","Dysphemism","Irony"],a:0},
  {q:"\"The word 'snake' makes people feel danger and distrust beyond just the animal itself\" — Which rhetorical device is used?",c:["Denotation","Diction","Connotation","Symbolism"],a:2},
  {q:"\"The dictionary defines 'snake' as a legless reptile of the suborder Serpentes\" — Which rhetorical device is used?",c:["Connotation","Dialect","Diction","Denotation"],a:3},
  {q:"\"It's not rocket science\" — Which rhetorical device is used?",c:["Hyperbole","Litotes (understatement)","Irony","Paradox"],a:1},
  // --- Definition → Term (5) ---
  {q:"Which term is this definition describing? \"The use of words, phrases, grammatical constructions and sounds that capture everyday (or colloquial) language\"",c:["Dialect","Dysphemism","Denotation","Diction"],a:3},
  {q:"Which term is this definition describing? \"Joking or jesting often inappropriately; meant to be humorous or funny: not serious\"",c:["Facetious language","Homily","Analogy","Metonymy"],a:0},
  {q:"Which term is this definition describing? \"A play on words that are either identical in sound (homonyms) or similar in sound, but that are sharply different in meaning\"",c:["Euphemism","Dysphemism","Pun","Paradox"],a:2},
  {q:"Which term is this definition describing? \"Using slang or informalities in speech or writing; (noun = colloquialism)\"",c:["Allegory","Colloquial","Parody","Sarcasm"],a:1},
  {q:"Which term is this definition describing? \"A sermon or serious talk, speech or lecture involving moral or spiritual advice\"",c:["Homily","Point of view","Dialect","Parody"],a:0},
  // --- Compare & Contrast (5) ---
  {q:"How does a simile differ from a metaphor?",c:["Simile uses 'like' or 'as' to compare; metaphor states one thing is another","Simile gives human qualities to objects; metaphor compares two things","Simile repeats the same sound; metaphor creates a mental image","Simile uses exaggeration; metaphor uses understatement"],a:0},
  {q:"What is the difference between personification and anthropomorphism?",c:["Personification uses contradictory terms; anthropomorphism uses exaggeration","Personification compares two things using 'like'; anthropomorphism does not","Personification gives human traits to objects; anthropomorphism gives human form to non-humans","Personification repeats words for emphasis; anthropomorphism tells a moral story"],a:2},
  {q:"How does oxymoron differ from paradox?",c:["Oxymoron uses understatement; paradox uses exaggeration","Oxymoron is a short phrase with two contradictory words; paradox is a longer self-contradictory statement","Oxymoron refers to a historical event; paradox refers to a common saying","Oxymoron creates sound effects; paradox creates a mental image"],a:1},
  {q:"What separates litotes (understatement) from hyperbole?",c:["Litotes repeats the same word; hyperbole uses opposites","Litotes compares two unlike things; hyperbole gives human qualities","Litotes uses contradictory terms; hyperbole tells a moral story","Litotes makes something seem smaller or less important; hyperbole exaggerates"],a:3},
  {q:"How does allusion differ from a direct reference?",c:["Allusion uses contradictory words; direct reference uses exaggeration","Allusion indirectly refers to something well-known; direct reference explicitly names the source","Allusion compares using 'like'; direct reference repeats sounds","Allusion gives human qualities to objects; direct reference states the opposite"],a:1},
];

// ==================== HELPER FUNCTIONS ====================

function getColorInfo(color, style) {
  const colors = style === 'animals' ? COLORS_ANIMALS : COLORS_ORIGINAL;
  return colors[color];
}

function getMainPathIndex(color, position) {
  return (PATH_START_INDEX[color] + position - 1) % 52;
}

function isInFinishStretch(_color, position) {
  return position > 52;
}

function getStepsToEntry(color) {
  const mainPathStart = PATH_START_INDEX[color];
  const entryIndex = FINISH_CHANNELS[color].entry;
  return entryIndex >= mainPathStart
    ? entryIndex - mainPathStart + 1
    : (52 - mainPathStart) + entryIndex + 1;
}

function getPieceCoordinates(color, pieceIndex, pieces) {
  const piece = pieces[color][pieceIndex];
  const finishChannel = FINISH_CHANNELS[color];

  if (piece.position === -1 || piece.finished) {
    return POSITIONS[HOME_POSITIONS[color][pieceIndex]];
  }
  if (piece.position === 0) {
    return POSITIONS[START_POINTS[color]];
  }

  const stepsToEntry = getStepsToEntry(color);

  if (piece.position > stepsToEntry) {
    const finishStepIndex = piece.position - stepsToEntry - 1;
    const finishIndex = finishChannel.start + finishStepIndex;
    if (finishIndex <= finishChannel.end) {
      return POSITIONS[finishIndex];
    }
  }

  const currentPathIndex = (PATH_START_INDEX[color] + piece.position - 1) % 52;
  return POSITIONS[currentPathIndex];
}

function checkShortcutLogic(color, piece) {
  if (piece.position === -1 || piece.finished || piece.position === 0) return { shouldFly: false };
  if (isInFinishStretch(color, piece.position)) return { shouldFly: false };

  const currentIndex = getMainPathIndex(color, piece.position);
  const shortcut = SHORTCUTS[color];

  if (currentIndex === shortcut.trigger) {
    const startIndex = PATH_START_INDEX[color];
    const dest = shortcut.destination;
    const destPosition = dest >= startIndex ? dest - startIndex + 1 : (52 - startIndex) + dest + 1;
    return { shouldFly: true, newPosition: destPosition, flyType: 'shortcut' };
  }

  if (currentIndex === FINISH_ENTRY_INDEX[color]) return { shouldFly: false };

  const colorPositions = PATH_COLORS[color];
  if (colorPositions.includes(currentIndex)) {
    const idx = colorPositions.indexOf(currentIndex);
    const nextColorIndex = colorPositions[(idx + 1) % colorPositions.length];
    const startIndex = PATH_START_INDEX[color];
    const destPosition = nextColorIndex >= startIndex
      ? nextColorIndex - startIndex + 1
      : (52 - startIndex) + nextColorIndex + 1;
    if (isInFinishStretch(color, destPosition)) return { shouldFly: false };
    return { shouldFly: true, newPosition: destPosition, flyType: 'color' };
  }

  return { shouldFly: false };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeInitialPieces() {
  const p = {};
  ALL_COLORS.forEach(c => {
    p[c] = Array.from({ length: 4 }, () => ({ position: -1, finished: false }));
  });
  return p;
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ==================== PLAYER CONFIG OPTIONS ====================
const PLAYER_CONFIGS = [
  { colors: ['red','yellow'], label: '🔴🟡 2P', sub: 'Red vs Yellow' },
  { colors: ['blue','green'], label: '🔵🟢 2P', sub: 'Blue vs Green' },
  { colors: ['red','yellow','blue'], label: '🔴🟡🔵 3P', sub: 'R/Y/B' },
  { colors: ['red','green','yellow','blue'], label: '🔴🟢🟡🔵 4P', sub: 'All' },
];

// ==================== MAIN COMPONENT ====================
export default function App() {
  const [pieceStyle, setPieceStyle] = useState('original');
  const t = useCallback((key) => TR.en[key] || key, []);

  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'victory'
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [playerTypes, setPlayerTypes] = useState({ red:'human', yellow:'human', blue:'human', green:'human' });

  const [activePlayers, setActivePlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [diceRolled, setDiceRolled] = useState(false);
  const [pieces, setPieces] = useState(makeInitialPieces);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [rollingColor, setRollingColor] = useState(null);
  const [selectablePieces, setSelectablePieces] = useState([]);
  const [winner, setWinner] = useState(null);

  const [quizQueue, setQuizQueue] = useState([]);
  const [quizModal, setQuizModal] = useState(null);
  const [quizStats, setQuizStats] = useState({ red:{right:0,wrong:0}, yellow:{right:0,wrong:0}, blue:{right:0,wrong:0}, green:{right:0,wrong:0} });
  const quizTimerRef = useRef(null);
  const pendingMoveRef = useRef(null);
  const busyRef = useRef(false);

  // Refs for latest state access in timeouts/callbacks
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;
  const activePlayersRef = useRef(activePlayers);
  activePlayersRef.current = activePlayers;
  const currentPlayerIndexRef = useRef(currentPlayerIndex);
  currentPlayerIndexRef.current = currentPlayerIndex;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;
  const quizQueueRef = useRef(quizQueue);
  quizQueueRef.current = quizQueue;
  const playerTypesRef = useRef(playerTypes);
  playerTypesRef.current = playerTypes;
  const pieceStyleRef = useRef(pieceStyle);
  pieceStyleRef.current = pieceStyle;

  const getCurrentColor = useCallback(() => {
    return activePlayersRef.current[currentPlayerIndexRef.current];
  }, []);

  // ---- Quiz ----
  const drawQuestion = useCallback(() => {
    let queue = quizQueueRef.current;
    if (queue.length === 0) {
      queue = shuffleArray(QUESTION_BANK.map((_, i) => i));
    }
    const idx = queue[0];
    const rest = queue.slice(1);
    setQuizQueue(rest);
    quizQueueRef.current = rest;
    return QUESTION_BANK[idx];
  }, []);

  const advancePlayer = useCallback(() => {
    if (gameOverRef.current) return;
    const ap = activePlayersRef.current;
    const nextIdx = (currentPlayerIndexRef.current + 1) % ap.length;
    setCurrentPlayerIndex(nextIdx);
    currentPlayerIndexRef.current = nextIdx;
    setDiceRolled(false);
    setSelectablePieces([]);
    const ci = getColorInfo(ap[nextIdx], pieceStyleRef.current);
    setMessage(`${TR.en.turnToPlayer} ${ci.emoji}`);
    busyRef.current = false;
  }, []);

  const doCapture = useCallback((color, pieceIndex, currentPieces) => {
    const piece = currentPieces[color][pieceIndex];
    if (piece.position === -1 || piece.finished) return currentPieces;
    if (isInFinishStretch(color, piece.position)) return currentPieces;

    const currentIndex = getMainPathIndex(color, piece.position);
    let captured = false;
    const result = deepClone(currentPieces);

    activePlayersRef.current.forEach(playerColor => {
      if (playerColor === color) return;
      result[playerColor].forEach((otherPiece, idx) => {
        if (otherPiece.position === -1 || otherPiece.finished || otherPiece.position === 0) return;
        if (isInFinishStretch(playerColor, otherPiece.position)) return;
        const otherIndex = getMainPathIndex(playerColor, otherPiece.position);
        if (currentIndex === otherIndex) {
          result[playerColor][idx].position = -1;
          captured = true;
          const ci = getColorInfo(color, pieceStyleRef.current);
          const oi = getColorInfo(playerColor, pieceStyleRef.current);
          setMessage(`${ci.emoji} ${TR.en.captured} ${oi.emoji}！`);
        }
      });
    });

    if (captured) {
      setPieces(result);
      piecesRef.current = result;
    }
    return captured ? result : currentPieces;
  }, []);

  const finishTurn = useCallback((diceVal) => {
    if (diceVal === 6 && !gameOverRef.current) {
      setDiceRolled(false);
      setMessage(TR.en.rollSixAgain);
      busyRef.current = false;
    } else if (!gameOverRef.current) {
      setTimeout(() => advancePlayer(), 500);
    } else {
      busyRef.current = false;
    }
  }, [advancePlayer]);

  // Execute actual piece movement
  const executeMove = useCallback((moveInfo, passed) => {
    const { pieceIndex, diceVal, color } = moveInfo;

    if (!passed) {
      // Wrong/timeout: skip move but still respect 6 re-roll
      if (diceVal === 6 && !gameOverRef.current) {
        setDiceRolled(false);
        setMessage(TR.en.rollSixAgain);
        busyRef.current = false;
        return;
      }
      setTimeout(() => advancePlayer(), 800);
      return;
    }

    // Correct: execute actual move
    const prev = deepClone(piecesRef.current);
    const piece = prev[color][pieceIndex];

    if (piece.position === -1) {
      // Takeoff
      piece.position = 0;
      setPieces(prev);
      piecesRef.current = prev;
      setMessage(TR.en.planeTakeoff);

      setTimeout(() => {
        doCapture(color, pieceIndex, piecesRef.current);
        finishTurn(diceVal);
      }, 600);
      return;
    }

    const newPosition = piece.position + diceVal;
    const finishChannel = FINISH_CHANNELS[color];
    const stepsToEntry = getStepsToEntry(color);

    if (newPosition > stepsToEntry) {
      const finishStepIndex = newPosition - stepsToEntry - 1;
      const finishIndex = finishChannel.start + finishStepIndex;

      if (finishIndex === finishChannel.end) {
        piece.position = newPosition;
        piece.finished = true;
        setPieces(prev);
        piecesRef.current = prev;
        setMessage(TR.en.reachedFinish);

        const allDone = prev[color].every(p => p.finished);
        if (allDone) {
          setGameOver(true);
          gameOverRef.current = true;
          setWinner(color);
          setTimeout(() => setPhase('victory'), 500);
        } else {
          finishTurn(diceVal);
        }
        return;
      } else if (finishIndex > finishChannel.end) {
        const excess = finishIndex - finishChannel.end;
        const bounceBackIndex = finishChannel.end - excess;
        const bounceBackStepIndex = bounceBackIndex - finishChannel.start;
        piece.position = stepsToEntry + 1 + bounceBackStepIndex;
        setPieces(prev);
        piecesRef.current = prev;
        setMessage(`${TR.en.exceedFinish} ${excess}${TR.en.steps}`);

        setTimeout(() => finishTurn(diceVal), 600);
        return;
      }
    }

    // Normal move on main path
    piece.position = newPosition;
    setPieces(prev);
    piecesRef.current = prev;

    // Check shortcuts/color jumps
    setTimeout(() => {
      const res = checkShortcutLogic(color, piecesRef.current[color][pieceIndex]);
      if (res.shouldFly) {
        const ci = getColorInfo(color, pieceStyleRef.current);
        if (res.flyType === 'shortcut') setMessage(`${ci.emoji} ${TR.en.triggerShortcut}`);
        else setMessage(`${ci.emoji} ${TR.en.colorJump}${ci.name}${TR.en.colorTile}`);

        setTimeout(() => {
          const p2 = deepClone(piecesRef.current);
          p2[color][pieceIndex].position = res.newPosition;
          setPieces(p2);
          piecesRef.current = p2;

          if (res.flyType === 'color') {
            setTimeout(() => {
              const res2 = checkShortcutLogic(color, piecesRef.current[color][pieceIndex]);
              if (res2.shouldFly && res2.flyType === 'shortcut') {
                const ci2 = getColorInfo(color, pieceStyleRef.current);
                setMessage(`${ci2.emoji} ${TR.en.triggerShortcut}`);
                setTimeout(() => {
                  const p3 = deepClone(piecesRef.current);
                  p3[color][pieceIndex].position = res2.newPosition;
                  setPieces(p3);
                  piecesRef.current = p3;
                  setTimeout(() => { doCapture(color, pieceIndex, piecesRef.current); finishTurn(diceVal); }, 600);
                }, 500);
              } else {
                setTimeout(() => { doCapture(color, pieceIndex, piecesRef.current); finishTurn(diceVal); }, 600);
              }
            }, 500);
          } else {
            setTimeout(() => { doCapture(color, pieceIndex, piecesRef.current); finishTurn(diceVal); }, 600);
          }
        }, 500);
      } else {
        doCapture(color, pieceIndex, piecesRef.current);
        finishTurn(diceVal);
      }
    }, 600);
  }, [advancePlayer, doCapture, finishTurn]);

  // Quiz answer handler
  const handleQuizResult = useCallback((choiceIndex, moveInfo, question) => {
    if (quizTimerRef.current) { clearInterval(quizTimerRef.current); quizTimerRef.current = null; }
    const color = moveInfo.color;
    const correct = choiceIndex === question.a;

    // Show result
    setQuizModal(prev => prev ? { ...prev, selectedAnswer: choiceIndex, resolved: true } : null);
    setQuizStats(prev => {
      const next = { ...prev, [color]: { ...prev[color] } };
      if (correct) next[color].right++;
      else next[color].wrong++;
      return next;
    });

    if (correct) {
      setMessage(`✅ ${TR.en.correct} ${moveInfo.diceVal}${TR.en.points}`);
    } else {
      setMessage(`❌ ${TR.en.wrong}`);
    }

    setTimeout(() => {
      setQuizModal(null);
      executeMove(moveInfo, correct);
    }, 1200);
  }, [executeMove]);

  const handleQuizTimeout = useCallback((moveInfo) => {
    if (quizTimerRef.current) { clearInterval(quizTimerRef.current); quizTimerRef.current = null; }
    const color = moveInfo.color;
    setQuizModal(prev => prev ? { ...prev, resolved: true, timedOut: true } : null);
    setQuizStats(prev => {
      const next = { ...prev, [color]: { ...prev[color] } };
      next[color].wrong++;
      return next;
    });
    setMessage(`⏰ ${TR.en.timeout}`);

    setTimeout(() => {
      setQuizModal(null);
      executeMove(moveInfo, false);
    }, 1200);
  }, [executeMove]);

  // Show quiz
  const showQuiz = useCallback((moveInfo) => {
    const question = drawQuestion();
    const color = moveInfo.color;
    const isAI = playerTypesRef.current[color] === 'ai';

    const modal = { q: question.q, c: question.c, a: question.a, timeLeft: 15, selectedAnswer: null, resolved: false, timedOut: false };
    setQuizModal(modal);
    pendingMoveRef.current = moveInfo;

    if (isAI) {
      setMessage(TR.en.aiAnswering);
      setTimeout(() => {
        const correct = Math.random() < 0.7;
        const chosen = correct ? question.a : ((question.a + 1 + Math.floor(Math.random() * 3)) % 4);
        handleQuizResult(chosen, moveInfo, question);
      }, 1500);
    } else {
      let timeLeft = 15;
      quizTimerRef.current = setInterval(() => {
        timeLeft--;
        setQuizModal(prev => prev && !prev.resolved ? { ...prev, timeLeft } : prev);
        if (timeLeft <= 0) {
          clearInterval(quizTimerRef.current);
          quizTimerRef.current = null;
          handleQuizTimeout(moveInfo);
        }
      }, 1000);
    }
  }, [drawQuestion, handleQuizResult, handleQuizTimeout]);

  // Human clicks a quiz choice
  const humanQuizAnswer = useCallback((choiceIndex) => {
    if (!quizModal || quizModal.resolved) return;
    handleQuizResult(choiceIndex, pendingMoveRef.current, quizModal);
  }, [quizModal, handleQuizResult]);

  // ---- Dice & Move Logic ----
  const doRollDice = useCallback((color) => {
    if (diceRolled || gameOver || busyRef.current) return;
    if (color !== getCurrentColor()) return;

    busyRef.current = true;
    setRollingColor(color);
    setSelectablePieces([]);

    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setDiceRolled(true);
      setRollingColor(null);
      const ci = getColorInfo(color, pieceStyleRef.current);
      setMessage(`${ci.emoji} Rolled ${val}!`);

      setTimeout(() => checkMovable(color, val), 300);
    }, 500);
  }, [diceRolled, gameOver, getCurrentColor]);

  const checkMovable = useCallback((color, val) => {
    const currentPieces = piecesRef.current[color];
    const movable = [];
    currentPieces.forEach((piece, index) => {
      if (piece.finished) return;
      if (piece.position === -1) {
        if (val === 6 || val === 1) movable.push(index);
      } else {
        movable.push(index);
      }
    });

    if (movable.length === 0) {
      setMessage(TR.en.noMovable);
      setTimeout(() => advancePlayer(), 1500);
    } else if (movable.length === 1) {
      setTimeout(() => showQuiz({ pieceIndex: movable[0], diceVal: val, color }), 300);
    } else {
      if (playerTypesRef.current[color] === 'ai') {
        // AI auto-selects a piece: prefer pieces on the path over base pieces
        const onPath = movable.filter(i => piecesRef.current[color][i].position > 0);
        const chosen = onPath.length > 0 ? onPath[Math.floor(Math.random() * onPath.length)] : movable[0];
        setTimeout(() => showQuiz({ pieceIndex: chosen, diceVal: val, color }), 500);
      } else {
        setSelectablePieces(movable.map(i => `${color}-${i}`));
        setMessage(`${TR.en.selectPiece} (${movable.length})`);
        busyRef.current = false; // allow piece selection
      }
    }
  }, [advancePlayer, showQuiz]);

  const handlePieceClick = useCallback((color, index) => {
    if (!diceRolled || busyRef.current) return;
    if (color !== getCurrentColor()) return;
    if (!selectablePieces.includes(`${color}-${index}`)) return;

    busyRef.current = true;
    setSelectablePieces([]);
    showQuiz({ pieceIndex: index, diceVal: diceValue, color });
  }, [diceRolled, getCurrentColor, selectablePieces, diceValue, showQuiz]);

  // ---- AI auto-roll ----
  useEffect(() => {
    if (phase !== 'playing' || gameOver || quizModal) return;
    const color = activePlayers[currentPlayerIndex];
    if (!color) return;
    if (playerTypes[color] !== 'ai') return;
    if (diceRolled || busyRef.current) return;

    const timer = setTimeout(() => {
      doRollDice(color);
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, gameOver, activePlayers, currentPlayerIndex, playerTypes, diceRolled, quizModal, doRollDice]);

  // ---- Start Game ----
  const startGame = useCallback(() => {
    if (!selectedConfig) return;
    const ap = selectedConfig.colors;
    setActivePlayers(ap);
    activePlayersRef.current = ap;
    setCurrentPlayerIndex(0);
    currentPlayerIndexRef.current = 0;
    const freshPieces = makeInitialPieces();
    setPieces(freshPieces);
    piecesRef.current = freshPieces;
    setDiceValue(0);
    setDiceRolled(false);
    setGameOver(false);
    gameOverRef.current = false;
    setWinner(null);
    setSelectablePieces([]);
    setQuizStats({ red:{right:0,wrong:0}, yellow:{right:0,wrong:0}, blue:{right:0,wrong:0}, green:{right:0,wrong:0} });
    setQuizQueue(shuffleArray(QUESTION_BANK.map((_, i) => i)));
    quizQueueRef.current = shuffleArray(QUESTION_BANK.map((_, i) => i));
    setMessage(t('gameStarted'));
    setPhase('playing');
    busyRef.current = false;
  }, [selectedConfig, t]);

  // ---- Piece overlap offset calculation ----
  const getPiecePos = useCallback((color, idx) => {
    const coords = getPieceCoordinates(color, idx, pieces);
    let ox = 0, oy = 0, overlapCount = 0;
    activePlayers.forEach(oc => {
      pieces[oc].forEach((op, oi) => {
        if (op.position === -1 || op.finished) return;
        if (oc === color && oi === idx) return;
        const oco = getPieceCoordinates(oc, oi, pieces);
        if (oco.x === coords.x && oco.y === coords.y) {
          overlapCount++;
          if (overlapCount <= 3) {
            const off = overlapCount * 6;
            const ang = (overlapCount - 1) * (Math.PI / 4);
            ox = Math.cos(ang) * off;
            oy = Math.sin(ang) * off;
          }
        }
      });
    });
    return { x: coords.x + ox, y: coords.y + oy };
  }, [activePlayers, pieces]);

  const ci = (color) => getColorInfo(color, pieceStyle);

  // ========== PlayerPanel ==========
  const PlayerPanel = useCallback(({ color }) => {
    if (!activePlayers.includes(color)) return null;
    const isActive = activePlayers[currentPlayerIndex] === color && phase === 'playing' && !gameOver;
    const info = ci(color);
    const isHuman = playerTypes[color] === 'human';

    return (
      <div 
        className={`rounded-2xl p-4 min-w-[170px] text-center transition-all duration-200
          ${isActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
        style={{
          background: '#fff',
          border: isActive ? `2px solid ${info.main}` : '1px solid #e5e5e5',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
        }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: isActive ? info.main : '#525252' }}>{t(`${color}Player`)}</h3>
        <div className="text-xs text-gray-500 mb-2">{isHuman ? t('human') : t('ai')}</div>
        <div 
          className={`mx-auto rounded-xl flex items-center justify-center text-3xl font-bold my-3
            ${rollingColor === color ? 'animate-[dice-roll_0.5s_ease-in-out]' : ''}`}
          style={{ 
            background: '#fff',
            border: `1px solid #e5e5e5`,
            color: info.main,
            width: '64px',
            height: '64px',
          }}>
          {diceValue > 0 && activePlayers[currentPlayerIndex] === color ? DICE_FACES[diceValue - 1] : '🎲'}
        </div>
        <button
          className={`w-full py-2 rounded-xl text-white font-semibold text-sm transition-all duration-200
            ${isActive && !diceRolled && isHuman ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : 'cursor-not-allowed'}`}
          style={{ 
            background: isActive && !diceRolled && isHuman ? info.main : '#e5e5e5',
            color: isActive && !diceRolled && isHuman ? '#fff' : '#a3a3a3',
          }}
          disabled={!isActive || diceRolled || !isHuman}
          onClick={() => doRollDice(color)}>
          {t('rollDice')}
        </button>
        <div className="flex gap-1 justify-center mt-3">
          {pieces[color].map((p, i) => (
            <span key={i} 
              className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white"
              style={{ 
                background: p.finished ? '#f59e0b' : info.main,
                opacity: p.position === -1 && !p.finished ? 0.4 : 1,
              }}>
              {p.finished ? '✓' : p.position > -1 ? '◆' : '●'}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs flex gap-2 justify-center">
          <span className="text-green-600">✓{quizStats[color].right}</span>
          <span className="text-red-500">✗{quizStats[color].wrong}</span>
        </div>
      </div>
    );
  }, [activePlayers, currentPlayerIndex, phase, gameOver, playerTypes, pieceStyle, rollingColor, diceValue, diceRolled, pieces, quizStats, t, doRollDice]);

  // ===== SELECT SCREEN =====
  if (phase === 'select') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[2000]" 
        style={{ background: '#faf9f7' }}>
        <div className="p-8 max-w-md w-full text-center"
          style={{
            background: '#fff',
            borderRadius: '1rem',
            border: '1px solid #e5e5e5',
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}>
          <h2 className="text-2xl font-bold mb-2 text-black">{t('gameTitle')}</h2>
          <p className="mb-6 text-gray-500 text-sm">{t('selectPlayers')}</p>

          <div className="p-4 rounded-xl mb-4" style={{ background: '#f5f5f5' }}>
            <h3 className="font-semibold text-sm mb-3 text-gray-700">{t('settings')}</h3>
            <div className="flex gap-4 justify-center flex-wrap">
              <label className="text-sm text-gray-600 flex items-center gap-2">
                {t('pieceStyle')}:
                <select 
                  className="ml-1 p-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-indigo-500 focus:outline-none" 
                  value={pieceStyle} 
                  onChange={e => setPieceStyle(e.target.value)}>
                  <option value="original">{t('styleOriginal')}</option>
                  <option value="animals">{t('styleAnimals')}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {PLAYER_CONFIGS.map((cfg, i) => (
              <button key={i}
                className="p-4 rounded-xl font-semibold cursor-pointer transition-all duration-200"
                style={{
                  background: selectedConfig === cfg ? '#eef2ff' : '#fff',
                  border: selectedConfig === cfg ? '2px solid #6366f1' : '1px solid #e5e5e5',
                  color: selectedConfig === cfg ? '#6366f1' : '#525252',
                }}
                onClick={() => setSelectedConfig(cfg)}>
                <span className="text-base">{cfg.label}</span>
                <br/><small className="text-gray-400 text-xs">{cfg.sub}</small>
              </button>
            ))}
          </div>

          {selectedConfig && (
            <div className="p-4 rounded-xl mb-4" style={{ background: '#f5f5f5' }}>
              <h3 className="font-semibold text-sm mb-3 text-gray-700">{t('playerType')}</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {selectedConfig.colors.map(color => {
                  const info = ci(color);
                  return (
                    <label key={color} className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg" style={{ border: '1px solid #e5e5e5' }}>
                      <span>{info.emoji}</span>
                      <select 
                        className="p-1 rounded border-0 bg-transparent text-xs text-gray-600 focus:outline-none"
                        value={playerTypes[color]}
                        onChange={e => setPlayerTypes(prev => ({ ...prev, [color]: e.target.value }))}>
                        <option value="human">{t('human')}</option>
                        <option value="ai">{t('ai')}</option>
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <button
            className={`w-full py-3 rounded-xl text-white text-base font-semibold transition-all duration-200
              ${selectedConfig ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : 'cursor-not-allowed'}`}
            style={{
              background: selectedConfig ? '#6366f1' : '#e5e5e5',
              color: selectedConfig ? '#fff' : '#a3a3a3',
            }}
            disabled={!selectedConfig}
            onClick={startGame}>
            {t('startGame')}
          </button>
        </div>
      </div>
    );
  }

  // ===== VICTORY SCREEN =====
  if (phase === 'victory' && winner) {
    const wi = ci(winner);
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[2000]" 
        style={{ background: '#faf9f7' }}>
        <div className="p-8 max-w-md w-full text-center"
          style={{
            background: '#fff',
            borderRadius: '1rem',
            border: `2px solid ${wi.main}`,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: wi.main }}>{t('victory')}</h2>
          <div className="text-6xl mb-4">{wi.emoji}</div>
          <p className="text-xl font-semibold mb-6" style={{ color: wi.main }}>
            {wi.name} {t('playerWins')}
          </p>

          <div className="rounded-xl p-4 mb-6" style={{ background: '#f5f5f5' }}>
            <h3 className="font-semibold mb-3 text-gray-700">{t('quizSummary')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <th className="p-2 text-gray-500 text-left">Player</th>
                  <th className="p-2 text-green-600 text-center">Correct</th>
                  <th className="p-2 text-red-500 text-center">Wrong</th>
                  <th className="p-2 text-gray-500 text-center">Total</th>
                  <th className="p-2 text-gray-500 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {activePlayers.map(color => {
                  const s = quizStats[color];
                  const total = s.right + s.wrong;
                  const acc = total > 0 ? Math.round((s.right / total) * 100) : 0;
                  const cInfo = ci(color);
                  return (
                    <tr key={color} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td className="p-2 text-left" style={{ color: cInfo.main }}>{cInfo.emoji} {cInfo.name}</td>
                      <td className="p-2 text-green-600 text-center">{s.right}</td>
                      <td className="p-2 text-red-500 text-center">{s.wrong}</td>
                      <td className="p-2 text-gray-600 text-center">{total}</td>
                      <td className="p-2 font-semibold text-right" style={{ color: acc >= 70 ? '#14b8a6' : acc >= 50 ? '#f59e0b' : '#ef4444' }}>{acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            className="w-full py-3 rounded-xl text-white font-semibold cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            style={{ background: '#6366f1' }}
            onClick={() => { setPhase('select'); setSelectedConfig(null); }}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ===== GAME SCREEN =====
  return (
    <div className="min-h-screen p-6 flex flex-col items-center font-sans"
      style={{ background: '#faf9f7' }}>
      <h1 className="text-3xl font-bold mb-6 text-black">{t('gameTitle')}</h1>

      <div className="grid gap-6 items-start justify-center" style={{ gridTemplateColumns: '200px 600px 200px' }}>
        {/* Left panel */}
        <div className="flex flex-col justify-between min-h-[600px] gap-4">
          <PlayerPanel color="yellow" />
          <PlayerPanel color="green" />
        </div>

        {/* Center: board + message */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative" 
            style={{ 
              width: BOARD_SIZE, 
              height: BOARD_SIZE,
              borderRadius: '1rem',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
            <img src="/board.jpg" alt="board" className="w-[600px] h-[600px] rounded-2xl" style={{ border: '1px solid #e5e5e5' }} />
            {activePlayers.map(color =>
              pieces[color].map((piece, idx) => {
                const pos = getPiecePos(color, idx);
                const isSelectable = selectablePieces.includes(`${color}-${idx}`);
                const info = ci(color);
                return (
                  <div key={`${color}-${idx}`}
                    className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold text-white cursor-pointer z-10
                      transition-all duration-200
                      ${isSelectable ? 'animate-[pulse-piece_1s_infinite]' : ''}`}
                    style={{
                      left: pos.x, top: pos.y,
                      transform: 'translate(-50%, -50%)',
                      background: piece.finished ? '#f59e0b' : info.main,
                      border: '2px solid white',
                      boxShadow: isSelectable 
                        ? `0 0 0 3px ${info.main}`
                        : '0 1px 2px 0 rgba(0,0,0,0.05)',
                      fontSize: pieceStyle === 'animals' ? '20px' : '16px',
                    }}
                    onClick={() => handlePieceClick(color, idx)}>
                    {piece.finished ? '✓' : (pieceStyle === 'animals' ? info.emoji : idx + 1)}
                  </div>
                );
              })
            )}
          </div>

          <div className="py-3 px-6 min-w-[280px] text-center font-medium text-gray-700"
            style={{
              background: '#fff',
              borderRadius: '1rem',
              border: '1px solid #e5e5e5',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
            {message}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-between min-h-[600px] gap-4">
          <PlayerPanel color="blue" />
          <PlayerPanel color="red" />
        </div>
      </div>

      {/* Quiz Modal */}
      {quizModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[3000]" 
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="p-6 max-w-lg w-full mx-4"
            style={{
              background: '#fff',
              borderRadius: '1rem',
              border: '1px solid #e5e5e5',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
            {/* Timer bar */}
            <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ background: '#f5f5f5' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(quizModal.timeLeft / 15) * 100}%`,
                  background: quizModal.timeLeft > 5 ? '#14b8a6' : quizModal.timeLeft > 2 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <div className="text-center text-sm font-medium mb-4"
              style={{ color: quizModal.timeLeft > 5 ? '#14b8a6' : quizModal.timeLeft > 2 ? '#f59e0b' : '#ef4444' }}>
              {quizModal.timeLeft}s
            </div>

            <h3 className="text-base font-semibold text-gray-800 mb-5 text-center leading-relaxed">
              {quizModal.q}
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {quizModal.c.map((choice, i) => {
                const isSelected = quizModal.selectedAnswer === i;
                const isCorrect = quizModal.a === i;
                const isResolved = quizModal.resolved;
                
                let btnStyle = {
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  color: '#525252',
                };
                
                if (isResolved && isCorrect) {
                  btnStyle = {
                    background: '#f0fdfa',
                    border: '2px solid #14b8a6',
                    color: '#0d9488',
                  };
                } else if (isResolved && isSelected && !isCorrect) {
                  btnStyle = {
                    background: '#fef2f2',
                    border: '2px solid #ef4444',
                    color: '#dc2626',
                  };
                }

                return (
                  <button key={i}
                    className={`p-3 rounded-xl text-left font-medium transition-all duration-200 text-sm
                      ${isResolved ? 'cursor-default' : 'cursor-pointer hover:border-indigo-500'}`}
                    style={btnStyle}
                    disabled={isResolved || playerTypesRef.current[getCurrentColor()] === 'ai'}
                    onClick={() => humanQuizAnswer(i)}>
                    <span className="font-semibold mr-2 text-gray-400">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {choice}
                    {isResolved && isCorrect && <span className="ml-2 float-right">✓</span>}
                    {isResolved && isSelected && !isCorrect && <span className="ml-2 float-right">✗</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
