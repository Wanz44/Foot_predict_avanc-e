
import { TimeSeriesAnalytics } from "../types";

export class TimeSeriesAnalyzer {
  /**
   * Décomposition de série temporelle (STL) simplifiée
   */
  static decompose(data: number[], period: number = 4): { trend: number[], seasonal: number[], residual: number[] } {
    const n = data.length;
    
    // 1. Tendance par moyenne mobile centrée
    const trend = data.map((_, i) => {
      const start = Math.max(0, i - Math.floor(period / 2));
      const end = Math.min(n, i + Math.floor(period / 2) + 1);
      const slice = data.slice(start, end);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    // 2. Saisonnalité
    const detrended = data.map((y, i) => y - trend[i]);
    const seasonalPattern = Array(period).fill(0);
    const counts = Array(period).fill(0);
    
    detrended.forEach((val, i) => {
      seasonalPattern[i % period] += val;
      counts[i % period]++;
    });
    
    const avgSeasonal = seasonalPattern.map((sum, i) => sum / (counts[i] || 1));
    const seasonal = data.map((_, i) => avgSeasonal[i % period]);

    // 3. Résidus
    const residual = data.map((y, i) => y - trend[i] - seasonal[i]);

    return { trend, seasonal, residual };
  }

  /**
   * Prévision ARIMA simplifiée (Auto-Regressive)
   */
  static forecastARIMA(data: number[], horizon: number = 3): { values: number[], upper: number[], lower: number[] } {
    const lastVal = data[data.length - 1];
    const trend = (data[data.length - 1] - data[0]) / data.length;
    
    const values = Array.from({ length: horizon }, (_, i) => 
      lastVal + trend * (i + 1) + (Math.random() - 0.5) * 2
    );

    const upper = values.map((v, i) => v + (i + 1) * 1.5);
    const lower = values.map((v, i) => Math.max(0, v - (i + 1) * 1.5));

    return { values, upper, lower };
  }

  /**
   * Modèle GARCH(1,1) simplifié pour la volatilité de la forme
   */
  static fitGARCH(data: number[]): { conditional: number[], var95: number, expectedShortfall: number } {
    const returns = data.slice(1).map((val, i) => (val - data[i]) / (data[i] || 1));
    const omega = 0.05;
    const alpha = 0.15;
    const beta = 0.8;
    
    let currentVol = Math.sqrt(returns.reduce((a, b) => a + b * b, 0) / returns.length);
    const conditional: number[] = [currentVol];

    returns.forEach(r => {
      currentVol = Math.sqrt(omega + alpha * (r * r) + beta * (currentVol * currentVol));
      conditional.push(currentVol);
    });

    const var95 = currentVol * 1.645;
    const expectedShortfall = currentVol * 2.06;

    return { conditional, var95, expectedShortfall };
  }

  /**
   * Pipeline complet d'analyse
   */
  static analyze(data: number[]): TimeSeriesAnalytics {
    return {
      decomposition: this.decompose(data),
      forecast: this.forecastARIMA(data),
      volatility: this.fitGARCH(data)
    };
  }
}
