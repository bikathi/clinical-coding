import { Injectable } from "@nestjs/common";
import { PipelineStep } from "./pipeline.interface.js";
import { ReasonerOutput } from "../common/chroma-retriever-types.js";
import { FormatterOutput } from "../common/output-types.js";

@Injectable()
export class Formatter implements PipelineStep<ReasonerOutput, FormatterOutput> {
  async execute(input: ReasonerOutput): Promise<FormatterOutput> {
    const { codes, guidelines } = input;

    // Sort by confidence descending
    const sortedCodes = [...codes].sort((a, b) => b.confidence - a.confidence);
    const sortedGuidelines = [...guidelines].sort((a, b) => b.confidence - a.confidence);
    
    // Decide status: if top code < 0.7 confidence, mark uncertain
    const status: 'ok' | 'uncertain' = sortedCodes.length > 0 && sortedCodes[0].confidence >= 0.7
      ? 'ok'
      : 'uncertain';
    
    return {
      status,
      probableCodes: sortedCodes.map(c => ({
        code: c.code,
        title: c.title,
        confidence: c.confidence,
        rationale: c.rationale,
      })),
      probableGuidelines: sortedGuidelines.map(g => ({
        title: g.title,
        confidence: g.confidence,
        rationale: g.rationale,
      })),
    };
  }
}
