// ─── IQ PROFILE DATA MANAGER ───────────────────────────────────────────────
const IQData = {
  STORAGE_KEY: 'iq_profile_data',
  
  defaults: {
    profilePic: null,
    age: null,
    username: null,
    iq: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayed: null,
    stats: {
      problemSolving: { correct: 0, total: 0, rating: 1000 },
      memory: { correct: 0, total: 0, rating: 1000 },
      patternRecognition: { correct: 0, total: 0, rating: 1000 },
      commonSense: { correct: 0, total: 0, rating: 1000 },
      mentalAgility: { correct: 0, total: 0, rating: 1000 },
      emotionalIntelligence: { correct: 0, total: 0, rating: 1000 },
      verbalReasoning: { correct: 0, total: 0, rating: 1000 },
      spatialAwareness: { correct: 0, total: 0, rating: 1000 }
    }
  },

  getDifficultyForAge(age) {
    if (!age) return 1;
    if (age < 12) return 0.6;
    if (age < 16) return 0.8;
    if (age < 25) return 1.0;
    if (age < 40) return 1.15;
    if (age < 55) return 1.05;
    if (age < 70) return 0.9;
    return 0.75;
  },

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return this.mergeDefaults(data);
      }
    } catch (e) {
      console.error('Error loading IQ data:', e);
    }
    return JSON.parse(JSON.stringify(this.defaults));
  },

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

  save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving IQ data:', e);
    }
  },

  setAge(age) {
    const data = this.load();
    data.age = parseInt(age);
    this.save(data);
    return data;
  },

  recordAnswer(category, isCorrect, difficulty = 1, responseTime = null) {
    const data = this.load();
    const stat = data.stats[category];
    
    if (!stat) {
      console.error('Unknown category:', category);
      return data;
    }
    
    stat.total++;
    if (isCorrect) {
      stat.correct++;
      data.correctAnswers++;
    }
    
    const ageMult = this.getDifficultyForAge(data.age);
    const adjustedDiff = difficulty * ageMult;
    
    const gamesPlayed = stat.total;
    const k = Math.max(16, 40 - gamesPlayed * 0.3) * adjustedDiff;
    const expected = 1 / (1 + Math.pow(10, (1000 - stat.rating) / 400));
    const actual = isCorrect ? 1 : 0;
    
    let speedBonus = 0;
    if (isCorrect && responseTime && responseTime < 4000) {
      speedBonus = (4000 - responseTime) / 4000 * 4;
    }
    
    stat.rating = Math.max(400, Math.min(1600, stat.rating + k * (actual - expected) + speedBonus));
    
    if (isCorrect) {
      data.streak++;
      if (data.streak > data.bestStreak) {
        data.bestStreak = data.streak;
      }
    } else {
      data.streak = 0;
    }
    
    data.questionsAnswered++;
    data.lastPlayed = Date.now();
    data.iq = this.calculateIQ(data.stats, data.age);
    
    this.save(data);
    return data;
  },

  calculateIQ(stats, age) {
    const weights = {
      problemSolving: 0.18,
      memory: 0.12,
      patternRecognition: 0.22,
      commonSense: 0.08,
      mentalAgility: 0.15,
      emotionalIntelligence: 0.05,
      verbalReasoning: 0.12,
      spatialAwareness: 0.08
    };

    let weightedSum = 0;
    let totalWeight = 0;
    let totalQuestions = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const stat = stats[key];
      if (stat && stat.total > 0) {
        weightedSum += stat.rating * weight;
        totalWeight += weight;
        totalQuestions += stat.total;
      }
    }

    if (totalWeight === 0 || totalQuestions < 3) {
      return null;
    }

    const avgRating = weightedSum / totalWeight;
    let iq = 100 + ((avgRating - 1000) / 100) * 15;
    
    const confidence = Math.min(1, totalQuestions / 30);
    iq = 100 + (iq - 100) * confidence;
    
    if (age) {
      const ageFactor = this.getAgeNormalization(age);
      iq = iq * ageFactor;
    }
    
    return Math.round(Math.max(55, Math.min(195, iq)));
  },

  getAgeNormalization(age) {
    if (age < 10) return 1.12;
    if (age < 14) return 1.06;
    if (age < 18) return 1.02;
    if (age < 65) return 1.0;
    if (age < 75) return 1.02;
    return 1.04;
  },

  getStatPercent(category) {
    const data = this.load();
    const stat = data.stats[category];
    if (!stat) return 33;
    return Math.round(((stat.rating - 400) / 1200) * 100);
  },

  getAccuracy() {
    const data = this.load();
    if (data.questionsAnswered === 0) return 0;
    return Math.round((data.correctAnswers / data.questionsAnswered) * 100);
  },

  setProfilePic(base64) {
    const data = this.load();
    data.profilePic = base64;
    this.save(data);
  },

  setUsername(name) {
    const data = this.load();
    data.username = name;
    this.save(data);
  },

  needsOnboarding() {
    const data = this.load();
    return data.age === null;
  },

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

function erf(x) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1/(1+p*x);
  const y = 1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return s*y;
}

function iqToPercentile(iq) {
  if (!iq) return 50;
  const z = (iq - 100) / 15;
  const cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return (1 - cdf) * 100;
}

function formatPercentile(p) {
  if (p >= 10)    return Math.round(p) + '%';
  if (p >= 1)     return p.toFixed(1) + '%';
  if (p >= 0.1)   return p.toFixed(2) + '%';
  if (p >= 0.01)  return p.toFixed(3) + '%';
  return p.toFixed(4) + '%';
}

function getIQLabel(iq) {
  if (!iq) return 'Calculating...';
  if (iq >= 145) return 'Genius';
  if (iq >= 130) return 'Very Superior';
  if (iq >= 120) return 'Superior';
  if (iq >= 110) return 'High Average';
  if (iq >= 90) return 'Average';
  if (iq >= 80) return 'Low Average';
  if (iq >= 70) return 'Borderline';
  return 'Below Average';
}

const CATEGORIES = {
  problemSolving: { name: 'Problem Solving', short: 'PS', cssClass: 'ps', icon: '🧩' },
  memory: { name: 'Memory', short: 'MEM', cssClass: 'mem', icon: '🧠' },
  patternRecognition: { name: 'Pattern Recognition', short: 'PR', cssClass: 'pr', icon: '🔍' },
  commonSense: { name: 'Common Sense', short: 'CS', cssClass: 'cs', icon: '💡' },
  mentalAgility: { name: 'Mental Agility', short: 'MA', cssClass: 'ma', icon: '⚡' },
  emotionalIntelligence: { name: 'Emotional Intel.', short: 'EI', cssClass: 'ei', icon: '❤️' },
  verbalReasoning: { name: 'Verbal Reasoning', short: 'VR', cssClass: 'vr', icon: '📝' },
  spatialAwareness: { name: 'Spatial Awareness', short: 'SA', cssClass: 'sa', icon: '📐' }
};