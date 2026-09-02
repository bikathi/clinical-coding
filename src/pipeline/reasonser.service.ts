import { Injectable } from "@nestjs/common";
import { PipelineStep } from "./pipeline.interface.js";
import { GuidelineMatch, ICDMatch, ReasonerOutput, RetrievalResults } from "../common/chroma-retriever-types.js";

@Injectable()
export class Reasoner implements PipelineStep<RetrievalResults, ReasonerOutput> {
  async execute(input: RetrievalResults): Promise<ReasonerOutput> {
    const { icdMatches, guidelineMatches } = input;

    // Confidence scoring logic
    const codes = icdMatches.map((match: ICDMatch) => {
      let confidence = 1 / (1 + match.distance!); // inverse distance
      let rationale = `Matched on terms: ${match.synonyms?.join(', ') || 'N/A'}`;

      // Boost confidence if title directly contains "fever" or "cough"
      if (/fever|cough/i.test(match.title)) {
        confidence += 0.2;
        rationale += ' | Direct symptom match';
      }

      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);

      return {
        id: match.id,
        code: match.code,
        title: match.title,
        confidence,
        rationale,
      };
    });

    const guidelines = guidelineMatches.map((match: GuidelineMatch) => {
      let confidence = 1 / (1 + match.distance!);
      let rationale = `Guideline text analyzed`;

      if (/fever|cough/i.test(match.text)) {
        confidence += 0.2;
        rationale += ' | Direct symptom match';
      }

      confidence = Math.min(confidence, 1.0);

      return {
        id: match.id,
        title: match.title,
        confidence,
        rationale,
      };
    });

    // Filter out low-confidence entries (<0.3)
    const filteredCodes = codes.filter(c => c.confidence >= 0.3);
    const filteredGuidelines = guidelines.filter(g => g.confidence >= 0.3);

    // Conflict detection (simple example)
    // If two codes contradict (e.g., "fever of unknown origin" vs "pneumonia"), flag rationale
    for (const code of filteredCodes) {
      if (/unknown origin/i.test(code.title) && filteredCodes.some(c => /pneumonia/i.test(c.title))) {
        code.rationale += ' | Possible conflict with pneumonia assignment';
      }
    }

    return {
      codes: filteredCodes,
      guidelines: filteredGuidelines,
    };
  }
}
