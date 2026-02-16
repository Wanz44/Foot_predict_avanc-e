
import { GoogleGenAI } from "@google/genai";
import { PredictionResult, TodaysMatch, Team } from "../types";
import { AdvancedPredictionEngine } from "../core/advanced-engine";
import { PoissonRegression } from "../models/poisson-regression";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.error("Clé API Gemini manquante. Configurez API_KEY dans vos variables d'environnement.");
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Erreur d'initialisation Gemini:", e);
    return null;
  }
};

export const analyzeMatch = async (homeTeamName: string, awayTeamName: string): Promise<PredictionResult> => {
  const ai = getAI();
  let bayesianBias = 1.0;
  let groundingSources: { title: string; uri: string }[] = [];
  let weather: any = 'Clear';
  let matchImportance = 0.7;

  if (ai) {
    try {
      const prompt = `Analyse tactique complète pour ${homeTeamName} vs ${awayTeamName}. 
      Recherche : formation probable, style de jeu, blessures majeures, météo et importance du match.
      Donne un indice d'avantage (0.8-1.2) et la météo (Clear, Rain, Windy, Extreme).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      const text = response.text || "";
      const biasMatch = text.match(/([0-1]\.[0-9]+)/);
      if (biasMatch) bayesianBias = parseFloat(biasMatch[0]);

      if (text.toLowerCase().includes('pluie') || text.toLowerCase().includes('rain')) weather = 'Rain';
      if (text.toLowerCase().includes('finale') || text.toLowerCase().includes('derby')) matchImportance = 1.0;

      groundingSources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
        .map((c: any) => ({ title: c.web?.title || "Source", uri: c.web?.uri || "" }))
        .filter((s: any) => s.uri !== "");
    } catch (e) {
      console.warn("Analyse IA indisponible, utilisation des statistiques de base.");
    }
  }

  const getHash = (s: string) => s.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const hSeed = Math.abs(getHash(homeTeamName));
  const aSeed = Math.abs(getHash(awayTeamName));

  const hProfile = await AdvancedPredictionEngine.buildDeepProfile(homeTeamName, hSeed);
  const aProfile = await AdvancedPredictionEngine.buildDeepProfile(awayTeamName, aSeed);

  const poisson = new PoissonRegression();
  const context = { 
    weather, 
    homeAdvantage: 1.15 * bayesianBias, 
    fatigue: 10, 
    motivation: 85,
    importance: matchImportance
  };

  const diagnostic = await AdvancedPredictionEngine.computeFinalDiagnostic(
    { ...hProfile.indices, name: homeTeamName },
    { ...aProfile.indices, name: awayTeamName },
    poisson,
    context
  );

  return {
    homeTeam: { 
      name: homeTeamName, players: [], averageForm: Math.round(hProfile.indices.offensivePower), 
      averageFatigue: hProfile.indices.fatigue, momentum: hProfile.indices.momentum, injuryImpact: 0.05,
      attackPower: Math.round(hProfile.indices.offensivePower), midfieldPower: 82, defensePower: Math.round(hProfile.indices.defensiveSolidity),
      compositeIndices: hProfile.indices, forecast: hProfile.forecast
    },
    awayTeam: { 
      name: awayTeamName, players: [], averageForm: Math.round(aProfile.indices.offensivePower), 
      averageFatigue: aProfile.indices.fatigue, momentum: aProfile.indices.momentum, injuryImpact: 0.1,
      attackPower: Math.round(aProfile.indices.offensivePower), midfieldPower: 76, defensePower: Math.round(aProfile.indices.defensiveSolidity),
      compositeIndices: aProfile.indices, forecast: aProfile.forecast
    },
    winProb: Math.round(diagnostic.win),
    drawProb: Math.round(diagnostic.draw),
    lossProb: Math.round(diagnostic.loss),
    confidenceIntervals: diagnostic.confidenceIntervals,
    expectedGoals: diagnostic.expectedGoals,
    firstHalfGoals: Math.round(diagnostic.expectedGoals.home * 0.42),
    secondHalfGoals: Math.round(diagnostic.expectedGoals.home * 0.58),
    exactScore: diagnostic.topScores[0].score,
    confidenceIndex: Math.round(diagnostic.confidence * 100),
    riskMetrics: diagnostic.riskMetrics,
    sensitivityAnalysis: diagnostic.sensitivityAnalysis,
    bayesianMetrics: diagnostic.bayesianMetrics,
    geneticMetrics: {
      home: hProfile.geneticMetrics,
      away: aProfile.geneticMetrics
    },
    timeSeriesAnalytics: {
      home: hProfile.tsAnalysis,
      away: aProfile.tsAnalysis
    },
    topScores: diagnostic.topScores,
    valueBets: diagnostic.valueBets,
    ensembleMetrics: diagnostic.ensembleMetrics,
    reasoning: `ASE v5.5 Pipeline Pro : Agrégation d'ensemble optimisée (Poisson/MC/Bayes). Convergence validée à ${Math.round(diagnostic.ensembleMetrics.modelConvergence * 100)}%.`,
    keyMatchups: [
      { area: "Agrégation d'Ensemble", description: `Modèle hybride pondéré. Poisson 35%, MC 40%, Bayes 25%. Stabilité maximale.`, advantage: 'Equal', impactScore: 10 },
      { area: "Séries Temporelles", description: `Analyse GARCH : VaR 95% = ${hProfile.tsAnalysis.volatility.var95.toFixed(2)}.`, advantage: 'Equal', impactScore: 7 }
    ],
    sources: groundingSources,
    isSimulated: true
  };
};

export const getTodaysMatches = async (): Promise<TodaysMatch[]> => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Liste les 30 matchs de foot du jour en JSON: [{home, away, competition, time, status, isLive}]. Ne renvoie que le JSON.",
      config: { tools: [{ googleSearch: {} }] }
    });
    const jsonMatch = (response.text || "").match(/\[\s*\{[\s\S]*\}\s*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.warn("Erreur récupération matchs du jour:", e);
    return [];
  }
};

export const generateMatchPoster = async (home: string, away: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Cinematic pro football match poster ${home} vs ${away}, 8k stadium lighting.`,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  } catch (e) {}
  return null;
};
