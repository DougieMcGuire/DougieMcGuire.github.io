const QuestionGenerator = {
  age: 25,
  recent: [],

  setAge(a) { this.age = a || 25; },

  getDiff() {
    if (this.age < 12) return 'easy';
    if (this.age < 16) return 'medium';
    if (this.age < 50) return 'hard';
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
    while (opts.length < n) {
      let c = correct + this.rand(-10, 10);
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
      this.letterSeq
    ];
    
    const q = types[this.rand(0, types.length - 1)].call(this);
    
    // Avoid repeats
    const hash = q.answer + q.type;
    if (this.recent.includes(hash)) return this.generate();
    this.recent.push(hash);
    if (this.recent.length > 20) this.recent.shift();
    
    return q;
  },

  numberSeq() {
    const diff = this.getDiff();
    const patterns = [
      // Add
      () => {
        const add = diff === 'easy' ? this.rand(2, 5) : this.rand(3, 8);
        const start = this.rand(1, 10);
        const seq = [];
        let v = start;
        for (let i = 0; i < 5; i++) { seq.push(v); v += add; }
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Adding ${add} each time: ${seq[3]} + ${add} = ${seq[4]}` };
      },
      // Multiply
      () => {
        const mult = diff === 'easy' ? 2 : this.rand(2, 4);
        const start = this.rand(1, 4);
        const seq = [];
        let v = start;
        for (let i = 0; i < 5; i++) { seq.push(v); v *= mult; }
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Multiplying by ${mult}: ${seq[3]} × ${mult} = ${seq[4]}` };
      },
      // Squares
      () => {
        const off = this.rand(1, 3);
        const seq = [];
        for (let i = 1; i <= 5; i++) seq.push((i + off) ** 2);
        return { seq: seq.slice(0, 4), ans: seq[4], exp: `Perfect squares: ${off+1}², ${off+2}², ... ${off+5}² = ${seq[4]}` };
      },
      // Fibonacci
      () => {
        const a = this.rand(1, 3), b = this.rand(2, 4);
        const seq = [a, b];
        for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
        return { seq: seq.slice(0, 5), ans: seq[5], exp: `Each number = sum of previous two: ${seq[3]} + ${seq[4]} = ${seq[5]}` };
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
      // Multiply across
      () => {
        const m = this.rand(2, 3);
        const rows = [];
        for (let r = 0; r < 3; r++) {
          const b = this.rand(2, 4) + r;
          rows.push([b, b * m, b * m * m]);
        }
        const ans = rows[2][2];
        rows[2][2] = '?';
        return { grid: rows.flat(), ans, exp: `Each row multiplies by ${m}: ${rows[2][0]} × ${m} × ${m} = ${ans}` };
      },
      // Sum rows
      () => {
        const sum = this.rand(12, 20);
        const a = [this.rand(2, 5), this.rand(2, 5)];
        a.push(sum - a[0] - a[1]);
        const b = [this.rand(2, 5), this.rand(2, 5)];
        b.push(sum - b[0] - b[1]);
        const c = [this.rand(2, 5), this.rand(2, 5)];
        const ans = sum - c[0] - c[1];
        return { grid: [...a, ...b, c[0], c[1], '?'], ans, exp: `Each row sums to ${sum}: ${c[0]} + ${c[1]} + ? = ${sum}` };
      }
    ];
    
    const p = patterns[this.rand(0, patterns.length - 1)]();
    
    return {
      type: 'matrix',
      category: 'patternRecognition',
      categoryLabel: 'Matrix Pattern',
      difficulty: 1.2,
      question: 'What completes the grid?',
      grid: p.grid,
      answer: String(p.ans),
      options: this.genOpts(p.ans, 4).map(String),
      explanation: p.exp,
      visual: 'matrix'
    };
  },

  oddOne() {
    const sets = [
      { items: ['Apple', 'Banana', 'Carrot', 'Orange'], odd: 'Carrot', exp: 'Carrot is a vegetable; others are fruits' },
      { items: ['Dog', 'Cat', 'Fish', 'Hamster'], odd: 'Fish', exp: 'Fish lives in water; others are land pets' },
      { items: ['Red', 'Blue', 'Square', 'Green'], odd: 'Square', exp: 'Square is a shape; others are colors' },
      { items: ['Piano', 'Guitar', 'Violin', 'Drum'], odd: 'Drum', exp: 'Drum is percussion; others have strings' },
      { items: ['Mercury', 'Venus', 'Moon', 'Mars'], odd: 'Moon', exp: 'Moon is a satellite; others are planets' },
      { items: ['Whale', 'Shark', 'Dolphin', 'Seal'], odd: 'Shark', exp: 'Shark is a fish; others are mammals' },
      { items: ['Car', 'Bike', 'Boat', 'Bus'], odd: 'Boat', exp: 'Boat travels on water; others on roads' },
      { items: ['Compass', 'Ruler', 'Hammer', 'Protractor'], odd: 'Hammer', exp: 'Hammer builds; others measure/draw' },
      { items: ['Python', 'Java', 'English', 'Ruby'], odd: 'English', exp: 'English is human language; others are programming languages' },
      { items: ['Gold', 'Silver', 'Bronze', 'Diamond'], odd: 'Diamond', exp: 'Diamond is a gem; others are metals' }
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
      { a: 'Hot', b: 'Cold', c: 'Light', ans: 'Dark', wrong: ['Heavy', 'Bright', 'Lamp'], exp: 'Opposites: Hot↔Cold, Light↔Dark' },
      { a: 'Puppy', b: 'Dog', c: 'Kitten', ans: 'Cat', wrong: ['Mouse', 'Pet', 'Tiger'], exp: 'Young→Adult: Puppy→Dog, Kitten→Cat' },
      { a: 'Bird', b: 'Nest', c: 'Bee', ans: 'Hive', wrong: ['Honey', 'Flower', 'Wing'], exp: 'Home: Bird→Nest, Bee→Hive' },
      { a: 'Eye', b: 'See', c: 'Ear', ans: 'Hear', wrong: ['Sound', 'Music', 'Nose'], exp: 'Function: Eye→See, Ear→Hear' },
      { a: 'Fish', b: 'Swim', c: 'Bird', ans: 'Fly', wrong: ['Feather', 'Sing', 'Nest'], exp: 'Movement: Fish→Swim, Bird→Fly' },
      { a: 'Author', b: 'Book', c: 'Chef', ans: 'Dish', wrong: ['Kitchen', 'Food', 'Menu'], exp: 'Creates: Author→Book, Chef→Dish' },
      { a: 'Car', b: 'Garage', c: 'Plane', ans: 'Hangar', wrong: ['Airport', 'Sky', 'Pilot'], exp: 'Storage: Car→Garage, Plane→Hangar' },
      { a: 'Finger', b: 'Hand', c: 'Toe', ans: 'Foot', wrong: ['Leg', 'Shoe', 'Walk'], exp: 'Part of: Finger→Hand, Toe→Foot' }
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
      visual: 'analogy'
    };
  },

  math() {
    const diff = this.getDiff();
    const puzzles = [
      // Basic
      () => {
        const a = this.rand(5, 20), b = this.rand(2, 10);
        const ans = a + b;
        return { q: `${a} + ${b} = ?`, ans, exp: `${a} + ${b} = ${ans}` };
      },
      // Multiply
      () => {
        const a = this.rand(3, 12), b = this.rand(2, 9);
        const ans = a * b;
        return { q: `${a} × ${b} = ?`, ans, exp: `${a} × ${b} = ${ans}` };
      },
      // Percent
      () => {
        const base = this.rand(2, 10) * 10;
        const pct = [10, 20, 25, 50][this.rand(0, 3)];
        const ans = (base * pct) / 100;
        return { q: `${pct}% of ${base} = ?`, ans, exp: `${pct}% of ${base} = ${ans}` };
      },
      // Squares
      () => {
        const n = this.rand(3, 9);
        const ans = n * n;
        return { q: `${n}² = ?`, ans, exp: `${n} × ${n} = ${ans}` };
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
      { q: 'Tom is taller than Sam. Sam is taller than Mike. Who is shortest?', ans: 'Mike', wrong: ['Tom', 'Sam', 'Can\'t tell'], exp: 'Tom > Sam > Mike, so Mike is shortest' },
      { q: 'All dogs have tails. Max is a dog. Therefore:', ans: 'Max has a tail', wrong: ['Max might not', 'Dogs vary', 'Unknown'], exp: 'If all dogs have tails and Max is a dog, Max has a tail' },
      { q: 'If it rains, the ground gets wet. The ground is wet. Did it rain?', ans: 'Maybe', wrong: ['Yes', 'No', 'Definitely'], exp: 'Ground could be wet from other causes (sprinkler, etc.)' },
      { q: 'No cats are dogs. Some pets are cats. Therefore:', ans: 'Some pets aren\'t dogs', wrong: ['All pets are cats', 'No pets are dogs', 'Cats are pets'], exp: 'The cats that are pets can\'t be dogs' },
      { q: 'A is taller than B. C is shorter than B. Who is tallest?', ans: 'A', wrong: ['B', 'C', 'B or C'], exp: 'A > B > C, so A is tallest' }
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
      { q: 'HAPPY is opposite of:', ans: 'SAD', wrong: ['GLAD', 'JOY', 'SMILE'], exp: 'Happy and Sad are antonyms' },
      { q: 'Which means the same as QUICK?', ans: 'FAST', wrong: ['SLOW', 'SMALL', 'QUIET'], exp: 'Quick and Fast are synonyms' },
      { q: 'BOOK, COOK, LOOK, ___', ans: 'HOOK', wrong: ['TOOK', 'NOOK', 'ROOK'], exp: 'Words ending in -OOK' },
      { q: 'Which word is different?', ans: 'BOOK', items: ['PEN', 'PENCIL', 'BOOK', 'MARKER'], wrong: ['PEN', 'PENCIL', 'MARKER'], exp: 'Book is for reading; others are for writing' },
      { q: 'GIANT is to SMALL as LOUD is to:', ans: 'QUIET', wrong: ['BIG', 'NOISY', 'SOUND'], exp: 'Opposites: Giant↔Small, Loud↔Quiet' }
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
      { seq: ['A', 'B', 'D', 'G'], ans: 'K', exp: 'Gaps increase by 1: +1, +2, +3, +4' },
      { seq: ['M', 'N', 'O', 'P'], ans: 'Q', exp: 'Consecutive letters: M, N, O, P, Q' }
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
  }
};