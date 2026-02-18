// ─── QUESTION GENERATOR ────────────────────────────────────────────────────
// Generates infinite, non-repetitive IQ test questions

const QuestionGenerator = {
  // Track recent questions to avoid repetition
  recentQuestions: [],
  maxRecent: 50,

  // Generate a random question
  generate() {
    const generators = [
      this.numberSequence,
      this.matrixPattern,
      this.oddOneOut,
      this.analogy,
      this.mathPuzzle,
      this.spatialRotation,
      this.emotionalScenario,
      this.logicPuzzle,
      this.memoryPattern,
      this.wordPattern
    ];

    // Weighted selection based on variety
    const weights = [15, 15, 12, 12, 12, 10, 8, 8, 4, 4];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedGen;
    for (let i = 0; i < generators.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedGen = generators[i];
        break;
      }
    }

    const question = selectedGen.call(this);
    
    // Track to avoid immediate repetition
    const hash = JSON.stringify(question.answer);
    if (this.recentQuestions.includes(hash)) {
      return this.generate(); // Regenerate if too similar
    }
    this.recentQuestions.push(hash);
    if (this.recentQuestions.length > this.maxRecent) {
      this.recentQuestions.shift();
    }

    return question;
  },

  // ─── NUMBER SEQUENCE ─────────────────────────────────────────────────────
  numberSequence() {
    const patterns = [
      // Multiplication
      () => {
        const mult = this.randInt(2, 4);
        const start = this.randInt(1, 5);
        const seq = [];
        let val = start;
        for (let i = 0; i < 5; i++) {
          seq.push(val);
          val *= mult;
        }
        return { seq: seq.slice(0, 4), answer: seq[4], hint: `×${mult}` };
      },
      // Addition
      () => {
        const add = this.randInt(3, 12);
        const start = this.randInt(1, 10);
        const seq = [];
        let val = start;
        for (let i = 0; i < 5; i++) {
          seq.push(val);
          val += add;
        }
        return { seq: seq.slice(0, 4), answer: seq[4], hint: `+${add}` };
      },
      // Squares
      () => {
        const offset = this.randInt(0, 3);
        const seq = [];
        for (let i = 1; i <= 5; i++) {
          seq.push((i + offset) ** 2);
        }
        return { seq: seq.slice(0, 4), answer: seq[4], hint: 'n²' };
      },
      // Fibonacci-like
      () => {
        const a = this.randInt(1, 5);
        const b = this.randInt(1, 5);
        const seq = [a, b];
        for (let i = 2; i < 6; i++) {
          seq.push(seq[i-1] + seq[i-2]);
        }
        return { seq: seq.slice(0, 5), answer: seq[5], hint: 'a+b=c' };
      },
      // Alternating operations
      () => {
        const start = this.randInt(2, 6);
        const mult = this.randInt(2, 3);
        const add = this.randInt(1, 5);
        const seq = [start];
        for (let i = 1; i < 6; i++) {
          if (i % 2 === 1) seq.push(seq[i-1] * mult);
          else seq.push(seq[i-1] + add);
        }
        return { seq: seq.slice(0, 5), answer: seq[5], hint: `×${mult}, +${add}` };
      },
      // Cubes
      () => {
        const offset = this.randInt(0, 2);
        const seq = [];
        for (let i = 1; i <= 5; i++) {
          seq.push((i + offset) ** 3);
        }
        return { seq: seq.slice(0, 4), answer: seq[4], hint: 'n³' };
      },
      // Primes
      () => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
        const start = this.randInt(0, 5);
        const seq = primes.slice(start, start + 5);
        return { seq: seq.slice(0, 4), answer: seq[4], hint: 'primes' };
      },
      // Triangular numbers
      () => {
        const seq = [];
        for (let i = 1; i <= 6; i++) {
          seq.push((i * (i + 1)) / 2);
        }
        return { seq: seq.slice(0, 5), answer: seq[5], hint: 'triangular' };
      }
    ];

    const pattern = patterns[this.randInt(0, patterns.length - 1)]();
    const answer = pattern.answer;
    const options = this.generateOptions(answer, 4);

    return {
      type: 'numberSequence',
      category: 'patternRecognition',
      difficulty: pattern.seq.some(n => n > 100) ? 2 : 1,
      categoryLabel: 'Number Sequence',
      question: `What comes next?`,
      sequence: pattern.seq,
      answer: answer.toString(),
      options: options.map(String),
      visual: 'sequence'
    };
  },

  // ─── MATRIX PATTERN ──────────────────────────────────────────────────────
  matrixPattern() {
    const patterns = [
      // Row multiplication
      () => {
        const mult = this.randInt(2, 4);
        const rows = [];
        for (let r = 0; r < 3; r++) {
          const base = this.randInt(2, 6) + r;
          rows.push([base, base * mult, base * mult * mult]);
        }
        const answer = rows[2][2];
        rows[2][2] = '?';
        return { grid: rows.flat(), answer };
      },
      // Column addition
      () => {
        const adds = [this.randInt(2, 5), this.randInt(2, 5), this.randInt(2, 5)];
        const rows = [];
        for (let r = 0; r < 3; r++) {
          rows.push(adds.map((a, c) => a * (r + 1)));
        }
        const answer = rows[2][2];
        rows[2][2] = '?';
        return { grid: rows.flat(), answer };
      },
      // Diagonal pattern
      () => {
        const base = this.randInt(1, 5);
        const mult = this.randInt(2, 3);
        const grid = [
          base, base * 2, base * 3,
          base * 2, base * 4, base * 6,
          base * 3, base * 6, base * 9
        ];
        const answer = grid[8];
        grid[8] = '?';
        return { grid, answer };
      },
      // Sum pattern (each row sums to same)
      () => {
        const target = this.randInt(15, 30);
        const a1 = this.randInt(2, 8);
        const a2 = this.randInt(2, 8);
        const a3 = target - a1 - a2;
        const b1 = this.randInt(2, 8);
        const b2 = this.randInt(2, 8);
        const b3 = target - b1 - b2;
        const c1 = this.randInt(2, 8);
        const c2 = this.randInt(2, 8);
        const answer = target - c1 - c2;
        const grid = [a1, a2, a3, b1, b2, b3, c1, c2, '?'];
        return { grid, answer };
      }
    ];

    const pattern = patterns[this.randInt(0, patterns.length - 1)]();
    const options = this.generateOptions(pattern.answer, 4);

    return {
      type: 'matrix',
      category: 'patternRecognition',
      difficulty: 1.5,
      categoryLabel: 'Pattern Recognition',
      question: 'Which number completes the matrix?',
      grid: pattern.grid,
      answer: pattern.answer.toString(),
      options: options.map(String),
      visual: 'matrix'
    };
  },

  // ─── ODD ONE OUT ─────────────────────────────────────────────────────────
  oddOneOut() {
    const sets = [
      { items: ['Compass', 'Ruler', 'Protractor', 'Hammer'], odd: 'Hammer', reason: 'measuring tools' },
      { items: ['Apple', 'Banana', 'Carrot', 'Orange'], odd: 'Carrot', reason: 'fruits' },
      { items: ['Piano', 'Guitar', 'Violin', 'Drum'], odd: 'Drum', reason: 'stringed instruments' },
      { items: ['Mercury', 'Venus', 'Moon', 'Mars'], odd: 'Moon', reason: 'planets' },
      { items: ['Whale', 'Shark', 'Dolphin', 'Seal'], odd: 'Shark', reason: 'mammals' },
      { items: ['Paris', 'Tokyo', 'London', 'California'], odd: 'California', reason: 'cities' },
      { items: ['Triangle', 'Square', 'Circle', 'Pentagon'], odd: 'Circle', reason: 'polygons' },
      { items: ['Novel', 'Poem', 'Magazine', 'Dictionary'], odd: 'Dictionary', reason: 'creative writing' },
      { items: ['Run', 'Walk', 'Sprint', 'Think'], odd: 'Think', reason: 'physical movements' },
      { items: ['Red', 'Blue', 'Green', 'Rough'], odd: 'Rough', reason: 'colors' },
      { items: ['Coffee', 'Tea', 'Juice', 'Bread'], odd: 'Bread', reason: 'beverages' },
      { items: ['Chair', 'Table', 'Lamp', 'Desk'], odd: 'Lamp', reason: 'furniture' },
      { items: ['Eagle', 'Sparrow', 'Penguin', 'Owl'], odd: 'Penguin', reason: 'flying birds' },
      { items: ['Gold', 'Silver', 'Bronze', 'Diamond'], odd: 'Diamond', reason: 'metals' },
      { items: ['January', 'March', 'April', 'June'], odd: 'January', reason: '30-day months' },
      { items: ['Python', 'Java', 'English', 'Ruby'], odd: 'English', reason: 'programming languages' },
      { items: ['Butter', 'Cheese', 'Yogurt', 'Honey'], odd: 'Honey', reason: 'dairy products' },
      { items: ['Doctor', 'Lawyer', 'Teacher', 'Patient'], odd: 'Patient', reason: 'professions' },
      { items: ['Elbow', 'Knee', 'Wrist', 'Liver'], odd: 'Liver', reason: 'joints' },
      { items: ['Oak', 'Pine', 'Maple', 'Rose'], odd: 'Rose', reason: 'trees' }
    ];

    const set = sets[this.randInt(0, sets.length - 1)];
    const shuffled = this.shuffle([...set.items]);

    return {
      type: 'oddOneOut',
      category: 'commonSense',
      difficulty: 1,
      categoryLabel: 'Odd One Out',
      question: 'Which word does not belong?',
      answer: set.odd,
      options: shuffled,
      hint: `Others are ${set.reason}`,
      visual: 'options'
    };
  },

  // ─── ANALOGY ─────────────────────────────────────────────────────────────
  analogy() {
    const analogies = [
      { a: 'Hot', b: 'Cold', c: 'Light', answer: 'Dark', wrong: ['Heavy', 'Bright', 'Lamp'] },
      { a: 'Bird', b: 'Nest', c: 'Bee', answer: 'Hive', wrong: ['Honey', 'Wing', 'Flower'] },
      { a: 'Page', b: 'Book', c: 'Song', answer: 'Album', wrong: ['Singer', 'Radio', 'Music'] },
      { a: 'Finger', b: 'Hand', c: 'Toe', answer: 'Foot', wrong: ['Leg', 'Shoe', 'Walk'] },
      { a: 'Puppy', b: 'Dog', c: 'Kitten', answer: 'Cat', wrong: ['Mouse', 'Pet', 'Fur'] },
      { a: 'Rain', b: 'Umbrella', c: 'Sun', answer: 'Shade', wrong: ['Beach', 'Hat', 'Hot'] },
      { a: 'Author', b: 'Book', c: 'Chef', answer: 'Dish', wrong: ['Kitchen', 'Food', 'Menu'] },
      { a: 'Eye', b: 'See', c: 'Ear', answer: 'Hear', wrong: ['Sound', 'Music', 'Loud'] },
      { a: 'Car', b: 'Garage', c: 'Plane', answer: 'Hangar', wrong: ['Airport', 'Sky', 'Pilot'] },
      { a: 'Teacher', b: 'School', c: 'Doctor', answer: 'Hospital', wrong: ['Patient', 'Medicine', 'Nurse'] },
      { a: 'Fish', b: 'Swim', c: 'Bird', answer: 'Fly', wrong: ['Feather', 'Nest', 'Sing'] },
      { a: 'Key', b: 'Lock', c: 'Password', answer: 'Account', wrong: ['Computer', 'Safe', 'Secret'] },
      { a: 'Canvas', b: 'Painter', c: 'Stage', answer: 'Actor', wrong: ['Theater', 'Play', 'Curtain'] },
      { a: 'Sword', b: 'Knight', c: 'Wand', answer: 'Wizard', wrong: ['Magic', 'Castle', 'Hat'] }
    ];

    const analogy = analogies[this.randInt(0, analogies.length - 1)];
    const options = this.shuffle([analogy.answer, ...analogy.wrong.slice(0, 3)]);

    return {
      type: 'analogy',
      category: 'problemSolving',
      difficulty: 1.2,
      categoryLabel: 'Analogy',
      question: `${analogy.a} is to ${analogy.b} as ${analogy.c} is to...?`,
      answer: analogy.answer,
      options: options,
      visual: 'options'
    };
  },

  // ─── MATH PUZZLE ─────────────────────────────────────────────────────────
  mathPuzzle() {
    const puzzles = [
      // Missing operator
      () => {
        const a = this.randInt(2, 12);
        const b = this.randInt(2, 12);
        const ops = [
          { sym: '+', result: a + b },
          { sym: '-', result: a - b },
          { sym: '×', result: a * b }
        ];
        const op = ops[this.randInt(0, 2)];
        return {
          question: `${a} ? ${b} = ${op.result}`,
          answer: op.sym,
          options: ['+', '-', '×', '÷']
        };
      },
      // Find X
      () => {
        const x = this.randInt(2, 15);
        const a = this.randInt(2, 8);
        const b = this.randInt(1, 20);
        const result = x * a + b;
        return {
          question: `If ${a}x + ${b} = ${result}, what is x?`,
          answer: x,
          options: this.generateOptions(x, 4)
        };
      },
      // Percentage
      () => {
        const base = this.randInt(2, 10) * 10;
        const pct = [10, 20, 25, 50][this.randInt(0, 3)];
        const answer = (base * pct) / 100;
        return {
          question: `What is ${pct}% of ${base}?`,
          answer: answer,
          options: this.generateOptions(answer, 4)
        };
      },
      // Ratio
      () => {
        const total = this.randInt(5, 15) * 6;
        const ratioA = this.randInt(1, 3);
        const ratioB = this.randInt(1, 3);
        const sum = ratioA + ratioB;
        const partA = (total * ratioA) / sum;
        return {
          question: `Split ${total} in ratio ${ratioA}:${ratioB}. What is the larger part?`,
          answer: Math.max(partA, total - partA),
          options: this.generateOptions(Math.max(partA, total - partA), 4)
        };
      }
    ];

    const puzzle = puzzles[this.randInt(0, puzzles.length - 1)]();

    return {
      type: 'mathPuzzle',
      category: 'mentalAgility',
      difficulty: 1.3,
      categoryLabel: 'Mental Math',
      question: puzzle.question,
      answer: puzzle.answer.toString(),
      options: puzzle.options.map(String),
      visual: 'options'
    };
  },

  // ─── SPATIAL ROTATION ────────────────────────────────────────────────────
  spatialRotation() {
    // Simple shape rotation using Unicode symbols
    const shapes = [
      { name: '→', rotations: ['→', '↓', '←', '↑'] },
      { name: '◢', rotations: ['◢', '◣', '◤', '◥'] },
      { name: '⊏', rotations: ['⊏', '⊐', '⊐', '⊏'] }
    ];

    const shape = shapes[this.randInt(0, shapes.length - 1)];
    const startIdx = this.randInt(0, 3);
    const rotations = this.randInt(1, 3);
    const endIdx = (startIdx + rotations) % 4;

    const rotationText = rotations === 1 ? '90°' : rotations === 2 ? '180°' : '270°';
    
    return {
      type: 'spatial',
      category: 'problemSolving',
      difficulty: 1.4,
      categoryLabel: 'Spatial Reasoning',
      question: `Rotate ${shape.rotations[startIdx]} by ${rotationText} clockwise`,
      answer: shape.rotations[endIdx],
      options: this.shuffle(shape.rotations),
      visual: 'options'
    };
  },

  // ─── EMOTIONAL SCENARIO ──────────────────────────────────────────────────
  emotionalScenario() {
    const scenarios = [
      {
        situation: "Your friend cancels plans last minute. They seem stressed. What's the best response?",
        answer: "Check if they're okay and offer support",
        wrong: ["Get angry and confront them", "Ignore them for a week", "Immediately make new plans"]
      },
      {
        situation: "A colleague takes credit for your idea in a meeting. What's the most effective response?",
        answer: "Privately discuss it with them after",
        wrong: ["Call them out publicly", "Never share ideas again", "Complain to everyone"]
      },
      {
        situation: "You notice a friend has been withdrawn lately. What should you do?",
        answer: "Gently ask if they want to talk",
        wrong: ["Assume they want space", "Tell others about it", "Pretend not to notice"]
      },
      {
        situation: "Someone criticizes your work unfairly. The best approach is to:",
        answer: "Listen, then calmly explain your perspective",
        wrong: ["Criticize their work back", "Accept all criticism silently", "Walk away angrily"]
      },
      {
        situation: "Your team disagrees on an approach. As a member, you should:",
        answer: "Listen to all views before suggesting compromise",
        wrong: ["Insist on your way", "Stay silent to avoid conflict", "Side with the majority"]
      }
    ];

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
      visual: 'emotional'
    };
  },

  // ─── LOGIC PUZZLE ────────────────────────────────────────────────────────
  logicPuzzle() {
    const puzzles = [
      {
        question: "All roses are flowers. Some flowers fade quickly. Which is definitely true?",
        answer: "All roses are flowers",
        wrong: ["All roses fade quickly", "No roses fade quickly", "Some roses aren't flowers"]
      },
      {
        question: "If it rains, the ground is wet. The ground is wet. What can we conclude?",
        answer: "It might have rained",
        wrong: ["It definitely rained", "It didn't rain", "It will rain soon"]
      },
      {
        question: "Tom is taller than Sam. Sam is taller than Mike. Who is shortest?",
        answer: "Mike",
        wrong: ["Tom", "Sam", "Cannot determine"]
      },
      {
        question: "If A, then B. If B, then C. A is true. What else is true?",
        answer: "Both B and C",
        wrong: ["Only B", "Only C", "Neither B nor C"]
      },
      {
        question: "No cats are dogs. Some pets are cats. Therefore:",
        answer: "Some pets are not dogs",
        wrong: ["No pets are dogs", "All pets are cats", "Some dogs are pets"]
      }
    ];

    const puzzle = puzzles[this.randInt(0, puzzles.length - 1)];
    const options = this.shuffle([puzzle.answer, ...puzzle.wrong]);

    return {
      type: 'logic',
      category: 'problemSolving',
      difficulty: 1.5,
      categoryLabel: 'Logic',
      question: puzzle.question,
      answer: puzzle.answer,
      options: options,
      visual: 'options'
    };
  },

  // ─── MEMORY PATTERN ──────────────────────────────────────────────────────
  memoryPattern() {
    // This creates a visual pattern the user must remember
    const colors = ['🔴', '🔵', '🟢', '🟡'];
    const length = this.randInt(4, 6);
    const pattern = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(colors[this.randInt(0, 3)]);
    }

    // Ask about a specific position
    const askPos = this.randInt(0, length - 1);
    const posWord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][askPos];

    return {
      type: 'memory',
      category: 'memory',
      difficulty: 1.2 + (length - 4) * 0.2,
      categoryLabel: 'Memory',
      question: `What was the ${posWord} color?`,
      pattern: pattern,
      answer: pattern[askPos],
      options: this.shuffle([...colors]),
      visual: 'memory'
    };
  },

  // ─── WORD PATTERN ────────────────────────────────────────────────────────
  wordPattern() {
    const patterns = [
      { words: ['CAT', 'DOG', 'COW', 'PIG'], pattern: '3-letter animals', next: 'ANT' },
      { words: ['RED', 'BLUE', 'GREEN', 'PINK'], pattern: 'colors', next: 'GRAY' },
      { words: ['AB', 'ABC', 'ABCD', 'ABCDE'], pattern: 'growing alphabet', next: 'ABCDEF' },
      { words: ['ONE', 'TWO', 'THREE', 'FOUR'], pattern: 'number words', next: 'FIVE' },
      { words: ['JAN', 'FEB', 'MAR', 'APR'], pattern: 'months', next: 'MAY' }
    ];

    const p = patterns[this.randInt(0, patterns.length - 1)];
    const wrongAnswers = ['NONE', 'SAME', 'STOP'].filter(w => w !== p.next);
    wrongAnswers.push(patterns.find(x => x.next !== p.next)?.next || 'OTHER');
    
    return {
      type: 'wordPattern',
      category: 'patternRecognition',
      difficulty: 1.3,
      categoryLabel: 'Word Pattern',
      question: 'What comes next in this sequence?',
      sequence: p.words,
      answer: p.next,
      options: this.shuffle([p.next, ...wrongAnswers.slice(0, 3)]),
      visual: 'wordSequence'
    };
  },

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  generateOptions(correct, count) {
    const options = [correct];
    const variance = Math.max(3, Math.abs(correct) * 0.3);
    
    while (options.length < count) {
      let candidate;
      const type = Math.random();
      
      if (type < 0.3) {
        candidate = correct + this.randInt(1, Math.ceil(variance));
      } else if (type < 0.6) {
        candidate = correct - this.randInt(1, Math.ceil(variance));
      } else if (type < 0.8) {
        candidate = correct * 2;
      } else {
        candidate = Math.round(correct * (0.5 + Math.random()));
      }
      
      if (candidate > 0 && !options.includes(candidate)) {
        options.push(candidate);
      }
    }
    
    return this.shuffle(options);
  }
};