
export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  form: number;
  fatigue: number;
  impact: number;
  status: 'Starting' | 'Doubtful' | 'Injured';
  importance: number;
}

export interface CompositeIndices {
  offensivePower: number;
  defensiveSolidity: number;
  homeAdvantage: number;
  momentum: number;
  fatigue: number;
  motivation: number;
}

export interface TimeSeriesForecast {
  smoothed: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  seasonality: number;
  forecast: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface BayesianMetrics {
  entropy: number;
  tacticalAdvantage: number;
  inferenceConfidence: number;
}

export interface GeneticMetrics {
  bestFitness: number;
  convergence: number[];
  optimizedGenes: Record<string, number>;
}

export interface TimeSeriesAnalytics {
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
  forecast: {
    values: number[];
    upper: number[];
    lower: number[];
  };
  volatility: {
    conditional: number[];
    var95: number;
    expectedShortfall: number;
  };
}

export interface ValueBet {
  type: string;
  fairOdds: number;
  marketOdds: number;
  edge: number;
}

export interface EnsembleMetrics {
  poissonWeight: number;
  monteCarloWeight: number;
  bayesianWeight: number;
  modelConvergence: number;
}

export interface PredictionResult {
  homeTeam: Team;
  awayTeam: Team;
  winProb: number;
  drawProb: number;
  lossProb: number;
  confidenceIntervals?: {
    win: ConfidenceInterval;
    draw: ConfidenceInterval;
    loss: ConfidenceInterval;
  };
  expectedGoals: { home: number; away: number };
  firstHalfGoals: number;
  secondHalfGoals: number;
  exactScore: string;
  reasoning: string;
  keyMatchups: {
    area: string;
    description: string;
    advantage: 'Home' | 'Away' | 'Equal';
    impactScore: number;
  }[];
  sources: { title: string; uri: string }[];
  isSimulated?: boolean;
  confidenceIndex: number;
  riskMetrics?: {
    volatility: number;
    unexpectedFactor: number;
  };
  sensitivityAnalysis?: string;
  bayesianMetrics?: BayesianMetrics;
  geneticMetrics?: {
    home: GeneticMetrics;
    away: GeneticMetrics;
  };
  timeSeriesAnalytics?: {
    home: TimeSeriesAnalytics;
    away: TimeSeriesAnalytics;
  };
  topScores: { score: string; prob: number }[];
  valueBets: ValueBet[];
  ensembleMetrics: EnsembleMetrics;
}

export interface Team {
  name: string;
  logo?: string;
  players: Player[];
  averageForm: number;
  averageFatigue: number;
  momentum: number;
  injuryImpact: number;
  attackPower: number;
  midfieldPower: number;
  defensePower: number;
  eloRating?: number;
  compositeIndices?: CompositeIndices;
  forecast?: TimeSeriesForecast;
}

export interface TodaysMatch {
  home: string;
  away: string;
  competition: string;
  time: string;
  status: string;
  isLive: boolean;
}
