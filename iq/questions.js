const QuestionGenerator = {
  age: 25,
  recent: [],

  setAge(a) { this.age = a || 25; },

  getDiff() {
    if (this.age < 12) return 'easy';
    if (this.age < 16) return 'medium';
    if (this.age < 55) return 'hard';
    return 'medium';
  },

  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  genOpts(correct, n) {
    const opts = [correct];
    const range = Math.max(5, Math.abs(correct) * 0.4);
    while (opts.length < n) {
      let c = correct + this.rand(-Math.ceil(range), Math.ceil(range));
      if (c > 0 && !opts.includes(c) && c !== correct) opts.push(c);
    }
    return this.shuffle(opts);
  },

  generate() {
    const types = [
      this.numberSeq,
      this.matrix,
      this.oddOne,
      this.analogy,
      this.math,
      this.logic,
      this.verbal,
      this.letterSeq,
      this.spatial,
      this.missingNumber,
      this.wordMeaning,
      this.seriesComplete,
      this.codeBreak,
      this.visualPattern,
      this.emotionalIQ
    ];
    
    const q = types[this.rand(0, types.length - 1)].call(this);
    
    const hash = q.type + q.answer;
    if (this.recent.includes(hash)) return this.generate();
    this.recent.push(hash);
    if (this.recent.length > 30) this.recent.shift();
    
    return q;
  },

  numberSeq() {
    const diff = this.getDiff();
    const patterns = [
      // Addition
      () => {
        const add = diff === 'easy' ? this.rand(2, 5) : this.rand(3, 9);
        const start = this.rand(1, 15);
        const seq = []; let v = start;
        for (let i = 0; i < 5; i++) { seq.push(v); v += add; }
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Add ${add} each time. ${seq[3]} + ${add} = ${seq[4]}` };
      },
      // Multiplication
      () => {
        const mult = diff === 'easy' ? 2 : this.rand(2, 4);
        const start = this.rand(1, 5);
        const seq = []; let v = start;
        for (let i = 0; i < 5; i++) { seq.push(v); v *= mult; }
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Multiply by ${mult}. ${seq[3]} × ${mult} = ${seq[4]}` };
      },
      // Squares
      () => {
        const off = this.rand(1, 4);
        const seq = [];
        for (let i = 1; i <= 5; i++) seq.push((i + off) ** 2);
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Perfect squares: ${off+1}², ${off+2}²... = ${seq[4]}` };
      },
      // Fibonacci-like
      () => {
        const a = this.rand(1, 4), b = this.rand(2, 5);
        const seq = [a, b];
        for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
        return { seq: seq.slice(0, 5), ans: seq[5], exp: `Each = sum of previous two. ${seq[3]} + ${seq[4]} = ${seq[5]}` };
      },
      // Subtract
      () => {
        const sub = this.rand(3, 7);
        const start = this.rand(40, 60);
        const seq = []; let v = start;
        for (let i = 0; i < 5; i++) { seq.push(v); v -= sub; }
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Subtract ${sub} each time. ${seq[3]} - ${sub} = ${seq[4]}` };
      },
      // Double then add
      () => {
        const add = this.rand(1, 3);
        const start = this.rand(1, 4);
        const seq = [start];
        for (let i = 1; i < 5; i++) seq.push(seq[i-1] * 2 + add);
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Double and add ${add}. (${seq[3]} × 2) + ${add} = ${seq[4]}` };
      }
    ];
    
    const p = patterns[this.rand(0, patterns.length - 1)]();
    
    return {
      type: 'numberSeq',
      category: 'patternRecognition',
      categoryLabel: 'Number Sequence',
      difficulty: diff === 'hard' ? 1.3 : 1,
      question: 'What comes next?',
      sequence: p.seq,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'sequence'
    };
  },

  matrix() {
    const patterns = [
      // Row multiply
      () => {
        const m = this.rand(2, 3);
        const rows = [];
        for (let r = 0; r < 3; r++) {
          const b = this.rand(2, 5) + r;
          rows.push([b, b * m, b * m * m]);
        }
        const ans = rows[2][2];
        const exp = `Each row × ${m}. ${rows[2][0]} × ${m} × ${m} = ${ans}`;
        rows[2][2] = '?';
        return { grid: rows.flat(), ans, exp };
      },
      // Row sum
      () => {
        const sum = this.rand(15, 24);
        const makeRow = () => {
          const a = this.rand(2, 7), b = this.rand(2, 7);
          return [a, b, sum - a - b];
        };
        const r1 = makeRow(), r2 = makeRow();
        const c1 = this.rand(2, 7), c2 = this.rand(2, 7);
        const ans = sum - c1 - c2;
        return { grid: [...r1, ...r2, c1, c2, '?'], ans, exp: `Each row sums to ${sum}. ${c1} + ${c2} + ? = ${sum}` };
      },
      // Column pattern
      () => {
        const adds = [this.rand(2, 4), this.rand(2, 4), this.rand(2, 4)];
        const row1 = [this.rand(1, 5), this.rand(1, 5), this.rand(1, 5)];
        const row2 = row1.map((v, i) => v + adds[i]);
        const row3 = row2.map((v, i) => v + adds[i]);
        const ans = row3[2];
        const exp = `Each column adds ${adds[2]}. ${row2[2]} + ${adds[2]} = ${ans}`;
        row3[2] = '?';
        return { grid: [...row1, ...row2, ...row3], ans, exp };
      }
    ];
    
    const p = patterns[this.rand(0, patterns.length - 1)]();
    
    return {
      type: 'matrix',
      category: 'patternRecognition',
      categoryLabel: 'Matrix Pattern',
      difficulty: 1.2,
      question: 'Find the missing number',
      grid: p.grid,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'matrix'
    };
  },

  oddOne() {
    const sets = [
      { items: ['Apple', 'Banana', 'Carrot', 'Orange'], odd: 'Carrot', exp: 'Carrot is a vegetable; the rest are fruits' },
      { items: ['Dog', 'Cat', 'Goldfish', 'Hamster'], odd: 'Goldfish', exp: 'Goldfish lives in water; the rest are land pets' },
      { items: ['Red', 'Blue', 'Triangle', 'Green'], odd: 'Triangle', exp: 'Triangle is a shape; the rest are colors' },
      { items: ['Piano', 'Guitar', 'Violin', 'Drums'], odd: 'Drums', exp: 'Drums are percussion; the rest have strings/keys' },
      { items: ['Mars', 'Venus', 'Moon', 'Jupiter'], odd: 'Moon', exp: 'Moon is a satellite; the rest are planets' },
      { items: ['Dolphin', 'Shark', 'Whale', 'Seal'], odd: 'Shark', exp: 'Shark is a fish; the rest are mammals' },
      { items: ['Car', 'Bicycle', 'Boat', 'Motorcycle'], odd: 'Boat', exp: 'Boat travels on water; the rest on roads' },
      { items: ['Hammer', 'Ruler', 'Protractor', 'Compass'], odd: 'Hammer', exp: 'Hammer is for building; the rest measure/draw' },
      { items: ['Python', 'Java', 'Spanish', 'Ruby'], odd: 'Spanish', exp: 'Spanish is a human language; the rest are programming languages' },
      { items: ['Gold', 'Silver', 'Diamond', 'Copper'], odd: 'Diamond', exp: 'Diamond is a gemstone; the rest are metals' },
      { items: ['Eagle', 'Penguin', 'Sparrow', 'Hawk'], odd: 'Penguin', exp: 'Penguin cannot fly; the rest can' },
      { items: ['Chair', 'Table', 'Lamp', 'Desk'], odd: 'Lamp', exp: 'Lamp provides light; the rest are furniture surfaces' },
      { items: ['Soccer', 'Tennis', 'Golf', 'Basketball'], odd: 'Golf', exp: 'Golf is not a team sport; the rest can be' },
      { items: ['Shirt', 'Pants', 'Watch', 'Jacket'], odd: 'Watch', exp: 'Watch is an accessory; the rest are clothing' }
    ];
    
    const s = sets[this.rand(0, sets.length - 1)];
    
    return {
      type: 'oddOne',
      category: 'commonSense',
      categoryLabel: 'Odd One Out',
      difficulty: 1,
      question: 'Which one doesn\'t belong?',
      answer: s.odd,
      options: this.shuffle(s.items),
      explanation: s.exp,
      visual: 'options'
    };
  },

  analogy() {
    const items = [
      { a: 'Hot', b: 'Cold', c: 'Up', ans: 'Down', wrong: ['Left', 'High', 'Over'], exp: 'Opposites: Hot↔Cold, Up↔Down' },
      { a: 'Puppy', b: 'Dog', c: 'Kitten', ans: 'Cat', wrong: ['Mouse', 'Tiger', 'Pet'], exp: 'Young→Adult: Puppy→Dog, Kitten→Cat' },
      { a: 'Bird', b: 'Nest', c: 'Bee', ans: 'Hive', wrong: ['Honey', 'Flower', 'Garden'], exp: 'Animal→Home: Bird→Nest, Bee→Hive' },
      { a: 'Eye', b: 'See', c: 'Ear', ans: 'Hear', wrong: ['Sound', 'Music', 'Listen'], exp: 'Organ→Function: Eye→See, Ear→Hear' },
      { a: 'Fish', b: 'Swim', c: 'Bird', ans: 'Fly', wrong: ['Feather', 'Sing', 'Wing'], exp: 'Animal→Movement: Fish→Swim, Bird→Fly' },
      { a: 'Author', b: 'Book', c: 'Chef', ans: 'Meal', wrong: ['Kitchen', 'Food', 'Recipe'], exp: 'Creator→Creation: Author→Book, Chef→Meal' },
      { a: 'Car', b: 'Garage', c: 'Plane', ans: 'Hangar', wrong: ['Airport', 'Sky', 'Runway'], exp: 'Vehicle→Storage: Car→Garage, Plane→Hangar' },
      { a: 'Finger', b: 'Hand', c: 'Toe', ans: 'Foot', wrong: ['Leg', 'Shoe', 'Nail'], exp: 'Part→Whole: Finger→Hand, Toe→Foot' },
      { a: 'Teacher', b: 'School', c: 'Doctor', ans: 'Hospital', wrong: ['Patient', 'Medicine', 'Nurse'], exp: 'Professional→Workplace' },
      { a: 'Pen', b: 'Write', c: 'Knife', ans: 'Cut', wrong: ['Sharp', 'Kitchen', 'Slice'], exp: 'Tool→Action: Pen→Write, Knife→Cut' },
      { a: 'Day', b: 'Night', c: 'Summer', ans: 'Winter', wrong: ['Cold', 'Fall', 'Snow'], exp: 'Opposites in cycles: Day↔Night, Summer↔Winter' },
      { a: 'Bread', b: 'Bakery', c: 'Medicine', ans: 'Pharmacy', wrong: ['Doctor', 'Hospital', 'Pill'], exp: 'Product→Store: Bread→Bakery, Medicine→Pharmacy' }
    ];
    
    const i = items[this.rand(0, items.length - 1)];
    
    return {
      type: 'analogy',
      category: 'verbalReasoning',
      categoryLabel: 'Analogy',
      difficulty: 1.2,
      question: `${i.a} → ${i.b}  as  ${i.c} → ?`,
      answer: i.ans,
      options: this.shuffle([i.ans, ...i.wrong.slice(0, 3)]),
      explanation: i.exp,
      visual: 'options'
    };
  },

  math() {
    const diff = this.getDiff();
    const puzzles = [
      // Addition
      () => {
        const a = this.rand(12, 45), b = this.rand(8, 35);
        return { q: `${a} + ${b} = ?`, ans: a + b, exp: `${a} + ${b} = ${a + b}` };
      },
      // Subtraction
      () => {
        const a = this.rand(30, 80), b = this.rand(10, 29);
        return { q: `${a} - ${b} = ?`, ans: a - b, exp: `${a} - ${b} = ${a - b}` };
      },
      // Multiplication
      () => {
        const a = this.rand(4, 12), b = this.rand(3, 9);
        return { q: `${a} × ${b} = ?`, ans: a * b, exp: `${a} × ${b} = ${a * b}` };
      },
      // Percentage
      () => {
        const base = this.rand(2, 10) * 20;
        const pct = [10, 20, 25, 50][this.rand(0, 3)];
        const ans = (base * pct) / 100;
        return { q: `${pct}% of ${base} = ?`, ans, exp: `${pct}% of ${base} = ${ans}` };
      },
      // Square
      () => {
        const n = this.rand(4, 12);
        return { q: `${n}² = ?`, ans: n * n, exp: `${n} × ${n} = ${n * n}` };
      },
      // Division
      () => {
        const b = this.rand(2, 9);
        const ans = this.rand(5, 15);
        const a = b * ans;
        return { q: `${a} ÷ ${b} = ?`, ans, exp: `${a} ÷ ${b} = ${ans}` };
      },
      // Word problem
      () => {
        const price = this.rand(3, 8);
        const qty = this.rand(4, 9);
        const total = price * qty;
        return { q: `${qty} items at $${price} each = ?`, ans: total, exp: `${qty} × $${price} = $${total}` };
      }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)]();
    
    return {
      type: 'math',
      category: 'mentalAgility',
      categoryLabel: 'Mental Math',
      difficulty: diff === 'hard' ? 1.3 : 1,
      question: p.q,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'options'
    };
  },

  logic() {
    const items = [
      { q: 'Tom is taller than Sam. Sam is taller than Mike. Who is shortest?', ans: 'Mike', wrong: ['Tom', 'Sam', 'Cannot tell'], exp: 'Tom > Sam > Mike in height' },
      { q: 'All cats have whiskers. Fluffy is a cat. Therefore:', ans: 'Fluffy has whiskers', wrong: ['Fluffy might not', 'Cats are fluffy', 'Unknown'], exp: 'If all cats have whiskers and Fluffy is a cat, Fluffy has whiskers' },
      { q: 'If it rains, the grass gets wet. The grass is wet. Did it definitely rain?', ans: 'Not necessarily', wrong: ['Yes', 'No', 'Always'], exp: 'The grass could be wet from sprinklers or dew' },
      { q: 'No birds are fish. Some pets are birds. Therefore:', ans: 'Some pets are not fish', wrong: ['All pets are birds', 'No pets are fish', 'Birds are pets'], exp: 'The birds that are pets cannot be fish' },
      { q: 'A is older than B. C is younger than B. Who is youngest?', ans: 'C', wrong: ['A', 'B', 'Cannot tell'], exp: 'A > B > C in age, so C is youngest' },
      { q: 'All squares are rectangles. All rectangles have 4 sides. Therefore:', ans: 'All squares have 4 sides', wrong: ['All rectangles are squares', 'Some squares have 3 sides', 'Cannot tell'], exp: 'Squares are rectangles, rectangles have 4 sides' },
      { q: 'If P then Q. P is true. What can we conclude?', ans: 'Q is true', wrong: ['Q is false', 'P is false', 'Cannot tell'], exp: 'If P implies Q and P is true, then Q must be true' },
      { q: 'Red is darker than yellow. Blue is darker than red. Which is lightest?', ans: 'Yellow', wrong: ['Red', 'Blue', 'Cannot tell'], exp: 'Blue > Red > Yellow in darkness, so Yellow is lightest' }
    ];
    
    const i = items[this.rand(0, items.length - 1)];
    
    return {
      type: 'logic',
      category: 'problemSolving',
      categoryLabel: 'Logic',
      difficulty: 1.3,
      question: i.q,
      answer: i.ans,
      options: this.shuffle([i.ans, ...i.wrong]),
      explanation: i.exp,
      visual: 'options'
    };
  },

  verbal() {
    const items = [
      { q: 'What is the opposite of "ancient"?', ans: 'Modern', wrong: ['Old', 'Historic', 'Antique'], exp: 'Ancient means very old; modern means new/current' },
      { q: 'Which word means the same as "rapid"?', ans: 'Fast', wrong: ['Slow', 'Steady', 'Calm'], exp: 'Rapid and fast both mean quick' },
      { q: 'BOOK, COOK, LOOK, ___', ans: 'HOOK', wrong: ['TOOK', 'NOOK', 'BROOK'], exp: 'Words rhyming with -OOK' },
      { q: 'What is the opposite of "expand"?', ans: 'Contract', wrong: ['Grow', 'Extend', 'Increase'], exp: 'Expand means grow larger; contract means shrink' },
      { q: 'Which word means "to make easier"?', ans: 'Simplify', wrong: ['Complicate', 'Confuse', 'Elaborate'], exp: 'Simplify means to make simpler or easier' },
      { q: 'CAT, HAT, BAT, ___', ans: 'RAT', wrong: ['DOG', 'MAT', 'SAT'], exp: 'Three-letter words ending in -AT' },
      { q: 'What is a synonym for "enormous"?', ans: 'Huge', wrong: ['Tiny', 'Small', 'Little'], exp: 'Enormous and huge both mean very large' },
      { q: 'What is the opposite of "temporary"?', ans: 'Permanent', wrong: ['Brief', 'Short', 'Fleeting'], exp: 'Temporary is short-term; permanent is lasting' }
    ];
    
    const i = items[this.rand(0, items.length - 1)];
    
    return {
      type: 'verbal',
      category: 'verbalReasoning',
      categoryLabel: 'Verbal',
      difficulty: 1.1,
      question: i.q,
      answer: i.ans,
      options: this.shuffle([i.ans, ...i.wrong.slice(0, 3)]),
      explanation: i.exp,
      visual: 'options'
    };
  },

  letterSeq() {
    const patterns = [
      { seq: ['A', 'C', 'E', 'G'], ans: 'I', exp: 'Skip one letter: A, C, E, G, I' },
      { seq: ['Z', 'X', 'V', 'T'], ans: 'R', exp: 'Backwards, skip one: Z, X, V, T, R' },
      { seq: ['B', 'D', 'F', 'H'], ans: 'J', exp: 'Every other letter: B, D, F, H, J' },
      { seq: ['A', 'B', 'D', 'G'], ans: 'K', exp: 'Gaps increase: +1, +2, +3, +4' },
      { seq: ['M', 'N', 'O', 'P'], ans: 'Q', exp: 'Consecutive letters: M, N, O, P, Q' },
      { seq: ['A', 'Z', 'B', 'Y'], ans: 'C', exp: 'Alternating from start and end of alphabet' },
      { seq: ['J', 'F', 'M', 'A'], ans: 'M', exp: 'First letters of months: Jan, Feb, Mar, Apr, May' }
    ];
    
    const p = patterns[this.rand(0, patterns.length - 1)];
    const wrong = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== p.ans);
    
    return {
      type: 'letterSeq',
      category: 'patternRecognition',
      categoryLabel: 'Letter Pattern',
      difficulty: 1.1,
      question: 'What letter comes next?',
      sequence: p.seq,
      answer: p.ans,
      options: this.shuffle([p.ans, ...this.shuffle(wrong).slice(0, 3)]),
      explanation: p.exp,
      visual: 'letterSequence'
    };
  },

  spatial() {
    const puzzles = [
      { q: 'Rotate ▲ 180°', start: '▲', ans: '▼', wrong: ['◀', '▶', '▲'], exp: 'Rotating 180° flips it upside down' },
      { q: 'Mirror ◀ horizontally', start: '◀', ans: '▶', wrong: ['▲', '▼', '◀'], exp: 'Horizontal mirror flips left to right' },
      { q: 'Rotate ▶ 90° clockwise', start: '▶', ans: '▼', wrong: ['▲', '◀', '▶'], exp: '90° clockwise: right becomes down' },
      { q: 'Mirror ▲ vertically', start: '▲', ans: '▼', wrong: ['◀', '▶', '▲'], exp: 'Vertical mirror flips top to bottom' },
      { q: 'Rotate ◀ 270° clockwise', start: '◀', ans: '▼', wrong: ['▲', '▶', '◀'], exp: '270° clockwise = 90° counter-clockwise' }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)];
    
    return {
      type: 'spatial',
      category: 'spatialAwareness',
      categoryLabel: 'Spatial',
      difficulty: 1.2,
      question: p.q,
      startShape: p.start,
      answer: p.ans,
      options: this.shuffle([p.ans, ...p.wrong]),
      explanation: p.exp,
      visual: 'spatial'
    };
  },

  missingNumber() {
    const puzzles = [
      () => {
        const a = this.rand(2, 8), b = this.rand(2, 8);
        const sum = a + b;
        return { q: `? + ${b} = ${sum}`, ans: a, exp: `${sum} - ${b} = ${a}` };
      },
      () => {
        const a = this.rand(3, 9), b = this.rand(2, 6);
        const prod = a * b;
        return { q: `${a} × ? = ${prod}`, ans: b, exp: `${prod} ÷ ${a} = ${b}` };
      },
      () => {
        const a = this.rand(20, 50), b = this.rand(5, 15);
        const diff = a - b;
        return { q: `${a} - ? = ${diff}`, ans: b, exp: `${a} - ${diff} = ${b}` };
      }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)]();
    
    return {
      type: 'missingNum',
      category: 'mentalAgility',
      categoryLabel: 'Find the Number',
      difficulty: 1.1,
      question: p.q,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'options'
    };
  },

  wordMeaning() {
    const items = [
      { q: 'What does "benevolent" mean?', ans: 'Kind and generous', wrong: ['Angry', 'Confused', 'Tired'], exp: 'Benevolent means well-meaning and kind' },
      { q: 'What does "scarce" mean?', ans: 'Rare or limited', wrong: ['Abundant', 'Common', 'Plentiful'], exp: 'Scarce means in short supply' },
      { q: 'What does "diligent" mean?', ans: 'Hardworking', wrong: ['Lazy', 'Careless', 'Slow'], exp: 'Diligent means showing care and effort' },
      { q: 'What does "peculiar" mean?', ans: 'Strange or unusual', wrong: ['Normal', 'Common', 'Regular'], exp: 'Peculiar means odd or different' },
      { q: 'What does "tranquil" mean?', ans: 'Calm and peaceful', wrong: ['Noisy', 'Chaotic', 'Busy'], exp: 'Tranquil means free from disturbance' }
    ];
    
    const i = items[this.rand(0, items.length - 1)];
    
    return {
      type: 'wordMeaning',
      category: 'verbalReasoning',
      categoryLabel: 'Vocabulary',
      difficulty: 1.2,
      question: i.q,
      answer: i.ans,
      options: this.shuffle([i.ans, ...i.wrong]),
      explanation: i.exp,
      visual: 'options'
    };
  },

  seriesComplete() {
    const puzzles = [
      { seq: [2, 4, 8, 16], ans: 32, exp: 'Each number doubles: 16 × 2 = 32' },
      { seq: [1, 4, 9, 16], ans: 25, exp: 'Perfect squares: 1², 2², 3², 4², 5² = 25' },
      { seq: [3, 6, 12, 24], ans: 48, exp: 'Each number doubles: 24 × 2 = 48' },
      { seq: [100, 90, 80, 70], ans: 60, exp: 'Subtract 10 each time: 70 - 10 = 60' },
      { seq: [1, 3, 6, 10], ans: 15, exp: 'Triangular numbers: +2, +3, +4, +5' },
      { seq: [2, 6, 18, 54], ans: 162, exp: 'Multiply by 3: 54 × 3 = 162' }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)];
    
    return {
      type: 'seriesComplete',
      category: 'patternRecognition',
      categoryLabel: 'Complete the Series',
      difficulty: 1.2,
      question: 'What comes next?',
      sequence: p.seq,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'sequence'
    };
  },

  codeBreak() {
    const codes = [
      { code: 'If A=1, B=2, C=3... What is CAB?', ans: '6', wrong: ['3', '9', '12'], exp: 'C(3) + A(1) + B(2) = 6' },
      { code: 'If CAT = 24, DOG = ?', ans: '26', wrong: ['24', '22', '28'], exp: 'C(3)+A(1)+T(20)=24, D(4)+O(15)+G(7)=26' },
      { code: 'RED : 27 :: BLUE : ?', ans: '40', wrong: ['35', '45', '38'], exp: 'R(18)+E(5)+D(4)=27, B(2)+L(12)+U(21)+E(5)=40' },
      { code: 'If 🌟 = 5 and 🌙 = 3, what is 🌟🌙🌟?', ans: '13', wrong: ['11', '15', '8'], exp: '5 + 3 + 5 = 13' },
      { code: 'If ◆ + ◆ = 10 and ◆ + ● = 12, what is ●?', ans: '7', wrong: ['5', '6', '8'], exp: '◆=5, so 5+●=12, ●=7' }
    ];
    
    const c = codes[this.rand(0, codes.length - 1)];
    
    return {
      type: 'codeBreak',
      category: 'problemSolving',
      categoryLabel: 'Code Breaker',
      difficulty: 1.4,
      question: c.code,
      answer: c.ans,
      options: this.shuffle([c.ans, ...c.wrong]),
      explanation: c.exp,
      visual: 'options'
    };
  },

  visualPattern() {
    const patterns = [
      { q: 'What comes next: ○ ○● ○●● ?', ans: '○●●●', wrong: ['●●●●', '○○●●', '○●○●'], exp: 'Adding one ● each time' },
      { q: '■□■ → □■□ → ?', ans: '■□■', wrong: ['□□□', '■■■', '□■■'], exp: 'Pattern alternates' },
      { q: '↑ → ↓ → ?', ans: '←', wrong: ['↑', '→', '↓'], exp: 'Rotating 90° clockwise each time' },
      { q: '★ ★★ ★★★ ★★★★ ?', ans: '★★★★★', wrong: ['★★★★', '★★★', '★★★★★★'], exp: 'Adding one star each time' },
      { q: '◇◇ ◈◈ ◇◇◇ ◈◈◈ ?', ans: '◇◇◇◇', wrong: ['◈◈◈◈', '◇◈◇◈', '◇◇'], exp: 'Alternating shape, increasing count' }
    ];
    
    const p = patterns[this.rand(0, patterns.length - 1)];
    
    return {
      type: 'visualPattern',
      category: 'patternRecognition',
      categoryLabel: 'Visual Pattern',
      difficulty: 1.3,
      question: p.q,
      answer: p.ans,
      options: this.shuffle([p.ans, ...p.wrong]),
      explanation: p.exp,
      visual: 'options'
    };
  },

  emotionalIQ() {
    const scenarios = [
      { q: 'Your friend seems upset but says "I\'m fine." Best response?', ans: 'Give space but stay available', wrong: ['Keep pushing to talk', 'Walk away', 'Tell others about it'], exp: 'Respecting boundaries while showing support' },
      { q: 'A coworker takes credit for your idea. You should:', ans: 'Address it privately with them', wrong: ['Yell at them publicly', 'Ignore it forever', 'Spread rumors'], exp: 'Direct private communication resolves conflicts best' },
      { q: 'You made a mistake at work. Best approach?', ans: 'Admit it and help fix it', wrong: ['Blame someone else', 'Hope no one notices', 'Make excuses'], exp: 'Taking responsibility builds trust' },
      { q: 'Someone cuts in line in front of you. You should:', ans: 'Politely point it out', wrong: ['Start yelling', 'Push them', 'Leave immediately'], exp: 'Calm assertiveness is most effective' },
      { q: 'Your friend got a promotion you wanted. You:', ans: 'Congratulate them genuinely', wrong: ['Ignore them', 'Complain to others', 'Quit your job'], exp: 'Supporting others strengthens relationships' }
    ];
    
    const s = scenarios[this.rand(0, scenarios.length - 1)];
    
    return {
      type: 'emotional',
      category: 'emotionalIntelligence',
      categoryLabel: 'Social IQ',
      difficulty: 1.1,
      question: s.q,
      answer: s.ans,
      options: this.shuffle([s.ans, ...s.wrong]),
      explanation: s.exp,
      visual: 'options'
    };
  }
};