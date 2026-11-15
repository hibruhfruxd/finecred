import type { AssessmentEngine } from "./types";
import { ReferenceAssessmentEngine } from "./reference-engine";

let activeEngine: AssessmentEngine = new ReferenceAssessmentEngine();

export function getAssessmentEngine(): AssessmentEngine {
  return activeEngine;
}

export function registerAssessmentEngine(engine: AssessmentEngine): void {
  activeEngine = engine;
}

export function resetAssessmentEngine(): void {
  activeEngine = new ReferenceAssessmentEngine();
}

export type {
  AssessmentEngine,
  AssessmentInput,
  AssessmentTransaction,
} from "./types";
export { ReferenceAssessmentEngine } from "./reference-engine";
