const QuestionGenerator = {
  age: 25,
  usedHashes: new Set(),

  setAge(a) { this.age = a || 25; },
  
  rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  numOpts(correct, count = 4) {
    const opts = new Set([correct]);
    const range = Math.max(5, Math.abs(correct) * 0.5);
    while (opts.size < count) {
      const delta = this.rand(1, Math.ceil(range)) * (Math.random() > 0.5 ? 1 : -1);
      const v = correct + delta;
      if (v > 0 && v !== correct) opts.add(v);
    }
    return this.shuffle([...opts]);
  },

  generate() {
    // Weighted random - word search appears ~1/12
    const r = Math.random();
    let q;
    
    if (r < 0.08) q = this.wordSearch();
    else if (r < 0.16) q = this.numberSeq();
    else if (r < 0.24) q = this.matrix();
    else if (r < 0.32) q = this.analogy();
    else if (r < 0.40) q = this.math();
    else if (r < 0.48) q = this.oddOne();
    else if (r < 0.56) q = this.logic();
    else if (r < 0.64) q = this.verbal();
    else if (r < 0.72) q = this.letterSeq();
    else if (r < 0.80) q = this.spatial();
    else if (r < 0.88) q = this.codeBreak();
    else q = this.visualPattern();
    
    // Ensure unique
    const hash = q.type + '-' + q.question + '-' + q.answer;
    if (this.usedHashes.has(hash)) {
      return this.generate();
    }
    this.usedHashes.add(hash);
    
    // Keep set from getting too large
    if (this.usedHashes.size > 500) {
      const arr = [...this.usedHashes];
      this.usedHashes = new Set(arr.slice(-200));
    }
    
    return q;
  },

  // NUMBER SEQUENCES - Procedurally generated, infinite variety
  numberSeq() {
    const type = this.rand(0, 7);
    let seq, ans, exp;
    
    switch(type) {
      case 0: { // Add constant
        const add = this.rand(2, 12);
        const start = this.rand(1, 30);
        seq = [start, start + add, start + add*2, start + add*3];
        ans = start + add*4;
        exp = `Adding ${add} each time`;
        break;
      }
      case 1: { // Subtract constant
        const sub = this.rand(2, 8);
        const start = this.rand(40, 80);
        seq = [start, start - sub, start - sub*2, start - sub*3];
        ans = start - sub*4;
        exp = `Subtracting ${sub} each time`;
        break;
      }
      case 2: { // Multiply
        const mult = this.rand(2, 4);
        const start = this.rand(1, 5);
        seq = [start, start*mult, start*mult**2, start*mult**3];
        ans = start*mult**4;
        exp = `Multiplying by ${mult} each time`;
        break;
      }
      case 3: { // Squares
        const off = this.rand(0, 5);
        seq = [(1+off)**2, (2+off)**2, (3+off)**2, (4+off)**2];
        ans = (5+off)**2;
        exp = `Perfect squares: ${1+off}², ${2+off}², ${3+off}²...`;
        break;
      }
      case 4: { // Fibonacci-like
        const a = this.rand(1, 5), b = this.rand(2, 6);
        seq = [a, b, a+b, a+b+b];
        seq[3] = seq[1] + seq[2];
        ans = seq[2] + seq[3];
        exp = `Each number = sum of previous two`;
        break;
      }
      case 5: { // Increasing gaps
        const start = this.rand(1, 5);
        seq = [start, start+1, start+3, start+6];
        ans = start + 10;
        exp = `Gaps increase: +1, +2, +3, +4`;
        break;
      }
      case 6: { // Double then add
        const add = this.rand(1, 3);
        const start = this.rand(1, 4);
        seq = [start];
        for (let i = 1; i < 4; i++) seq.push(seq[i-1] * 2 + add);
        ans = seq[3] * 2 + add;
        exp = `Double and add ${add}`;
        break;
      }
      default: { // Cubes
        const off = this.rand(0, 2);
        seq = [(1+off)**3, (2+off)**3];
        if (seq[1] < 100) {
          seq.push((3+off)**3, (4+off)**3);
          ans = (5+off)**3;
        } else {
          seq = [1, 8, 27, 64];
          ans = 125;
        }
        exp = `Perfect cubes: 1³, 2³, 3³...`;
      }
    }
    
    return {
      type: 'numberSeq',
      category: 'patternRecognition',
      categoryLabel: 'Number Sequence',
      difficulty: 1.2,
      question: 'What comes next?',
      sequence: seq,
      answer: String(ans),
      options: this.numOpts(ans).map(String),
      explanation: exp,
      visual: 'sequence'
    };
  },

  // MATRIX - 3x3 grid puzzles
  matrix() {
    const type = this.rand(0, 3);
    let grid, ans, exp;
    
    switch(type) {
      case 0: { // Row sums equal
        const sum = this.rand(12, 24);
        const r1 = [this.rand(2, 6), this.rand(2, 6)]; r1.push(sum - r1[0] - r1[1]);
        const r2 = [this.rand(2, 6), this.rand(2, 6)]; r2.push(sum - r2[0] - r2[1]);
        const r3 = [this.rand(2, 6), this.rand(2, 6)];
        ans = sum - r3[0] - r3[1];
        grid = [...r1, ...r2, r3[0], r3[1], '?'];
        exp = `Each row sums to ${sum}`;
        break;
      }
      case 1: { // Column pattern - add constant
        const adds = [this.rand(2, 5), this.rand(2, 5), this.rand(2, 5)];
        const r1 = [this.rand(1, 5), this.rand(1, 5), this.rand(1, 5)];
        const r2 = r1.map((v, i) => v + adds[i]);
        const r3 = r2.map((v, i) => v + adds[i]);
        ans = r3[2];
        grid = [...r1, ...r2, r3[0], r3[1], '?'];
        exp = `Each column adds ${adds[2]}`;
        break;
      }
      case 2: { // Multiply across rows
        const mult = this.rand(2, 3);
        const r1 = [this.rand(2, 4)]; r1.push(r1[0] * mult, r1[1] * mult);
        const r2 = [this.rand(2, 4)]; r2.push(r2[0] * mult, r2[1] * mult);
        const r3 = [this.rand(2, 4)]; r3.push(r3[0] * mult);
        ans = r3[1] * mult;
        grid = [...r1, ...r2, r3[0], r3[1], '?'];
        exp = `Each row multiplies by ${mult}`;
        break;
      }
      default: { // Diagonal pattern
        const d = this.rand(2, 4);
        grid = [this.rand(2, 5), '·', '·', '·', grid[0] + d, '·', '·', '·', '?'];
        grid[1] = this.rand(1, 5); grid[2] = this.rand(1, 5);
        grid[3] = this.rand(1, 5); grid[5] = this.rand(1, 5);
        grid[6] = this.rand(1, 5); grid[7] = this.rand(1, 5);
        grid[4] = grid[0] + d;
        ans = grid[4] + d;
        exp = `Diagonal increases by ${d}`;
      }
    }
    
    return {
      type: 'matrix',
      category: 'patternRecognition',
      categoryLabel: 'Matrix Pattern',
      difficulty: 1.3,
      question: 'Find the missing number',
      grid: grid,
      answer: String(ans),
      options: this.numOpts(ans).map(String),
      explanation: exp,
      visual: 'matrix'
    };
  },

  // ANALOGIES - Fixed format "X is to Y, as Z is to _____"
  analogy() {
    const all = [
      { a: 'Hot', b: 'Cold', c: 'Light', ans: 'Dark', wrong: ['Bright', 'Heavy', 'Warm'] },
      { a: 'Puppy', b: 'Dog', c: 'Kitten', ans: 'Cat', wrong: ['Mouse', 'Tiger', 'Pet'] },
      { a: 'Bird', b: 'Nest', c: 'Bee', ans: 'Hive', wrong: ['Honey', 'Flower', 'Garden'] },
      { a: 'Eye', b: 'See', c: 'Ear', ans: 'Hear', wrong: ['Sound', 'Music', 'Nose'] },
      { a: 'Fish', b: 'Swim', c: 'Bird', ans: 'Fly', wrong: ['Feather', 'Sing', 'Wing'] },
      { a: 'Author', b: 'Book', c: 'Chef', ans: 'Meal', wrong: ['Kitchen', 'Food', 'Recipe'] },
      { a: 'Car', b: 'Garage', c: 'Plane', ans: 'Hangar', wrong: ['Airport', 'Sky', 'Runway'] },
      { a: 'Finger', b: 'Hand', c: 'Toe', ans: 'Foot', wrong: ['Leg', 'Shoe', 'Nail'] },
      { a: 'Teacher', b: 'School', c: 'Doctor', ans: 'Hospital', wrong: ['Patient', 'Medicine', 'Nurse'] },
      { a: 'Pen', b: 'Write', c: 'Knife', ans: 'Cut', wrong: ['Sharp', 'Kitchen', 'Blade'] },
      { a: 'Day', b: 'Night', c: 'Summer', ans: 'Winter', wrong: ['Cold', 'Fall', 'Snow'] },
      { a: 'Bread', b: 'Bakery', c: 'Medicine', ans: 'Pharmacy', wrong: ['Doctor', 'Hospital', 'Pill'] },
      { a: 'King', b: 'Queen', c: 'Prince', ans: 'Princess', wrong: ['Knight', 'Castle', 'Royal'] },
      { a: 'Cow', b: 'Milk', c: 'Chicken', ans: 'Egg', wrong: ['Feather', 'Farm', 'Meat'] },
      { a: 'Rain', b: 'Wet', c: 'Sun', ans: 'Dry', wrong: ['Hot', 'Light', 'Yellow'] },
      { a: 'Foot', b: 'Shoe', c: 'Hand', ans: 'Glove', wrong: ['Finger', 'Ring', 'Arm'] },
      { a: 'Canvas', b: 'Painter', c: 'Stage', ans: 'Actor', wrong: ['Theater', 'Play', 'Curtain'] },
      { a: 'Hungry', b: 'Eat', c: 'Tired', ans: 'Sleep', wrong: ['Bed', 'Rest', 'Night'] },
      { a: 'Grass', b: 'Green', c: 'Sky', ans: 'Blue', wrong: ['Cloud', 'High', 'Air'] },
      { a: 'Lock', b: 'Key', c: 'Question', ans: 'Answer', wrong: ['Ask', 'Problem', 'Test'] }
    ];
    
    const i = all[this.rand(0, all.length - 1)];
    const exp = `${i.a} relates to ${i.b} the same way ${i.c} relates to ${i.ans}`;
    
    return {
      type: 'analogy',
      category: 'verbalReasoning',
      categoryLabel: 'Analogy',
      difficulty: 1.2,
      question: `${i.a} is to ${i.b}, as ${i.c} is to _____`,
      answer: i.ans,
      options: this.shuffle([i.ans, ...i.wrong]),
      explanation: exp,
      visual: 'options'
    };
  },

  // MATH - Mental arithmetic
  math() {
    const type = this.rand(0, 8);
    let q, ans, exp;
    
    switch(type) {
      case 0: { // Addition
        const a = this.rand(12, 78), b = this.rand(8, 45);
        q = `${a} + ${b} = ?`;
        ans = a + b;
        exp = `${a} + ${b} = ${ans}`;
        break;
      }
      case 1: { // Subtraction
        const a = this.rand(40, 99), b = this.rand(10, 39);
        q = `${a} - ${b} = ?`;
        ans = a - b;
        exp = `${a} - ${b} = ${ans}`;
        break;
      }
      case 2: { // Multiplication
        const a = this.rand(3, 12), b = this.rand(3, 12);
        q = `${a} × ${b} = ?`;
        ans = a * b;
        exp = `${a} × ${b} = ${ans}`;
        break;
      }
      case 3: { // Division
        const b = this.rand(2, 12);
        ans = this.rand(3, 12);
        const a = b * ans;
        q = `${a} ÷ ${b} = ?`;
        exp = `${a} ÷ ${b} = ${ans}`;
        break;
      }
      case 4: { // Percentage
        const base = this.rand(2, 10) * 20;
        const pct = [10, 20, 25, 50][this.rand(0, 3)];
        ans = (base * pct) / 100;
        q = `${pct}% of ${base} = ?`;
        exp = `${pct}% of ${base} = ${ans}`;
        break;
      }
      case 5: { // Square
        const n = this.rand(4, 12);
        ans = n * n;
        q = `${n}² = ?`;
        exp = `${n} × ${n} = ${ans}`;
        break;
      }
      case 6: { // Missing number add
        const a = this.rand(5, 25), b = this.rand(5, 25);
        ans = a;
        q = `? + ${b} = ${a + b}`;
        exp = `${a + b} - ${b} = ${a}`;
        break;
      }
      case 7: { // Word problem
        const price = this.rand(3, 12);
        const qty = this.rand(3, 9);
        ans = price * qty;
        q = `${qty} items at $${price} each = ?`;
        exp = `${qty} × $${price} = $${ans}`;
        break;
      }
      default: { // Double digit multiply
        const a = this.rand(11, 19), b = this.rand(2, 6);
        ans = a * b;
        q = `${a} × ${b} = ?`;
        exp = `${a} × ${b} = ${ans}`;
      }
    }
    
    return {
      type: 'math',
      category: 'mentalAgility',
      categoryLabel: 'Mental Math',
      difficulty: 1.1,
      question: q,
      answer: String(ans),
      options: this.numOpts(ans).map(String),
      explanation: exp,
      visual: 'options'
    };
  },

  // ODD ONE OUT
  oddOne() {
    const sets = [
      { items: ['Apple', 'Banana', 'Carrot', 'Orange'], odd: 'Carrot', exp: 'Carrot is a vegetable' },
      { items: ['Dog', 'Cat', 'Goldfish', 'Hamster'], odd: 'Goldfish', exp: 'Goldfish lives in water' },
      { items: ['Red', 'Blue', 'Triangle', 'Green'], odd: 'Triangle', exp: 'Triangle is a shape, not a color' },
      { items: ['Piano', 'Guitar', 'Violin', 'Drums'], odd: 'Drums', exp: 'Drums are percussion' },
      { items: ['Mars', 'Venus', 'Moon', 'Jupiter'], odd: 'Moon', exp: 'Moon is a satellite' },
      { items: ['Dolphin', 'Shark', 'Whale', 'Seal'], odd: 'Shark', exp: 'Shark is a fish, others are mammals' },
      { items: ['Car', 'Bicycle', 'Boat', 'Motorcycle'], odd: 'Boat', exp: 'Boat travels on water' },
      { items: ['Python', 'Java', 'Spanish', 'Ruby'], odd: 'Spanish', exp: 'Spanish is a human language' },
      { items: ['Gold', 'Silver', 'Diamond', 'Copper'], odd: 'Diamond', exp: 'Diamond is a gemstone' },
      { items: ['Eagle', 'Penguin', 'Sparrow', 'Hawk'], odd: 'Penguin', exp: 'Penguin cannot fly' },
      { items: ['Chair', 'Table', 'Lamp', 'Desk'], odd: 'Lamp', exp: 'Lamp provides light' },
      { items: ['Soccer', 'Tennis', 'Golf', 'Basketball'], odd: 'Golf', exp: 'Golf is not a team sport' },
      { items: ['Shirt', 'Pants', 'Watch', 'Jacket'], odd: 'Watch', exp: 'Watch is an accessory' },
      { items: ['London', 'Paris', 'Europe', 'Tokyo'], odd: 'Europe', exp: 'Europe is a continent' },
      { items: ['Coffee', 'Tea', 'Juice', 'Bread'], odd: 'Bread', exp: 'Bread is not a drink' },
      { items: ['Run', 'Jump', 'Walk', 'Think'], odd: 'Think', exp: 'Think is not physical movement' },
      { items: ['January', 'Monday', 'March', 'April'], odd: 'Monday', exp: 'Monday is a day, not a month' },
      { items: ['Hammer', 'Screwdriver', 'Banana', 'Wrench'], odd: 'Banana', exp: 'Banana is food, not a tool' }
    ];
    
    const s = sets[this.rand(0, sets.length - 1)];
    
    return {
      type: 'oddOne',
      category: 'commonSense',
      categoryLabel: 'Odd One Out',
      difficulty: 1.0,
      question: 'Which one doesn\'t belong?',
      answer: s.odd,
      options: this.shuffle(s.items),
      explanation: s.exp,
      visual: 'options'
    };
  },

  // LOGIC PUZZLES
  logic() {
    const all = [
      { q: 'Tom is taller than Sam. Sam is taller than Mike. Who is shortest?', ans: 'Mike', wrong: ['Tom', 'Sam', 'Cannot tell'] },
      { q: 'All cats have whiskers. Fluffy is a cat. Therefore:', ans: 'Fluffy has whiskers', wrong: ['Fluffy might not', 'All pets have whiskers', 'Unknown'] },
      { q: 'If it rains, the grass gets wet. The grass is wet. Did it definitely rain?', ans: 'Not necessarily', wrong: ['Yes', 'No', 'Always'] },
      { q: 'A is older than B. C is younger than B. Who is youngest?', ans: 'C', wrong: ['A', 'B', 'Cannot tell'] },
      { q: 'All dogs bark. Max barks. Is Max a dog?', ans: 'Not necessarily', wrong: ['Yes', 'No', 'Definitely'] },
      { q: 'Red is darker than yellow. Blue is darker than red. Which is lightest?', ans: 'Yellow', wrong: ['Red', 'Blue', 'Cannot tell'] },
      { q: 'If P then Q. P is true. What can we say about Q?', ans: 'Q is true', wrong: ['Q is false', 'Q might be false', 'Nothing'] },
      { q: 'Some birds can fly. Penguins are birds. Can penguins fly?', ans: 'Not necessarily', wrong: ['Yes', 'No birds can', 'All can'] },
      { q: 'Anna is taller than Beth but shorter than Carol. Who is in the middle?', ans: 'Anna', wrong: ['Beth', 'Carol', 'Cannot tell'] },
      { q: 'All squares are rectangles. All rectangles have 4 sides. Squares have:', ans: '4 sides', wrong: ['3 sides', '5 sides', 'Unknown'] }
    ];
    
    const l = all[this.rand(0, all.length - 1)];
    
    return {
      type: 'logic',
      category: 'problemSolving',
      categoryLabel: 'Logic',
      difficulty: 1.3,
      question: l.q,
      answer: l.ans,
      options: this.shuffle([l.ans, ...l.wrong]),
      explanation: `Logical deduction leads to: ${l.ans}`,
      visual: 'options'
    };
  },

  // VERBAL REASONING
  verbal() {
    const all = [
      { q: 'What is the opposite of "ancient"?', ans: 'Modern', wrong: ['Old', 'Historic', 'Antique'] },
      { q: 'Which word means the same as "rapid"?', ans: 'Fast', wrong: ['Slow', 'Steady', 'Calm'] },
      { q: 'What is the opposite of "expand"?', ans: 'Contract', wrong: ['Grow', 'Extend', 'Increase'] },
      { q: 'Which word means "to make easier"?', ans: 'Simplify', wrong: ['Complicate', 'Confuse', 'Elaborate'] },
      { q: 'What is a synonym for "enormous"?', ans: 'Huge', wrong: ['Tiny', 'Small', 'Average'] },
      { q: 'What is the opposite of "temporary"?', ans: 'Permanent', wrong: ['Brief', 'Short', 'Quick'] },
      { q: 'Which word means "very happy"?', ans: 'Ecstatic', wrong: ['Sad', 'Angry', 'Bored'] },
      { q: 'What is the opposite of "difficult"?', ans: 'Easy', wrong: ['Hard', 'Complex', 'Tough'] },
      { q: 'Which word means "to predict"?', ans: 'Forecast', wrong: ['Remember', 'Forget', 'Regret'] },
      { q: 'What is the opposite of "victory"?', ans: 'Defeat', wrong: ['Win', 'Success', 'Triumph'] },
      { q: 'Which word means "quiet"?', ans: 'Silent', wrong: ['Loud', 'Noisy', 'Booming'] },
      { q: 'What is a synonym for "smart"?', ans: 'Intelligent', wrong: ['Stupid', 'Slow', 'Dull'] }
    ];
    
    const v = all[this.rand(0, all.length - 1)];
    
    return {
      type: 'verbal',
      category: 'verbalReasoning',
      categoryLabel: 'Vocabulary',
      difficulty: 1.1,
      question: v.q,
      answer: v.ans,
      options: this.shuffle([v.ans, ...v.wrong]),
      explanation: `${v.ans} is the correct answer`,
      visual: 'options'
    };
  },

  // LETTER SEQUENCES
  letterSeq() {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const type = this.rand(0, 5);
    let seq, ans, exp;
    
    switch(type) {
      case 0: { // Skip one
        const start = this.rand(0, 15);
        seq = [alpha[start], alpha[start+2], alpha[start+4], alpha[start+6]];
        ans = alpha[start+8];
        exp = 'Skip one letter each time';
        break;
      }
      case 1: { // Consecutive
        const start = this.rand(0, 20);
        seq = [alpha[start], alpha[start+1], alpha[start+2], alpha[start+3]];
        ans = alpha[start+4];
        exp = 'Consecutive letters';
        break;
      }
      case 2: { // Backwards
        const start = this.rand(10, 25);
        seq = [alpha[start], alpha[start-1], alpha[start-2], alpha[start-3]];
        ans = alpha[start-4];
        exp = 'Going backwards through alphabet';
        break;
      }
      case 3: { // Skip two
        const start = this.rand(0, 10);
        seq = [alpha[start], alpha[start+3], alpha[start+6], alpha[start+9]];
        ans = alpha[start+12];
        exp = 'Skip two letters each time';
        break;
      }
      case 4: { // Increasing gaps
        seq = ['A', 'B', 'D', 'G'];
        ans = 'K';
        exp = 'Gaps increase: +1, +2, +3, +4';
        break;
      }
      default: { // Vowels
        seq = ['A', 'E', 'I', 'O'];
        ans = 'U';
        exp = 'Vowels in order';
      }
    }
    
    const wrong = alpha.split('').filter(l => l !== ans);
    
    return {
      type: 'letterSeq',
      category: 'patternRecognition',
      categoryLabel: 'Letter Pattern',
      difficulty: 1.1,
      question: 'What letter comes next?',
      sequence: seq,
      answer: ans,
      options: this.shuffle([ans, ...this.shuffle(wrong).slice(0, 3)]),
      explanation: exp,
      visual: 'letterSequence'
    };
  },

  // SPATIAL - No blue backgrounds, just text symbols
  spatial() {
    const puzzles = [
      { q: 'Rotate ▲ by 180 degrees', ans: '▼', wrong: ['▲', '◄', '►'], exp: '180° rotation flips it upside down' },
      { q: 'Mirror ◄ horizontally', ans: '►', wrong: ['▲', '▼', '◄'], exp: 'Horizontal mirror flips left to right' },
      { q: 'Rotate ► by 90° clockwise', ans: '▼', wrong: ['▲', '◄', '►'], exp: '90° clockwise: right becomes down' },
      { q: 'Mirror ▲ vertically', ans: '▼', wrong: ['◄', '►', '▲'], exp: 'Vertical mirror flips top to bottom' },
      { q: 'Rotate ▼ by 90° counter-clockwise', ans: '►', wrong: ['▲', '◄', '▼'], exp: 'Counter-clockwise: down becomes right' },
      { q: 'What is ◄ rotated 180°?', ans: '►', wrong: ['▲', '▼', '◄'], exp: '180° rotation reverses direction' },
      { q: 'Mirror ► vertically', ans: '►', wrong: ['▲', '▼', '◄'], exp: 'Vertical mirror keeps left-right same' },
      { q: 'Rotate ▲ by 270° clockwise', ans: '◄', wrong: ['►', '▼', '▲'], exp: '270° clockwise = 90° counter-clockwise' }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)];
    
    return {
      type: 'spatial',
      category: 'spatialAwareness',
      categoryLabel: 'Spatial',
      difficulty: 1.2,
      question: p.q,
      startShape: p.q.includes('▲') ? '▲' : p.q.includes('▼') ? '▼' : p.q.includes('◄') ? '◄' : '►',
      answer: p.ans,
      options: this.shuffle([p.ans, ...p.wrong]),
      explanation: p.exp,
      visual: 'spatial'
    };
  },

  // CODE BREAKING
  codeBreak() {
    const puzzles = [
      { q: 'If A=1, B=2, C=3... What is C+A+B?', ans: '6', wrong: ['3', '9', '12'], exp: 'C(3) + A(1) + B(2) = 6' },
      { q: 'If ★=5 and ●=3, what is ★+●+★?', ans: '13', wrong: ['11', '15', '8'], exp: '5 + 3 + 5 = 13' },
      { q: 'If ◆+◆=10 and ◆+●=12, what is ●?', ans: '7', wrong: ['5', '6', '8'], exp: '◆=5, so 5+●=12, ●=7' },
      { q: 'If X=2 and Y=X+3, what is Y?', ans: '5', wrong: ['3', '6', '4'], exp: 'Y = 2 + 3 = 5' },
      { q: 'If ▲=4 and ■=▲×2, what is ■?', ans: '8', wrong: ['6', '10', '12'], exp: '■ = 4 × 2 = 8' },
      { q: 'If 🔴=7 and 🔵=🔴-2, what is 🔵?', ans: '5', wrong: ['9', '4', '6'], exp: '🔵 = 7 - 2 = 5' },
      { q: 'If A=1, B=2... what is D+E?', ans: '9', wrong: ['7', '8', '10'], exp: 'D(4) + E(5) = 9' },
      { q: 'If ★×★=16, what is ★?', ans: '4', wrong: ['2', '8', '6'], exp: '4 × 4 = 16' }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)];
    
    return {
      type: 'codeBreak',
      category: 'problemSolving',
      categoryLabel: 'Code Breaker',
      difficulty: 1.3,
      question: p.q,
      answer: p.ans,
      options: this.shuffle([p.ans, ...p.wrong]),
      explanation: p.exp,
      visual: 'options'
    };
  },

  // VISUAL PATTERNS
  visualPattern() {
    const puzzles = [
      { q: '○ ○● ○●● → ?', ans: '○●●●', wrong: ['●●●●', '○○●●', '○●○●'], exp: 'Adding one ● each time' },
      { q: '★ ★★ ★★★ → ?', ans: '★★★★', wrong: ['★★★', '★★', '★★★★★'], exp: 'Adding one star each time' },
      { q: '▲▼ ▼▲ ▲▼ → ?', ans: '▼▲', wrong: ['▲▲', '▼▼', '▲▼'], exp: 'Pattern alternates' },
      { q: '● ●● ●●● ●●●● → ?', ans: '●●●●●', wrong: ['●●●●', '●●●', '●●'], exp: 'Adding one circle each time' },
      { q: '◆ ◇ ◆ ◇ → ?', ans: '◆', wrong: ['◇', '◆◇', '◇◆'], exp: 'Alternating filled and empty' },
      { q: '→ ↓ ← ↑ → ?', ans: '↓', wrong: ['←', '↑', '→'], exp: 'Rotating 90° clockwise' },
      { q: '■□ ■■□ ■■■□ → ?', ans: '■■■■□', wrong: ['■■■□', '□□□□', '■□■□'], exp: 'Adding one ■ before □' }
    ];
    
    const p = puzzles[this.rand(0, puzzles.length - 1)];
    
    return {
      type: 'visualPattern',
      category: 'patternRecognition',
      categoryLabel: 'Visual Pattern',
      difficulty: 1.2,
      question: p.q,
      answer: p.ans,
      options: this.shuffle([p.ans, ...p.wrong]),
      explanation: p.exp,
      visual: 'options'
    };
  },

  // WORD SEARCH - Now guaranteed to appear
  wordSearch() {
    const wordSets = [
      { words: ['CAT', 'DOG', 'RAT'], fill: 'XYZQWPLMN' },
      { words: ['SUN', 'MOON', 'STAR'], fill: 'XYZQWPLMN' },
      { words: ['RED', 'BLUE'], fill: 'XYZQWPLMNGTR' },
      { words: ['ONE', 'TWO', 'SIX'], fill: 'XYZQWPLMN' },
      { words: ['FISH', 'CRAB'], fill: 'XYZQWPLMNGTS' },
      { words: ['RAIN', 'SNOW'], fill: 'XYZQWPLMNGTS' },
      { words: ['BOOK', 'READ'], fill: 'XYZQWPLMNGTS' },
      { words: ['TREE', 'LEAF'], fill: 'XYZQWPLMNGTS' }
    ];
    
    const set = wordSets[this.rand(0, wordSets.length - 1)];
    
    // Build grid with words embedded
    let letters = set.words.join('');
    const needed = 25 - letters.length;
    for (let i = 0; i < needed; i++) {
      letters += set.fill[this.rand(0, set.fill.length - 1)];
    }
    
    // Shuffle the letters array but keep some structure
    const grid = letters.split('');
    for (let i = grid.length - 1; i > 10; i--) {
      const j = this.rand(10, i);
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    
    return {
      type: 'wordSearch',
      category: 'mentalAgility',
      categoryLabel: 'Word Hunt',
      difficulty: 1.4,
      question: `Find: ${set.words.join(', ')}`,
      words: set.words,
      totalWords: set.words.length,
      grid: grid,
      explanation: '',
      visual: 'wordSearch'
    };
  }
};