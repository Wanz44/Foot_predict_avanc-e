
import { PoissonRegression } from "./poisson-regression";

export interface SimulationContext {
  homeAdvantage: number;
  weather: { intensity: number };
  fatigue: number;
  motivation: number;
}

export class MonteCarloSimulator {
  private static numSimulations = 100000; // 100k pour l'équilibre perf/précision

  /**
   * Simulation massive avec variations contextuelles et bruit gaussien
   */
  static async simulateMatch(
    homeTeam: any,
    awayTeam: any,
    poissonModel: PoissonRegression,
    baseContext: any
  ) {
    const results = {
      wins: 0,
      draws: 0,
      losses: 0,
      totalGoalsH: 0,
      totalGoalsA: 0,
      scenarios: [] as any[]
    };

    // Simulation itérative avec variations contextuelles
    for (let i = 0; i < this.numSimulations; i++) {
      const variedContext = this.generateContextVariations(baseContext);
      
      const hLambda = poissonModel.calculateLambda(homeTeam, awayTeam, true, variedContext as any);
      const aLambda = poissonModel.calculateLambda(awayTeam, homeTeam, false, variedContext as any);

      const goalsH = this.samplePoisson(hLambda);
      const goalsA = this.samplePoisson(aLambda);

      if (goalsH > goalsA) results.wins++;
      else if (goalsH < goalsA) results.losses++;
      else results.draws++;

      results.totalGoalsH += goalsH;
      results.totalGoalsA += goalsA;

      // Échantillonnage pour le bootstrap (1% des simulations)
      if (i % 100 === 0) {
        results.scenarios.push({ goalsH, goalsA });
      }
    }

    const probabilities = {
      win: (results.wins / this.numSimulations) * 100,
      draw: (results.draws / this.numSimulations) * 100,
      loss: (results.losses / this.numSimulations) * 100
    };

    const confidenceIntervals = this.calculateBootstrapConfidence(results.scenarios);

    return {
      ...probabilities,
      expectedGoals: {
        home: results.totalGoalsH / this.numSimulations,
        away: results.totalGoalsA / this.numSimulations
      },
      confidenceIntervals,
      riskMetrics: {
        volatility: Math.sqrt(probabilities.win * (100 - probabilities.win)) / 10,
        unexpectedFactor: Math.abs(results.totalGoalsH - results.totalGoalsA) / this.numSimulations
      }
    };
  }

  /**
   * Échantillonnage de Poisson (Knuth)
   */
  private static samplePoisson(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  /**
   * Box-Muller transform pour le bruit gaussien
   */
  private static randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private static generateContextVariations(base: any) {
    return {
      ...base,
      homeAdvantage: (base.homeAdvantage || 1.1) * (1 + 0.05 * this.randn()),
      fatigue: (base.fatigue || 10) * (1 + 0.1 * this.randn()),
      motivation: (base.motivation || 85) * (1 + 0.05 * this.randn())
    };
  }

  /**
   * Calcul des intervalles de confiance bootstrap (méthode des percentiles)
   */
  private static calculateBootstrapConfidence(scenarios: any[]) {
    const samples = 1000;
    const bootWin: number[] = [];
    const bootDraw: number[] = [];
    const bootLoss: number[] = [];

    for (let s = 0; s < samples; s++) {
      let w = 0, d = 0, l = 0;
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * scenarios.length);
        const sc = scenarios[idx];
        if (sc.goalsH > sc.goalsA) w++;
        else if (sc.goalsH < sc.goalsA) l++;
        else d++;
      }
      bootWin.push(w);
      bootDraw.push(d);
      bootLoss.push(l);
    }

    bootWin.sort((a, b) => a - b);
    bootDraw.sort((a, b) => a - b);
    bootLoss.sort((a, b) => a - b);

    return {
      win: { lower: bootWin[25], upper: bootWin[975] },
      draw: { lower: bootDraw[25], upper: bootDraw[975] },
      loss: { lower: bootLoss[25], upper: bootLoss[975] }
    };
  }
}
