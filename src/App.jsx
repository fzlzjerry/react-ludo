import { useState, useRef, useCallback, useEffect } from 'react';

// ==================== CONSTANTS ====================

const BOARD_SIZE = 600;

const COLORS_ORIGINAL = {
  red: { main: '#FF7B7B', light: '#FFE4EC', dark: '#E85A5A', emoji: '🔴', name: 'Red' },
  yellow: { main: '#FFD166', light: '#FFF8E6', dark: '#F5B830', emoji: '🟡', name: 'Yellow' },
  blue: { main: '#7BCFFF', light: '#E6F7FF', dark: '#5ABDE8', emoji: '🔵', name: 'Blue' },
  green: { main: '#7BE8A0', light: '#E6FFF0', dark: '#5AD17D', emoji: '🟢', name: 'Green' },
};
const COLORS_ANIMALS = {
  red: { main: '#FF7B7B', light: '#FFE4EC', dark: '#E85A5A', emoji: '🦁', name: 'Red Lion' },
  blue: { main: '#7BCFFF', light: '#E6F7FF', dark: '#5ABDE8', emoji: '🐯', name: 'Blue Tiger' },
  yellow: { main: '#FFD166', light: '#FFF8E6', dark: '#F5B830', emoji: '🐼', name: 'Yellow Panda' },
  green: { main: '#7BE8A0', light: '#E6FFF0', dark: '#5AD17D', emoji: '🐘', name: 'Green Elephant' },
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

// ==================== QUESTION BANK (64 questions) ====================
const QUESTION_BANK = [
  // --- Term → Definition (20) ---
  {q:"What is the definition of allegory?",c:["A narrative with a hidden moral or political meaning","A comparison using 'like' or 'as'","Repeating initial consonant sounds","Addressing an absent person"],a:0},
  {q:"What is the definition of alliteration?",c:["The repetition of initial consonant sounds in nearby words","A direct comparison between two unlike things","An exaggeration for emphasis","A reference to another work"],a:0},
  {q:"What is the definition of allusion?",c:["An indirect reference to a well-known person, place, event, or text","A figure of speech using exaggeration","The use of words that imitate sounds","A comparison using 'like' or 'as'"],a:0},
  {q:"What is the definition of analogy?",c:["A comparison between two things to explain or clarify an idea","Giving human qualities to non-human things","A statement that contradicts itself but contains truth","Words that sound like what they mean"],a:0},
  {q:"What is the definition of apostrophe (rhetoric)?",c:["Directly addressing an absent person, dead person, or abstract concept","A mild expression substituted for an offensive one","A comparison using 'like' or 'as'","Repeating a word at the start of clauses"],a:0},
  {q:"What is the definition of colloquial language?",c:["Informal, everyday language used in casual speech","Language that is overly formal and academic","A figure of speech that exaggerates","A form of sarcastic humor"],a:0},
  {q:"What is the definition of connotation?",c:["The emotional or cultural associations a word carries beyond its literal meaning","The dictionary definition of a word","A type of metaphor","A form of irony"],a:0},
  {q:"What is the definition of denotation?",c:["The literal, dictionary definition of a word","The emotional associations of a word","A figure of speech involving exaggeration","A narrative told from first person"],a:0},
  {q:"What is the definition of dialect?",c:["A regional variety of language with distinct vocabulary, grammar, and pronunciation","A type of metaphor used in poetry","An address to an absent person","A humorous imitation of a work"],a:0},
  {q:"What is the definition of diction?",c:["The author's choice of words and style of expression","The arrangement of words in sentences","A reference to another literary work","The moral of a story"],a:0},
  {q:"What is the definition of dysphemism?",c:["The use of a harsh, blunt, or offensive expression instead of a polite one","A mild or indirect expression for something unpleasant","An exaggeration for dramatic effect","A comparison between two things"],a:0},
  {q:"What is the definition of euphemism?",c:["A mild or indirect expression substituted for one considered too harsh","A deliberately harsh or offensive expression","A statement that appears contradictory","A word that imitates a sound"],a:0},
  {q:"What is the definition of hyperbole?",c:["Extreme exaggeration used for emphasis or effect","An understatement that downplays something","A comparison using 'like' or 'as'","A reference to a famous work"],a:0},
  {q:"What is the definition of imagery?",c:["Vivid descriptive language that appeals to the senses","The arrangement of events in a story","A comparison between two unlike things","The author's attitude toward the subject"],a:0},
  {q:"What is the definition of irony?",c:["A contrast between expectation and reality, or saying the opposite of what is meant","An extreme exaggeration","A comparison using 'like' or 'as'","Repeating the same word for emphasis"],a:0},
  {q:"What is the definition of metaphor?",c:["A direct comparison between two unlike things without using 'like' or 'as'","A comparison using 'like' or 'as'","An exaggeration for emphasis","A word that imitates a sound"],a:0},
  {q:"What is the definition of extended metaphor?",c:["A metaphor developed over several lines or throughout an entire work","A brief comparison using 'like'","A single-word metaphor","A type of simile"],a:0},
  {q:"What is the definition of metonymy?",c:["Substituting the name of an attribute or related thing for the thing itself","A comparison using 'like' or 'as'","An exaggeration for effect","Giving human qualities to objects"],a:0},
  {q:"What is the definition of oxymoron?",c:["A figure of speech combining contradictory terms","An extreme exaggeration","A mild expression for something harsh","A humorous imitation"],a:0},
  {q:"What is the definition of onomatopoeia?",c:["Words that phonetically imitate the sounds they describe","A comparison between two unlike things","A deliberate understatement","An indirect reference to another work"],a:0},
  // --- Definition → Term (22) ---
  {q:"Which term matches: 'A statement that seems contradictory but reveals a deeper truth'?",c:["Paradox","Oxymoron","Irony","Hyperbole"],a:0},
  {q:"Which term matches: 'A humorous or satirical imitation of a serious work'?",c:["Parody","Satire","Sarcasm","Irony"],a:0},
  {q:"Which term matches: 'Giving human characteristics to non-human things'?",c:["Personification","Metaphor","Simile","Allegory"],a:0},
  {q:"Which term matches: 'The perspective from which a story is told'?",c:["Point of view","Tone","Theme","Diction"],a:0},
  {q:"Which term matches: 'A play on words exploiting multiple meanings or similar sounds'?",c:["Pun","Irony","Oxymoron","Paradox"],a:0},
  {q:"Which term matches: 'Using a word or phrase more than once for emphasis'?",c:["Repetition","Alliteration","Parallelism","Anaphora"],a:0},
  {q:"Which term matches: 'The art of effective or persuasive speaking or writing'?",c:["Rhetoric","Diction","Syntax","Style"],a:0},
  {q:"Which term matches: 'The use of mockery or irony to criticize or ridicule'?",c:["Sarcasm","Satire","Parody","Irony"],a:0},
  {q:"Which term matches: 'The use of humor, irony, or exaggeration to expose and criticize'?",c:["Satire","Sarcasm","Parody","Hyperbole"],a:0},
  {q:"Which term matches: 'A change in tone, style, or perspective within a text'?",c:["Shift","Syntax","Diction","Theme"],a:0},
  {q:"Which term matches: 'A comparison using like or as'?",c:["Simile","Metaphor","Analogy","Personification"],a:0},
  {q:"Which term matches: 'An author's unique way of writing, including word choice and sentence structure'?",c:["Style","Diction","Syntax","Tone"],a:0},
  {q:"Which term matches: 'Something that represents something else beyond its literal meaning'?",c:["Symbolism","Metaphor","Allegory","Imagery"],a:0},
  {q:"Which term matches: 'The arrangement of words and phrases to create sentences'?",c:["Syntax","Diction","Style","Rhetoric"],a:0},
  {q:"Which term matches: 'Any written or printed work, especially a literary composition'?",c:["Text","Theme","Thesis","Tone"],a:0},
  {q:"Which term matches: 'The central idea or message in a literary work'?",c:["Theme","Thesis","Tone","Text"],a:0},
  {q:"Which term matches: 'A statement or central argument in an essay'?",c:["Thesis","Theme","Text","Tone"],a:0},
  {q:"Which term matches: 'The author's attitude toward the subject or audience'?",c:["Tone","Style","Diction","Theme"],a:0},
  {q:"Which term matches: 'Deliberate understatement, especially by denying the opposite'?",c:["Litotes/Understatement","Hyperbole","Euphemism","Irony"],a:0},
  {q:"Which term matches: 'Humorous language not meant to be taken seriously'?",c:["Facetious language","Sarcasm","Satire","Pun"],a:0},
  {q:"Which term matches: 'A serious short essay or speech giving moral advice'?",c:["Homily","Allegory","Rhetoric","Thesis"],a:0},
  {q:"Which term matches: 'A narrative technique where the narrator knows everything'?",c:["Point of view","Diction","Theme","Tone"],a:0},
  // --- Example → Term (22) ---
  {q:"Which rhetorical device: 'The wind whispered through the trees'?",c:["Personification","Simile","Metaphor","Onomatopoeia"],a:0},
  {q:"Which rhetorical device: 'She sells seashells by the seashore'?",c:["Alliteration","Onomatopoeia","Repetition","Assonance"],a:0},
  {q:"Which rhetorical device: 'He was a Romeo with the ladies'?",c:["Allusion","Metaphor","Simile","Personification"],a:0},
  {q:"Which rhetorical device: 'I've told you a million times'?",c:["Hyperbole","Litotes","Metaphor","Irony"],a:0},
  {q:"Which rhetorical device: 'Life is like a box of chocolates'?",c:["Simile","Metaphor","Analogy","Allegory"],a:0},
  {q:"Which rhetorical device: 'The buzzing bee flew past'?",c:["Onomatopoeia","Alliteration","Personification","Imagery"],a:0},
  {q:"Which rhetorical device: 'O Death, where is thy sting?'?",c:["Apostrophe","Personification","Metaphor","Irony"],a:0},
  {q:"Which rhetorical device: 'The pen is mightier than the sword'?",c:["Metonymy","Metaphor","Simile","Synecdoche"],a:0},
  {q:"Which rhetorical device: 'Deafening silence'?",c:["Oxymoron","Paradox","Irony","Hyperbole"],a:0},
  {q:"Which rhetorical device: 'He passed away last night' (instead of 'died')?",c:["Euphemism","Dysphemism","Litotes","Metaphor"],a:0},
  {q:"Which rhetorical device: 'That's not bad at all' (meaning it's very good)?",c:["Litotes/Understatement","Hyperbole","Irony","Sarcasm"],a:0},
  {q:"Which rhetorical device: 'The fog crept in on little cat feet'?",c:["Extended metaphor","Simile","Personification","Imagery"],a:0},
  {q:"Which rhetorical device: 'Nice weather we're having' (during a storm)?",c:["Sarcasm","Irony","Satire","Paradox"],a:0},
  {q:"Which rhetorical device: 'Animal Farm' representing the Russian Revolution?",c:["Allegory","Metaphor","Allusion","Satire"],a:0},
  {q:"Which rhetorical device: 'Time is money'?",c:["Metaphor","Simile","Analogy","Personification"],a:0},
  {q:"Which rhetorical device: 'The Crown' referring to the monarchy?",c:["Metonymy","Metaphor","Synecdoche","Symbolism"],a:0},
  {q:"Which rhetorical device: 'He kicked the bucket' (meaning 'died')?",c:["Dysphemism","Euphemism","Metaphor","Colloquial"],a:0},
  {q:"Which rhetorical device: 'I must be cruel to be kind'?",c:["Paradox","Oxymoron","Irony","Antithesis"],a:0},
  {q:"Which rhetorical device: 'Oh yeah, great job!' (said mockingly)?",c:["Sarcasm","Irony","Satire","Facetious language"],a:0},
  {q:"Which rhetorical device: 'The rose symbolizes love in the story'?",c:["Symbolism","Imagery","Metaphor","Allusion"],a:0},
  {q:"Which rhetorical device: 'Gonna grab some grub' in casual speech?",c:["Colloquial","Dysphemism","Dialect","Slang"],a:0},
  {q:"Which rhetorical device: 'The smell of freshly baked bread filled the warm kitchen'?",c:["Imagery","Personification","Metaphor","Symbolism"],a:0},
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
        className={`rounded-[1.5rem] p-5 min-w-[170px] text-center transition-all duration-500 ease-out backdrop-blur-sm
          ${isActive ? 'opacity-100 scale-105 animate-[float_3s_ease-in-out_infinite]' : 'opacity-60 scale-100 pointer-events-none'}`}
        style={{
          background: isActive 
            ? `linear-gradient(145deg, ${info.light} 0%, white 100%)` 
            : 'linear-gradient(145deg, #FFF8FA 0%, #FFFFFF 100%)',
          border: `3px solid ${isActive ? info.main : '#E8E8E8'}`,
          boxShadow: isActive 
            ? `0 12px 40px -8px ${info.main}40, 0 4px 12px -2px ${info.main}30`
            : '0 4px 20px -4px rgba(0,0,0,0.08)',
        }}>
        <h3 className="text-sm font-extrabold mb-1" style={{ color: info.main }}>{t(`${color}Player`)}</h3>
        <div className="text-xs text-gray-400 mb-2 font-semibold">{isHuman ? `👤 ${t('human')}` : `🤖 ${t('ai')}`}</div>
        <div 
          className={`w-18 h-18 mx-auto rounded-2xl flex items-center justify-center text-4xl font-bold my-3
            ${rollingColor === color ? 'animate-[dice-roll_0.5s_ease-in-out]' : ''}`}
          style={{ 
            background: 'white',
            border: `3px solid ${info.main}`,
            color: info.main,
            boxShadow: `inset 0 2px 8px ${info.light}, 0 4px 12px -4px ${info.main}30`,
            width: '72px',
            height: '72px',
          }}>
          {diceValue > 0 && activePlayers[currentPlayerIndex] === color ? DICE_FACES[diceValue - 1] : '🎲'}
        </div>
        <button
          className={`w-full py-2.5 rounded-full text-white font-bold text-sm transition-all duration-300
            ${isActive && !diceRolled && isHuman ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-95' : '!bg-gray-200 !cursor-not-allowed !text-gray-400'}`}
          style={isActive && !diceRolled && isHuman ? { 
            background: `linear-gradient(135deg, ${info.main}, ${info.dark})`,
            boxShadow: `0 6px 20px -4px ${info.main}60`,
          } : {}}
          disabled={!isActive || diceRolled || !isHuman}
          onClick={() => doRollDice(color)}>
          {t('rollDice')}
        </button>
        <div className="flex gap-1.5 justify-center mt-3">
          {pieces[color].map((p, i) => (
            <span key={i} 
              className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300"
              style={{ 
                background: p.finished 
                  ? 'linear-gradient(135deg, #FFD166, #F5B830)' 
                  : `linear-gradient(135deg, ${info.main}, ${info.dark})`,
                opacity: p.position === -1 && !p.finished ? 0.4 : 1,
                boxShadow: p.finished ? '0 2px 8px rgba(255,209,102,0.5)' : `0 2px 6px ${info.main}40`,
                border: '2px solid white',
              }}>
              {p.finished ? '★' : p.position > -1 ? '◆' : '●'}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs flex gap-3 justify-center font-semibold">
          <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">✓ {quizStats[color].right}</span>
          <span className="text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full">✗ {quizStats[color].wrong}</span>
        </div>
      </div>
    );
  }, [activePlayers, currentPlayerIndex, phase, gameOver, playerTypes, pieceStyle, rollingColor, diceValue, diceRolled, pieces, quizStats, t, doRollDice]);

  // ===== SELECT SCREEN =====
  if (phase === 'select') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[2000]" 
        style={{ background: 'linear-gradient(135deg, #FFE4EC 0%, #FFF0E6 50%, #FFFBF0 100%)' }}>
        <div className="animate-[pop-in_0.5s_ease-out] p-10 max-w-lg text-center"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8FA 100%)',
            borderRadius: '2.5rem',
            border: '3px solid #FFB8D0',
            boxShadow: '0 20px 60px -12px rgba(255, 150, 180, 0.3), 0 8px 24px -8px rgba(255, 123, 123, 0.2)',
          }}>
          <h2 className="text-4xl font-extrabold mb-2" 
            style={{ 
              background: 'linear-gradient(135deg, #FF7B7B, #FFD166)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{t('gameTitle')}</h2>
          <p className="mb-6 text-gray-400 font-semibold">{t('selectPlayers')}</p>

          <div className="p-5 rounded-2xl mb-5" style={{ background: '#FFF5F8', border: '2px solid #FFE4EC' }}>
            <h3 className="font-bold text-sm mb-3 text-gray-600">{t('settings')}</h3>
            <div className="flex gap-4 justify-center flex-wrap">
              <label className="text-sm text-gray-500 font-semibold flex items-center gap-2">
                {t('pieceStyle')}:
                <select 
                  className="ml-1 p-2 rounded-xl border-2 border-pink-200 bg-white font-semibold text-gray-700 focus:border-pink-400 focus:outline-none transition-all" 
                  value={pieceStyle} 
                  onChange={e => setPieceStyle(e.target.value)}>
                  <option value="original">{t('styleOriginal')}</option>
                  <option value="animals">{t('styleAnimals')}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {PLAYER_CONFIGS.map((cfg, i) => (
              <button key={i}
                className="p-5 rounded-2xl font-bold cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: selectedConfig === cfg 
                    ? 'linear-gradient(145deg, #FFE4EC, #FFF0E6)' 
                    : 'white',
                  border: selectedConfig === cfg 
                    ? '3px solid #FF7B7B' 
                    : '3px solid #E8E8E8',
                  color: selectedConfig === cfg ? '#FF7B7B' : '#666',
                  boxShadow: selectedConfig === cfg 
                    ? '0 8px 24px -6px rgba(255, 123, 123, 0.35)' 
                    : '0 4px 12px -4px rgba(0,0,0,0.06)',
                }}
                onClick={() => setSelectedConfig(cfg)}>
                <span className="text-lg">{cfg.label}</span>
                <br/><small className="font-semibold text-gray-400">{cfg.sub}</small>
              </button>
            ))}
          </div>

          {selectedConfig && (
            <div className="p-5 rounded-2xl mb-5 animate-[pop-in_0.3s_ease-out]" style={{ background: '#FFF5F8', border: '2px solid #FFE4EC' }}>
              <h3 className="font-bold text-sm mb-3 text-gray-600">{t('playerType')}</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {selectedConfig.colors.map(color => {
                  const info = ci(color);
                  return (
                    <label key={color} className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-xl shadow-sm" style={{ border: `2px solid ${info.light}` }}>
                      <span className="text-lg">{info.emoji}</span>
                      <select 
                        className="p-1.5 rounded-lg border-0 bg-transparent text-xs font-semibold text-gray-600 focus:outline-none"
                        value={playerTypes[color]}
                        onChange={e => setPlayerTypes(prev => ({ ...prev, [color]: e.target.value }))}>
                        <option value="human">👤 {t('human')}</option>
                        <option value="ai">🤖 {t('ai')}</option>
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <button
            className={`py-4 px-12 rounded-full text-white text-xl font-extrabold transition-all duration-300
              ${selectedConfig ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl active:scale-95' : 'cursor-not-allowed opacity-50'}`}
            style={{
              background: selectedConfig 
                ? 'linear-gradient(135deg, #FF7B7B, #FFD166)' 
                : '#E0E0E0',
              boxShadow: selectedConfig 
                ? '0 12px 32px -6px rgba(255, 123, 123, 0.5)' 
                : 'none',
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
        style={{ background: 'linear-gradient(135deg, #FFE4EC 0%, #FFF0E6 50%, #FFFBF0 100%)' }}>
        <div className="animate-[celebrate_0.6s_ease-in-out_3] p-10 max-w-lg text-center"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8FA 100%)',
            borderRadius: '2.5rem',
            border: `4px solid ${wi.main}`,
            boxShadow: `0 24px 60px -12px ${wi.main}40, 0 12px 30px -8px rgba(255, 209, 102, 0.3)`,
          }}>
          <h2 className="text-5xl font-extrabold mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${wi.main}, #FFD166)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{t('victory')}</h2>
          <div className="text-7xl mb-4 animate-[float_2s_ease-in-out_infinite]">{wi.emoji}</div>
          <p className="text-2xl font-extrabold mb-6" style={{ color: wi.main }}>
            {wi.name} {t('playerWins')}
          </p>

          <div className="rounded-2xl p-5 mb-6" style={{ background: '#FFF5F8', border: '2px solid #FFE4EC' }}>
            <h3 className="font-bold mb-4 text-gray-600">{t('quizSummary')}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #FFE4EC' }}>
                  <th className="p-2 text-gray-500 font-semibold">Player</th>
                  <th className="p-2 text-emerald-500 font-semibold">Correct</th>
                  <th className="p-2 text-rose-400 font-semibold">Wrong</th>
                  <th className="p-2 text-gray-500 font-semibold">Total</th>
                  <th className="p-2 text-gray-500 font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {activePlayers.map(color => {
                  const s = quizStats[color];
                  const total = s.right + s.wrong;
                  const acc = total > 0 ? Math.round((s.right / total) * 100) : 0;
                  const cInfo = ci(color);
                  return (
                    <tr key={color} style={{ borderBottom: '1px solid #FFE4EC' }}>
                      <td className="p-2 font-semibold" style={{ color: cInfo.main }}>{cInfo.emoji} {cInfo.name}</td>
                      <td className="p-2 text-emerald-500 font-bold">{s.right}</td>
                      <td className="p-2 text-rose-400 font-bold">{s.wrong}</td>
                      <td className="p-2 text-gray-600">{total}</td>
                      <td className="p-2 font-extrabold" style={{ color: acc >= 70 ? '#10B981' : acc >= 50 ? '#FFD166' : '#FF7B7B' }}>{acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            className="py-4 px-10 rounded-full text-white font-extrabold text-lg cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl active:scale-95 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #FF7B7B, #FFD166)',
              boxShadow: '0 12px 32px -6px rgba(255, 123, 123, 0.5)',
            }}
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
      style={{ background: 'linear-gradient(135deg, #FFE4EC 0%, #FFF0E6 50%, #FFFBF0 100%)' }}>
      <h1 className="text-5xl font-extrabold mb-6"
        style={{ 
          background: 'linear-gradient(135deg, #FF7B7B, #FFD166)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 20px rgba(255, 123, 123, 0.2)',
        }}>{t('gameTitle')}</h1>

      <div className="grid gap-8 items-start justify-center" style={{ gridTemplateColumns: '200px 600px 200px' }}>
        {/* Left panel */}
        <div className="flex flex-col justify-between min-h-[600px] gap-6">
          <PlayerPanel color="yellow" />
          <PlayerPanel color="green" />
        </div>

        {/* Center: board + message */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative" 
            style={{ 
              width: BOARD_SIZE, 
              height: BOARD_SIZE,
              borderRadius: '1.5rem',
              boxShadow: '0 20px 60px -12px rgba(255, 150, 180, 0.3), 0 8px 24px -8px rgba(0,0,0,0.1)',
            }}>
            <img src="/board.jpg" alt="board" className="w-[600px] h-[600px] rounded-3xl" style={{ border: '4px solid white' }} />
            {activePlayers.map(color =>
              pieces[color].map((piece, idx) => {
                const pos = getPiecePos(color, idx);
                const isSelectable = selectablePieces.includes(`${color}-${idx}`);
                const info = ci(color);
                return (
                  <div key={`${color}-${idx}`}
                    className={`absolute w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold text-white cursor-pointer z-10
                      transition-all duration-500 ease-out
                      ${isSelectable ? 'animate-[pulse-piece_1s_infinite]' : ''}`}
                    style={{
                      left: pos.x, top: pos.y,
                      transform: 'translate(-50%, -50%)',
                      background: piece.finished
                        ? 'linear-gradient(135deg, #FFD166, #F5B830)'
                        : `linear-gradient(145deg, ${info.light}, ${info.main})`,
                      border: `3px solid ${piece.finished ? '#F5B830' : 'white'}`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      boxShadow: isSelectable 
                        ? `0 0 20px 6px ${info.main}80, 0 4px 12px -2px ${info.main}60`
                        : `0 4px 12px -2px ${info.main}40, 0 2px 6px rgba(0,0,0,0.1)`,
                      fontSize: pieceStyle === 'animals' ? '22px' : '18px',
                    }}
                    onClick={() => handlePieceClick(color, idx)}>
                    {piece.finished ? '★' : (pieceStyle === 'animals' ? info.emoji : idx + 1)}
                    {piece.finished && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white"
                        style={{ background: 'linear-gradient(135deg, #FF7B7B, #E85A5A)', color: 'white' }}>★</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="py-4 px-8 min-w-[320px] text-center font-bold text-gray-600"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8FA 100%)',
              borderRadius: '9999px',
              border: '3px solid #FFB8D0',
              boxShadow: '0 8px 24px -6px rgba(255, 150, 180, 0.25)',
            }}>
            {message}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-between min-h-[600px] gap-6">
          <PlayerPanel color="blue" />
          <PlayerPanel color="red" />
        </div>
      </div>

      {/* Quiz Modal */}
      {quizModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[3000]" 
          style={{ background: 'rgba(255, 228, 236, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="animate-[pop-in_0.3s_ease-out] p-8 max-w-xl w-full mx-4"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8FA 100%)',
              borderRadius: '2rem',
              border: '3px solid #FFB8D0',
              boxShadow: '0 24px 60px -12px rgba(255, 150, 180, 0.35)',
            }}>
            {/* Timer bar */}
            <div className="w-full h-4 rounded-full mb-4 overflow-hidden" style={{ background: '#FFF0E6' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(quizModal.timeLeft / 15) * 100}%`,
                  background: quizModal.timeLeft > 5 
                    ? 'linear-gradient(90deg, #7BE8A0, #5AD17D)' 
                    : quizModal.timeLeft > 2 
                      ? 'linear-gradient(90deg, #FFD166, #F5B830)'
                      : 'linear-gradient(90deg, #FF7B7B, #E85A5A)',
                }}
              />
            </div>
            <div className="text-center text-sm font-bold mb-3 px-3 py-1 rounded-full inline-flex mx-auto"
              style={{ 
                background: quizModal.timeLeft > 5 ? '#E6FFF0' : quizModal.timeLeft > 2 ? '#FFF8E6' : '#FFE4EC',
                color: quizModal.timeLeft > 5 ? '#5AD17D' : quizModal.timeLeft > 2 ? '#F5B830' : '#FF7B7B',
                display: 'block',
                width: 'fit-content',
              }}>
              {quizModal.timeLeft}s
            </div>

            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center leading-relaxed">
              {quizModal.q}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {quizModal.c.map((choice, i) => {
                const isSelected = quizModal.selectedAnswer === i;
                const isCorrect = quizModal.a === i;
                const isResolved = quizModal.resolved;
                
                let btnStyle = {
                  background: 'white',
                  border: '3px solid #E8E8E8',
                  color: '#555',
                };
                
                if (!isResolved) {
                  btnStyle = {
                    ...btnStyle,
                  };
                } else if (isCorrect) {
                  btnStyle = {
                    background: 'linear-gradient(145deg, #E6FFF0, #D0F5E0)',
                    border: '3px solid #7BE8A0',
                    color: '#2D8A4E',
                  };
                } else if (isSelected && !isCorrect) {
                  btnStyle = {
                    background: 'linear-gradient(145deg, #FFE4EC, #FFD0DC)',
                    border: '3px solid #FF7B7B',
                    color: '#C94A4A',
                  };
                }

                return (
                  <button key={i}
                    className={`p-4 rounded-2xl text-left font-semibold transition-all duration-300 text-sm
                      ${isResolved ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5'}`}
                    style={{
                      ...btnStyle,
                      boxShadow: isResolved 
                        ? (isCorrect ? '0 4px 12px -2px rgba(123, 232, 160, 0.4)' : (isSelected ? '0 4px 12px -2px rgba(255, 123, 123, 0.4)' : 'none'))
                        : '0 4px 12px -4px rgba(0,0,0,0.08)',
                    }}
                    disabled={isResolved || playerTypesRef.current[getCurrentColor()] === 'ai'}
                    onClick={() => humanQuizAnswer(i)}>
                    <span className="font-bold mr-2 px-2 py-0.5 rounded-lg text-xs" 
                      style={{ background: '#FFF0E6', color: '#F5B830' }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {choice}
                    {isResolved && isCorrect && <span className="ml-2 float-right text-lg">✓</span>}
                    {isResolved && isSelected && !isCorrect && <span className="ml-2 float-right text-lg">✗</span>}
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
