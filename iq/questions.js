// ─── QUESTION GENERATOR ────────────────────────────────────────────────────
const QuestionGenerator = {
recentHashes: [],
maxRecent: 30,
userAge: null,

setAge(age) {
this.userAge = age;
},

getDifficultyLevel() {
const age = this.userAge;
if (!age) return ‘medium’;
if (age < 12) return ‘easy’;
if (age < 16) return ‘medium’;
if (age < 45) return ‘hard’;
if (age < 65) return ‘medium’;
return ‘easy’;
},

generate() {
const difficulty = this.getDifficultyLevel();
const generators = [
{ fn: this.numberSequence, weight: 14 },
{ fn: this.matrixPattern, weight: 12 },
{ fn: this.oddOneOut, weight: 10 },
{ fn: this.analogy, weight: 12 },
{ fn: this.mathPuzzle, weight: 12 },
{ fn: this.spatialRotation, weight: 8 },
{ fn: this.emotionalScenario, weight: 6 },
{ fn: this.logicPuzzle, weight: 10 },
{ fn: this.verbalReasoning, weight: 8 },
{ fn: this.missingLetter, weight: 8 }
];

```
const totalWeight = generators.reduce((a, b) => a + b.weight, 0);
let random = Math.random() * totalWeight;

let selectedGen;
for (const g of generators) {
  random -= g.weight;
  if (random <= 0) {
    selectedGen = g.fn;
    break;
  }
}

const question = selectedGen.call(this, difficulty);

const hash = question.type + question.answer;
if (this.recentHashes.includes(hash)) {
  return this.generate();
}
this.recentHashes.push(hash);
if (this.recentHashes.length > this.maxRecent) {
  this.recentHashes.shift();
}

return question;
```

},

// ─── NUMBER SEQUENCE ─────────────────────────────────────────────────────
numberSequence(difficulty) {
const patterns = {
easy: [
() => {
const add = this.randInt(2, 5);
const start = this.randInt(1, 10);
const seq = [];
let val = start;
for (let i = 0; i < 5; i++) { seq.push(val); val += add; }
return { seq: seq.slice(0, 4), answer: seq[4], explain: `Each number increases by ${add}. ${seq[3]} + ${add} = ${seq[4]}` };
},
() => {
const mult = 2;
const start = this.randInt(1, 4);
const seq = [];
let val = start;
for (let i = 0; i < 5; i++) { seq.push(val); val *= mult; }
return { seq: seq.slice(0, 4), answer: seq[4], explain: `Each number doubles. ${seq[3]} × 2 = ${seq[4]}` };
}
],
medium: [
() => {
const mult = this.randInt(2, 4);
const start = this.randInt(2, 5);
const seq = [];
let val = start;
for (let i = 0; i < 5; i++) { seq.push(val); val *= mult; }
return { seq: seq.slice(0, 4), answer: seq[4], explain: `Each number is multiplied by ${mult}. ${seq[3]} × ${mult} = ${seq[4]}` };
},
() => {
const offset = this.randInt(1, 3);
const seq = [];
for (let i = 1; i <= 5; i++) { seq.push((i + offset) ** 2); }
return { seq: seq.slice(0, 4), answer: seq[4], explain: `These are perfect squares: ${offset+1}², ${offset+2}², ${offset+3}², ${offset+4}², ${offset+5}² = ${seq[4]}` };
},
() => {
const a = this.randInt(1, 4);
const b = this.randInt(2, 5);
const seq = [a, b];
for (let i = 2; i < 6; i++) { seq.push(seq[i-1] + seq[i-2]); }
return { seq: seq.slice(0, 5), answer: seq[5], explain: `Fibonacci pattern: each number is the sum of the two before it. ${seq[3]} + ${seq[4]} = ${seq[5]}` };
}
],
hard: [
() => {
const offset = this.randInt(1, 2);
const seq = [];
for (let i = 1; i <= 5; i++) { seq.push((i + offset) ** 3); }
return { seq: seq.slice(0, 4), answer: seq[4], explain: `These are perfect cubes: ${offset+1}³, ${offset+2}³, ${offset+3}³, ${offset+4}³, ${offset+5}³ = ${seq[4]}` };
},
() => {
const start = this.randInt(2, 5);
const seq = [start];
for (let i = 1; i < 6; i++) {
if (i % 2 === 1) seq.push(seq[i-1] * 2);
else seq.push(seq[i-1] + 3);
}
return { seq: seq.slice(0, 5), answer: seq[5], explain: `Pattern alternates: ×2, then +3. ${seq[3]} × 2 = ${seq[4]}, then ${seq[4]} + 3 = ${seq[5]}` };
},
() => {
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
const start = this.randInt(0, 4);
const seq = primes.slice(start, start + 5);
return { seq: seq.slice(0, 4), answer: seq[4], explain: `These are prime numbers (only divisible by 1 and themselves). The next prime after ${seq[3]} is ${seq[4]}` };
},
() => {
const seq = [];
for (let i = 1; i <= 6; i++) { seq.push((i * (i + 1)) / 2); }
return { seq: seq.slice(0, 5), answer: seq[5], explain: `Triangular numbers: 1, 1+2, 1+2+3, etc. The pattern is n(n+1)/2` };
}
]
};

```
const levelPatterns = patterns[difficulty] || patterns.medium;
const pattern = levelPatterns[this.randInt(0, levelPatterns.length - 1)]();
const options = this.generateOptions(pattern.answer, 4);

return {
  type: 'numberSequence',
  category: 'patternRecognition',
  difficulty: difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.7 : 1,
  categoryLabel: 'Number Sequence',
  question: 'What comes next?',
  sequence: pattern.seq,
  answer: pattern.answer.toString(),
  options: options.map(String),
  explanation: pattern.explain,
  visual: 'sequence'
};
```

},

// ─── MATRIX PATTERN ──────────────────────────────────────────────────────
matrixPattern(difficulty) {
const patterns = [
() => {
const mult = difficulty === ‘easy’ ? 2 : this.randInt(2, 4);
const rows = [];
for (let r = 0; r < 3; r++) {
const base = this.randInt(2, 5) + r;
rows.push([base, base * mult, base * mult * mult]);
}
const answer = rows[2][2];
const explain = `Each row multiplies by ${mult}. Row 3: ${rows[2][0]} × ${mult} = ${rows[2][1]}, × ${mult} = ${answer}`;
rows[2][2] = ‘?’;
return { grid: rows.flat(), answer, explain };
},
() => {
const base = this.randInt(1, 4);
const grid = [
base, base * 2, base * 3,
base * 2, base * 4, base * 6,
base * 3, base * 6, base * 9
];
const answer = grid[8];
const explain = `Multiplication table pattern. Row × Column: 3 × 3 × ${base} = ${answer}`;
grid[8] = ‘?’;
return { grid, answer, explain };
},
() => {
const target = this.randInt(12, 24);
const a = [this.randInt(2, 6), this.randInt(2, 6)];
a.push(target - a[0] - a[1]);
const b = [this.randInt(2, 6), this.randInt(2, 6)];
b.push(target - b[0] - b[1]);
const c = [this.randInt(2, 6), this.randInt(2, 6)];
const answer = target - c[0] - c[1];
const grid = […a, …b, c[0], c[1], ‘?’];
const explain = `Each row sums to ${target}. ${c[0]} + ${c[1]} + ? = ${target}, so ? = ${answer}`;
return { grid, answer, explain };
}
];

```
const pattern = patterns[this.randInt(0, patterns.length - 1)]();
const options = this.generateOptions(pattern.answer, 4);

return {
  type: 'matrix',
  category: 'patternRecognition',
  difficulty: difficulty === 'hard' ? 1.4 : 1,
  categoryLabel: 'Matrix Pattern',
  question: 'Which number completes the grid?',
  grid: pattern.grid,
  answer: pattern.answer.toString(),
  options: options.map(String),
  explanation: pattern.explain,
  visual: 'matrix'
};
```

},

// ─── ODD ONE OUT ─────────────────────────────────────────────────────────
oddOneOut(difficulty) {
const sets = {
easy: [
{ items: [‘Apple’, ‘Banana’, ‘Carrot’, ‘Orange’], odd: ‘Carrot’, reason: ‘Carrot is a vegetable; the others are fruits’ },
{ items: [‘Dog’, ‘Cat’, ‘Fish’, ‘Bird’], odd: ‘Fish’, reason: ‘Fish lives in water; the others live on land’ },
{ items: [‘Red’, ‘Blue’, ‘Circle’, ‘Green’], odd: ‘Circle’, reason: ‘Circle is a shape; the others are colors’ },
{ items: [‘Car’, ‘Bike’, ‘Boat’, ‘Bus’], odd: ‘Boat’, reason: ‘Boat travels on water; the others travel on roads’ }
],
medium: [
{ items: [‘Compass’, ‘Ruler’, ‘Protractor’, ‘Hammer’], odd: ‘Hammer’, reason: ‘Hammer is for construction; the others are measuring/drawing tools’ },
{ items: [‘Piano’, ‘Guitar’, ‘Violin’, ‘Drum’], odd: ‘Drum’, reason: ‘Drum is a percussion instrument; the others are string/keyboard instruments’ },
{ items: [‘Mercury’, ‘Venus’, ‘Moon’, ‘Mars’], odd: ‘Moon’, reason: ‘Moon is a satellite; the others are planets’ },
{ items: [‘Whale’, ‘Shark’, ‘Dolphin’, ‘Seal’], odd: ‘Shark’, reason: ‘Shark is a fish; the others are mammals’ },
{ items: [‘Paris’, ‘Tokyo’, ‘London’, ‘Texas’], odd: ‘Texas’, reason: ‘Texas is a state/region; the others are capital cities’ },
{ items: [‘Novel’, ‘Poem’, ‘Dictionary’, ‘Story’], odd: ‘Dictionary’, reason: ‘Dictionary is a reference book; the others are creative writing’ }
],
hard: [
{ items: [‘Python’, ‘Java’, ‘English’, ‘Ruby’], odd: ‘English’, reason: ‘English is a natural language; the others are programming languages’ },
{ items: [‘Gold’, ‘Silver’, ‘Bronze’, ‘Diamond’], odd: ‘Diamond’, reason: ‘Diamond is a gemstone; the others are metals’ },
{ items: [‘Democracy’, ‘Republic’, ‘Monarchy’, ‘Capitalism’], odd: ‘Capitalism’, reason: ‘Capitalism is an economic system; the others are forms of government’ },
{ items: [‘Photosynthesis’, ‘Respiration’, ‘Digestion’, ‘Evaporation’], odd: ‘Evaporation’, reason: ‘Evaporation is a physical process; the others are biological processes’ },
{ items: [‘Sonnet’, ‘Haiku’, ‘Limerick’, ‘Essay’], odd: ‘Essay’, reason: ‘Essay is prose; the others are forms of poetry’ }
]
};

```
const levelSets = sets[difficulty] || sets.medium;
const set = levelSets[this.randInt(0, levelSets.length - 1)];
const shuffled = this.shuffle([...set.items]);

return {
  type: 'oddOneOut',
  category: 'commonSense',
  difficulty: difficulty === 'hard' ? 1.3 : 0.9,
  categoryLabel: 'Odd One Out',
  question: 'Which one doesn\'t belong?',
  answer: set.odd,
  options: shuffled,
  explanation: set.reason,
  visual: 'options'
};
```

},

// ─── ANALOGY ─────────────────────────────────────────────────────────────
analogy(difficulty) {
const analogies = {
easy: [
{ a: ‘Hot’, b: ‘Cold’, c: ‘Light’, answer: ‘Dark’, wrong: [‘Heavy’, ‘Bright’, ‘Lamp’], explain: ‘Hot is opposite of Cold, so Light is opposite of Dark’ },
{ a: ‘Puppy’, b: ‘Dog’, c: ‘Kitten’, answer: ‘Cat’, wrong: [‘Mouse’, ‘Pet’, ‘Fur’], explain: ‘Puppy grows into Dog, Kitten grows into Cat’ },
{ a: ‘Up’, b: ‘Down’, c: ‘Left’, answer: ‘Right’, wrong: [‘Forward’, ‘Side’, ‘Back’], explain: ‘Up/Down are opposites, Left/Right are opposites’ }
],
medium: [
{ a: ‘Bird’, b: ‘Nest’, c: ‘Bee’, answer: ‘Hive’, wrong: [‘Honey’, ‘Wing’, ‘Flower’], explain: ‘Bird lives in Nest, Bee lives in Hive’ },
{ a: ‘Author’, b: ‘Book’, c: ‘Chef’, answer: ‘Dish’, wrong: [‘Kitchen’, ‘Food’, ‘Menu’], explain: ‘Author creates Book, Chef creates Dish’ },
{ a: ‘Eye’, b: ‘See’, c: ‘Ear’, answer: ‘Hear’, wrong: [‘Sound’, ‘Music’, ‘Loud’], explain: ‘Eye is used to See, Ear is used to Hear’ },
{ a: ‘Car’, b: ‘Garage’, c: ‘Plane’, answer: ‘Hangar’, wrong: [‘Airport’, ‘Sky’, ‘Pilot’], explain: ‘Car is stored in Garage, Plane is stored in Hangar’ },
{ a: ‘Fish’, b: ‘Swim’, c: ‘Bird’, answer: ‘Fly’, wrong: [‘Feather’, ‘Nest’, ‘Sing’], explain: ‘Fish's movement is Swim, Bird's movement is Fly’ }
],
hard: [
{ a: ‘Scalpel’, b: ‘Surgeon’, c: ‘Gavel’, answer: ‘Judge’, wrong: [‘Lawyer’, ‘Court’, ‘Law’], explain: ‘Scalpel is a tool of Surgeon, Gavel is a tool of Judge’ },
{ a: ‘Caterpillar’, b: ‘Butterfly’, c: ‘Tadpole’, answer: ‘Frog’, wrong: [‘Water’, ‘Lily’, ‘Fish’], explain: ‘Caterpillar transforms into Butterfly, Tadpole transforms into Frog’ },
{ a: ‘Prologue’, b: ‘Epilogue’, c: ‘Dawn’, answer: ‘Dusk’, wrong: [‘Day’, ‘Night’, ‘Morning’], explain: ‘Prologue begins, Epilogue ends; Dawn begins day, Dusk ends day’ },
{ a: ‘Oxygen’, b: ‘Breathe’, c: ‘Food’, answer: ‘Eat’, wrong: [‘Hungry’, ‘Cook’, ‘Digest’], explain: ‘We Breathe to get Oxygen, we Eat to get Food (energy)’ }
]
};

```
const levelAnalogies = analogies[difficulty] || analogies.medium;
const analogy = levelAnalogies[this.randInt(0, levelAnalogies.length - 1)];
const options = this.shuffle([analogy.answer, ...analogy.wrong.slice(0, 3)]);

return {
  type: 'analogy',
  category: 'verbalReasoning',
  difficulty: difficulty === 'hard' ? 1.4 : 1,
  categoryLabel: 'Analogy',
  question: `${analogy.a} → ${analogy.b}  as  ${analogy.c} → ?`,
  answer: analogy.answer,
  options: options,
  explanation: analogy.explain,
  visual: 'analogy'
};
```

},

// ─── MATH PUZZLE ─────────────────────────────────────────────────────────
mathPuzzle(difficulty) {
const puzzles = {
easy: [
() => {
const a = this.randInt(5, 15);
const b = this.randInt(2, 10);
const answer = a + b;
return { question: `${a} + ${b} = ?`, answer, explain: `Simple addition: ${a} + ${b} = ${answer}` };
},
() => {
const a = this.randInt(10, 20);
const b = this.randInt(2, 9);
const answer = a - b;
return { question: `${a} - ${b} = ?`, answer, explain: `Simple subtraction: ${a} - ${b} = ${answer}` };
}
],
medium: [
() => {
const a = this.randInt(3, 9);
const b = this.randInt(3, 9);
const ops = [
{ sym: ‘+’, result: a + b },
{ sym: ‘-’, result: Math.abs(a - b) },
{ sym: ‘×’, result: a * b }
];
const op = ops[this.randInt(0, 2)];
return {
question: `${a} ? ${b} = ${op.result}`,
answer: op.sym,
options: [’+’, ‘-’, ‘×’, ‘÷’],
explain: `${a} ${op.sym} ${b} = ${op.result}`
};
},
() => {
const base = this.randInt(4, 10) * 10;
const pct = [10, 20, 25, 50][this.randInt(0, 3)];
const answer = (base * pct) / 100;
return { question: `What is ${pct}% of ${base}?`, answer, explain: `${pct}% = ${pct}/100 = ${pct/100}. ${base} × ${pct/100} = ${answer}` };
}
],
hard: [
() => {
const x = this.randInt(3, 12);
const a = this.randInt(2, 6);
const b = this.randInt(1, 15);
const result = x * a + b;
return { question: `If ${a}x + ${b} = ${result}, what is x?`, answer: x, explain: `${a}x + ${b} = ${result} → ${a}x = ${result - b} → x = ${(result-b)}/${a} = ${x}` };
},
() => {
const total = this.randInt(6, 12) * 12;
const ratioA = this.randInt(1, 3);
const ratioB = this.randInt(1, 3);
const sum = ratioA + ratioB;
const partA = (total * ratioA) / sum;
const answer = Math.max(partA, total - partA);
return { question: `Split ${total} in ratio ${ratioA}:${ratioB}. Larger part?`, answer, explain: `Total parts: ${sum}. Each part = ${total}/${sum} = ${total/sum}. Larger = ${answer}` };
},
() => {
const a = this.randInt(2, 5);
const b = this.randInt(2, 5);
const answer = a * a + b * b;
return { question: `${a}² + ${b}² = ?`, answer, explain: `${a}² = ${a*a}, ${b}² = ${b*b}. Sum = ${answer}` };
}
]
};

```
const levelPuzzles = puzzles[difficulty] || puzzles.medium;
const puzzle = levelPuzzles[this.randInt(0, levelPuzzles.length - 1)]();
const options = puzzle.options || this.generateOptions(puzzle.answer, 4);

return {
  type: 'mathPuzzle',
  category: 'mentalAgility',
  difficulty: difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.7 : 1,
  categoryLabel: 'Mental Math',
  question: puzzle.question,
  answer: puzzle.answer.toString(),
  options: options.map ? options.map(String) : options,
  explanation: puzzle.explain,
  visual: 'options'
};
```

},

// ─── SPATIAL ROTATION ────────────────────────────────────────────────────
spatialRotation(difficulty) {
const shapes = [
{ base: ‘▲’, rotations: [‘▲’, ‘►’, ‘▼’, ‘◄’] },
{ base: ‘◢’, rotations: [‘◢’, ‘◣’, ‘◤’, ‘◥’] }
];

```
const shape = shapes[this.randInt(0, shapes.length - 1)];
const startIdx = this.randInt(0, 3);
const rotations = difficulty === 'easy' ? 1 : this.randInt(1, 3);
const endIdx = (startIdx + rotations) % 4;
const degrees = rotations * 90;

return {
  type: 'spatial',
  category: 'spatialAwareness',
  difficulty: difficulty === 'hard' ? 1.3 : 0.9,
  categoryLabel: 'Spatial Reasoning',
  question: `Rotate ${degrees}° clockwise`,
  startShape: shape.rotations[startIdx],
  answer: shape.rotations[endIdx],
  options: this.shuffle([...shape.rotations]),
  explanation: `Rotating ${degrees}° clockwise: ${shape.rotations[startIdx]} becomes ${shape.rotations[endIdx]}`,
  visual: 'spatial'
};
```

},

// ─── EMOTIONAL SCENARIO ──────────────────────────────────────────────────
emotionalScenario(difficulty) {
const scenarios = [
{
situation: “Your friend seems upset but says ‘I’m fine.’ Best response?”,
answer: “Give them space but let them know you’re there”,
wrong: [“Keep pushing them to talk”, “Ignore it completely”, “Tell others about it”],
explain: “Respecting their space while showing support lets them open up when ready”
},
{
situation: “A coworker criticizes your work in a meeting. What do you do?”,
answer: “Stay calm and address it privately later”,
wrong: [“Argue back immediately”, “Sulk and say nothing”, “Complain to your boss”],
explain: “Staying composed maintains professionalism; private discussion allows honest resolution”
},
{
situation: “You made a mistake that affected your team. Best approach?”,
answer: “Admit it quickly and help fix it”,
wrong: [“Blame someone else”, “Hope no one notices”, “Make excuses”],
explain: “Taking responsibility builds trust and allows the team to focus on solutions”
},
{
situation: “Someone disagrees with your opinion strongly. You should:”,
answer: “Listen to understand their perspective”,
wrong: [“Insist you’re right”, “End the conversation”, “Get defensive”],
explain: “Understanding different viewpoints leads to better discussions and solutions”
},
{
situation: “A friend cancels plans last minute. They seem stressed. Best response?”,
answer: “Express understanding and offer support”,
wrong: [“Get angry at them”, “Make them feel guilty”, “Give them the silent treatment”],
explain: “Showing empathy strengthens relationships and helps friends in tough times”
}
];

```
const scenario = scenarios[this.randInt(0, scenarios.length - 1)];
const options = this.shuffle([scenario.answer, ...scenario.wrong]);

return {
  type: 'emotional',
  category: 'emotionalIntelligence',
  difficulty: 1.1,
  categoryLabel: 'Emotional Intelligence',
  question: scenario.situation,
  answer: scenario.answer,
  options: options,
  explanation: scenario.explain,
  visual: 'emotional'
};
```

},

// ─── LOGIC PUZZLE ────────────────────────────────────────────────────────
logicPuzzle(difficulty) {
const puzzles = {
easy: [
{
question: “Tom is taller than Sam. Sam is taller than Mike. Who is shortest?”,
answer: “Mike”,
wrong: [“Tom”, “Sam”, “Can’t tell”],
explain: “If Tom > Sam > Mike in height, Mike is the shortest”
},
{
question: “All dogs have tails. Max is a dog. Therefore:”,
answer: “Max has a tail”,
wrong: [“Max might not have a tail”, “Max is not a dog”, “Dogs don’t have tails”],
explain: “If all dogs have tails and Max is a dog, Max must have a tail”
}
],
medium: [
{
question: “If it rains, the ground is wet. The ground is wet. What can we conclude?”,
answer: “It might have rained”,
wrong: [“It definitely rained”, “It didn’t rain”, “It will rain”],
explain: “The ground could be wet from other causes (sprinkler, etc.), so rain is possible but not certain”
},
{
question: “All roses are flowers. Some flowers fade quickly. Which is definitely true?”,
answer: “All roses are flowers”,
wrong: [“All roses fade”, “No roses fade”, “Some roses aren’t flowers”],
explain: “We only know roses are flowers; we can’t be certain about which flowers fade”
},
{
question: “If A then B. If B then C. A is true. What else must be true?”,
answer: “Both B and C”,
wrong: [“Only B”, “Only C”, “Neither B nor C”],
explain: “A→B and A is true, so B is true. B→C and B is true, so C is also true”
}
],
hard: [
{
question: “No cats are dogs. Some pets are cats. Therefore:”,
answer: “Some pets are not dogs”,
wrong: [“All pets are cats”, “No pets are dogs”, “All cats are pets”],
explain: “If some pets are cats, and no cats are dogs, those pet-cats are definitely not dogs”
},
{
question: “If P then Q. If Q then R. Not R. What can we conclude?”,
answer: “Not P and not Q”,
wrong: [“P is true”, “Only not Q”, “Q is true”],
explain: “Working backwards: Not R means Not Q (contrapositive of Q→R). Not Q means Not P (contrapositive of P→Q)”
}
]
};

```
const levelPuzzles = puzzles[difficulty] || puzzles.medium;
const puzzle = levelPuzzles[this.randInt(0, levelPuzzles.length - 1)];
const options = this.shuffle([puzzle.answer, ...puzzle.wrong]);

return {
  type: 'logic',
  category: 'problemSolving',
  difficulty: difficulty === 'hard' ? 1.6 : 1.1,
  categoryLabel: 'Logic',
  question: puzzle.question,
  answer: puzzle.answer,
  options: options,
  explanation: puzzle.explain,
  visual: 'options'
};
```

},

// ─── VERBAL REASONING ────────────────────────────────────────────────────
verbalReasoning(difficulty) {
const puzzles = [
{
question: “HAPPY is to SAD as LOUD is to:”,
answer: “QUIET”,
wrong: [“NOISY”, “SOUND”, “SOFT”],
explain: “Happy/Sad are antonyms (opposites), so Loud’s antonym is Quiet”
},
{
question: “Complete: BOOK, COOK, LOOK, ____”,
answer: “HOOK”,
wrong: [“TOOK”, “ROOK”, “NOOK”],
explain: “Pattern uses _OOK words. While all options fit, HOOK follows alphabetically after B, C, L…”
},
{
question: “Which word means the same as ‘SWIFT’?”,
answer: “FAST”,
wrong: [“SLOW”, “HEAVY”, “BIRD”],
explain: “Swift means moving quickly, which is the same as fast”
},
{
question: “Rearrange to make a word: T-A-R-E-W”,
answer: “WATER”,
wrong: [“LATER”, “WAGER”, “TRAWL”],
explain: “The letters T-A-R-E-W rearrange to spell WATER”
},
{
question: “Which word is most different from the others?”,
answer: “BOOK”,
items: [“PEN”, “PENCIL”, “BOOK”, “MARKER”],
wrong: [“PEN”, “PENCIL”, “MARKER”],
explain: “Pen, Pencil, and Marker are writing tools; Book is for reading”
}
];

```
const puzzle = puzzles[this.randInt(0, puzzles.length - 1)];
const options = this.shuffle([puzzle.answer, ...puzzle.wrong]);

return {
  type: 'verbal',
  category: 'verbalReasoning',
  difficulty: difficulty === 'hard' ? 1.3 : 1,
  categoryLabel: 'Verbal Reasoning',
  question: puzzle.question,
  answer: puzzle.answer,
  options: options,
  explanation: puzzle.explain,
  visual: 'options'
};
```

},

// ─── MISSING LETTER ──────────────────────────────────────────────────────
missingLetter(difficulty) {
const puzzles = [
{ pattern: [‘A’, ‘C’, ‘E’, ‘G’, ‘?’], answer: ‘I’, explain: ‘Skipping one letter each time: A, (B), C, (D), E, (F), G, (H), I’ },
{ pattern: [‘Z’, ‘X’, ‘V’, ‘T’, ‘?’], answer: ‘R’, explain: ‘Going backwards, skipping one: Z, (Y), X, (W), V, (U), T, (S), R’ },
{ pattern: [‘B’, ‘D’, ‘F’, ‘H’, ‘?’], answer: ‘J’, explain: ‘Every other letter: B, D, F, H, J (even positions in alphabet)’ },
{ pattern: [‘A’, ‘B’, ‘D’, ‘G’, ‘?’], answer: ‘K’, explain: ‘Gaps increase: +1, +2, +3, +4. G + 4 = K’ },
{ pattern: [‘M’, ‘N’, ‘O’, ‘P’, ‘?’], answer: ‘Q’, explain: ‘Consecutive letters: M, N, O, P, Q’ }
];

```
const puzzle = puzzles[this.randInt(0, puzzles.length - 1)];
const wrongLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== puzzle.answer);
const wrong = this.shuffle(wrongLetters).slice(0, 3);
const options = this.shuffle([puzzle.answer, ...wrong]);

return {
  type: 'missingLetter',
  category: 'patternRecognition',
  difficulty: difficulty === 'hard' ? 1.2 : 0.9,
  categoryLabel: 'Letter Pattern',
  question: 'What letter comes next?',
  sequence: puzzle.pattern.slice(0, -1),
  answer: puzzle.answer,
  options: options,
  explanation: puzzle.explain,
  visual: 'letterSequence'
};
```

},

// ─── HELPERS ─────────────────────────────────────────────────────────────
randInt(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min;
},

shuffle(arr) {
const result = […arr];
for (let i = result.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[result[i], result[j]] = [result[j], result[i]];
}
return result;
},

generateOptions(correct, count) {
const options = [correct];
const variance = Math.max(3, Math.abs(correct) * 0.35);

```
while (options.length < count) {
  let candidate;
  const type = Math.random();
  
  if (type < 0.25) {
    candidate = correct + this.randInt(1, Math.ceil(variance));
  } else if (type < 0.5) {
    candidate = correct - this.randInt(1, Math.ceil(variance));
  } else if (type < 0.7) {
    candidate = correct + this.randInt(-2, 2) + Math.floor(variance / 2);
  } else {
    candidate = Math.round(correct * (0.7 + Math.random() * 0.6));
  }
  
  if (candidate > 0 && !options.includes(candidate) && candidate !== correct) {
    options.push(candidate);
  }
}

return this.shuffle(options);
```

}
};