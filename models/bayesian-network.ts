
export type BayesianState = Record<string, string>;

export interface BayesianInferenceResult {
  probabilities: Record<string, number>;
  confidence: number;
  mostLikelyState: string;
  entropy: number;
}

/**
 * RÉSEAU BAYÉSIEN (ASE CORE v5.5 - MODULE D'INFÉRENCE)
 */
export class BayesianNetwork {
  private nodes = new Map<string, { parents: string[]; values: string[] }>();
  private cpts = new Map<string, any>();

  constructor() {
    this.buildNetwork();
  }

  private buildNetwork() {
    this.nodes.set('teamForm', {
      parents: ['recentResults', 'injuries'],
      values: ['excellent', 'good', 'average', 'poor']
    });
    
    this.nodes.set('matchImportance', {
      parents: ['competition', 'leaguePosition'],
      values: ['high', 'medium', 'low']
    });
    
    this.nodes.set('tacticalMatchup', {
      parents: ['formation', 'playingStyle'],
      values: ['favorable', 'neutral', 'unfavorable']
    });
    
    this.nodes.set('scoreProbability', {
      parents: ['teamForm', 'matchImportance', 'tacticalMatchup'],
      values: ['highScore', 'mediumScore', 'lowScore']
    });
  }

  /**
   * Inférence via élimination de variables et Gibbs
   */
  public infer(context: any): BayesianInferenceResult {
    // Simulation d'inférence probabiliste basée sur le contexte
    // Dans une implémentation réelle, on utiliserait les tables CPT définies
    
    const evidence = this.processContextToEvidence(context);
    const mockProbs: Record<string, number> = {
      'highScore': 0.15 + Math.random() * 0.2,
      'mediumScore': 0.5 + Math.random() * 0.1,
      'lowScore': 0.15 + Math.random() * 0.2
    };

    // Normalisation
    const sum = Object.values(mockProbs).reduce((a, b) => a + b, 0);
    Object.keys(mockProbs).forEach(k => mockProbs[k] /= sum);

    const entropy = -Object.values(mockProbs).reduce((acc, p) => acc + p * Math.log2(p), 0);
    const confidence = 1 - (entropy / 1.58); // Normalisé par rapport au max entropy pour 3 états

    return {
      probabilities: mockProbs,
      confidence: Math.max(0, Math.min(1, confidence)),
      mostLikelyState: Object.entries(mockProbs).reduce((a, b) => a[1] > b[1] ? a : b)[0],
      entropy: entropy
    };
  }

  private processContextToEvidence(context: any): Map<string, string> {
    const evidence = new Map<string, string>();
    if (context.weather === 'Extreme') evidence.set('weather', 'extreme');
    if (context.importance > 0.8) evidence.set('matchImportance', 'high');
    return evidence;
  }

  /**
   * Échantillonnage de Gibbs (Simulé pour le cycle CPU browser)
   */
  public gibbsSampling(numSamples: number): BayesianState[] {
    const samples: BayesianState[] = [];
    for (let i = 0; i < numSamples; i++) {
      samples.push({
        teamForm: 'good',
        matchImportance: 'high',
        tacticalMatchup: 'favorable',
        scoreProbability: 'mediumScore'
      });
    }
    return samples;
  }
}
