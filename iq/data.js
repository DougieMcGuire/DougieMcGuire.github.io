// ─── IQ PROFILE DATA MANAGER ───────────────────────────────────────────────
const IQData = {
  STORAGE_KEY: 'iq_profile_data',
  
  // Default starting data
  defaults: {
    profilePic: null,
    iq: 80,
    questionsAnswered: 0,
    streak: 0,
    lastPlayed: null,
    stats: {
      problemSolving: { correct: 0, total: 0, rating: 800 },
      memory: { correct: 0, total: 0, rating: 800 },
      patternRecognition: { correct: 0, total: 0, rating: 800 },
      commonSense: { correct: 0, total: 0, rating: 800 },
      mentalAgility: { correct: 0, total: 0, rating: 800 },
      emotionalIntelligence: { correct: 0, total: 0, rating: 800 }
    }
  },

  // Load data from localStorage
  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Merge with defaults to handle any missing fields
        return this.mergeDefaults(data);
      }
    } catch (e) {
      console.error('Error loading IQ data:', e);
    }
    return JSON.parse(JSON.stringify(this.defaults));
  },

  // Merge saved data with defaults
  mergeDefaults(data) {
    const merged = { ...this.defaults, ...data };
    merged.stats = { ...this.defaults.stats };
    if (data.stats) {
      for (const key in this.defaults.stats) {
        merged.stats[key] = { ...this.defaults.stats[key], ...data.stats[key] };
      }
    }
    return merged;
  },

  // Save data to localStorage
  save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving IQ data:', e);
    }
  },

  // Update a specific stat
  recordAnswer(category, isCorrect, difficulty = 1) {
    const data = this.load();
    const stat = data.stats[category];
    
    stat.total++;
    if (isCorrect) stat.correct++;
    
    // ELO-like rating adjustment
    const k = 32 * difficulty; // Higher K for harder questions
    const expected = 1 / (1 + Math.pow(10, (1000 - stat.rating) / 400));
    const actual = isCorrect ? 1 : 0;
    stat.rating = Math.max(400, Math.min(1600, stat.rating + k * (actual - expected)));
    
    data.questionsAnswered++;
    data.lastPlayed = Date.now();
    
    // Recalculate IQ
    data.iq = this.calculateIQ(data.stats);
    
    this.save(data);
    return data;
  },

  // Calculate overall IQ from stats
  calculateIQ(stats) {
    const weights = {
      problemSolving: 0.20,
      memory: 0.15,
      patternRecognition: 0.25,
      commonSense: 0.10,
      mentalAgility: 0.20,
      emotionalIntelligence: 0.10
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const stat = stats[key];
      if (stat.total > 0) {
        weightedSum += stat.rating * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return 80;

    // Convert rating (400-1600) to IQ scale (55-195)
    const avgRating = weightedSum / totalWeight;
    const iq = 55 + ((avgRating - 400) / 1200) * 140;
    
    return Math.round(Math.max(55, Math.min(195, iq)));
  },

  // Get stat as percentage (0-100)
  getStatPercent(category) {
    const data = this.load();
    const stat = data.stats[category];
    // Convert rating (400-1600) to 0-100
    return Math.round(((stat.rating - 400) / 1200) * 100);
  },

  // Set profile picture
  setProfilePic(base64) {
    const data = this.load();
    data.profilePic = base64;
    this.save(data);
  },

  // Reset all data
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

// ─── PERCENTILE CALCULATION ────────────────────────────────────────────────
function erf(x) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1/(1+p*x);
  const y = 1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return s*y;
}

function iqToPercentile(iq) {
  const z = (iq - 100) / 15;
  const cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return (1 - cdf) * 100;
}

function formatPercentile(p) {
  if (p >= 1)     return p.toFixed(1) + '%';
  if (p >= 0.1)   return p.toFixed(2) + '%';
  if (p >= 0.01)  return p.toFixed(3) + '%';
  if (p >= 0.001) return p.toFixed(4) + '%';
  return p.toFixed(5) + '%';
}

// ─── CATEGORY MAPPING ──────────────────────────────────────────────────────
const CATEGORIES = {
  problemSolving: { name: 'Problem Solving', short: 'PS', cssClass: 'ps' },
  memory: { name: 'Memory', short: 'MEM', cssClass: 'mem' },
  patternRecognition: { name: 'Pattern Recog.', short: 'PR', cssClass: 'pr' },
  commonSense: { name: 'Common Sense', short: 'CS', cssClass: 'cs' },
  mentalAgility: { name: 'Mental Agility', short: 'MA', cssClass: 'ma' },
  emotionalIntelligence: { name: 'Emotional Intel.', short: 'EI', cssClass: 'ei' }
};