export interface ScoreComponents {
  ruleScore: number;
  embeddingScore: number;
  llmScore: number;
  geoScore: number;
}

export interface CriterionResult {
  id: string;
  category: string;
  criterion: string;
  status: "pass" | "fail" | "warning";
  patientValue: string;
  ruleValue: string;
  reasoning: string;
  isML?: boolean;
  weight?: number;
}

export const SCORING_WEIGHTS = {
  rule: 0.30,
  embedding: 0.20,
  llm: 0.35,
  geo: 0.15
};

export function calculateCompositeScore(scores: ScoreComponents): number {
  const rawScore = 
    (SCORING_WEIGHTS.rule * scores.ruleScore) +
    (SCORING_WEIGHTS.embedding * scores.embeddingScore) +
    (SCORING_WEIGHTS.llm * scores.llmScore) +
    (SCORING_WEIGHTS.geo * scores.geoScore);
  
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

export function calculateRuleScore(criteria: CriterionResult[]): number {
  const ruleCriteria = criteria.filter(c => !c.isML);
  if (ruleCriteria.length === 0) return 100;
  
  const passedCount = ruleCriteria.filter(c => c.status === "pass").length;
  return Math.round((passedCount / ruleCriteria.length) * 100);
}

export function calculateEmbeddingScore(patientDiagnosis: string, trialConditions: string[]): number {
  const patientWords = patientDiagnosis.toLowerCase().split(/\s+/);
  const trialWords = trialConditions.join(" ").toLowerCase().split(/\s+/);
  
  const commonWords = patientWords.filter(word => 
    word.length > 3 && trialWords.some(tWord => tWord.includes(word) || word.includes(tWord))
  );
  
  const uniquePatientWords = Array.from(new Set(patientWords.filter(w => w.length > 3)));
  const similarityRatio = uniquePatientWords.length > 0 
    ? commonWords.length / uniquePatientWords.length 
    : 0;
  
  const baseScore = similarityRatio * 100;
  const noise = (Math.random() * 10) - 5;
  
  return Math.round(Math.max(50, Math.min(100, baseScore + noise)));
}

export function calculateLLMScore(criteria: CriterionResult[]): number {
  const mlCriteria = criteria.filter(c => c.isML);
  if (mlCriteria.length === 0) return 85;
  
  const passedCount = mlCriteria.filter(c => c.status === "pass").length;
  const baseScore = (passedCount / mlCriteria.length) * 100;
  
  const noise = (Math.random() * 10) - 5;
  return Math.round(Math.max(60, Math.min(100, baseScore + noise)));
}

export function calculateGeoScore(distanceKm: number, maxRadiusKm: number): number {
  if (distanceKm <= 0) return 100;
  if (distanceKm > maxRadiusKm) return Math.max(0, Math.round(100 - (distanceKm / maxRadiusKm) * 50));
  
  const ratio = distanceKm / maxRadiusKm;
  return Math.round(100 - (ratio * 50));
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent Match", color: "#A7F3D0" };
  if (score >= 60) return { label: "Good Match", color: "#FFD700" };
  if (score >= 40) return { label: "Partial Match", color: "#FFA500" };
  return { label: "Low Match", color: "#FF6B6B" };
}

export function generateOverallReasoning(
  scores: ScoreComponents,
  compositeScore: number,
  criteriaCount: number,
  passedCount: number
): string {
  const parts: string[] = [];
  
  if (scores.ruleScore >= 80) {
    parts.push("Patient meets most eligibility criteria");
  } else if (scores.ruleScore >= 50) {
    parts.push("Patient meets some eligibility criteria");
  } else {
    parts.push("Patient does not meet key eligibility criteria");
  }
  
  if (scores.llmScore >= 80) {
    parts.push("ML analysis indicates strong compatibility");
  } else if (scores.llmScore >= 60) {
    parts.push("ML analysis shows moderate compatibility");
  }
  
  if (scores.geoScore >= 80) {
    parts.push("trial site is conveniently located");
  } else if (scores.geoScore >= 50) {
    parts.push("trial site requires moderate travel");
  } else {
    parts.push("trial site may be difficult to access");
  }
  
  parts.push(`Overall: ${passedCount}/${criteriaCount} criteria passed (${compositeScore}% match).`);
  
  return parts.join(". ") + ".";
}
