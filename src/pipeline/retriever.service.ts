import { Injectable } from "@nestjs/common";
import { PipelineStep } from "./pipeline.interface.js";
import { RetrieverInput } from "../common/input-types.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GuidelineMatch, ICDMatch } from "../common/chroma-retriever-types.js";

@Injectable()
export class Retriever implements PipelineStep<RetrieverInput, any> {
  private pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });
  private index = this.pc.index("clinical-pipeline");
  private embedder = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_MODEL!,
  });

  async execute(input: RetrieverInput): Promise<any> {
    const { note, topK = 3 } = input;

    // Generate embedding for the consult note
    const embedding = await this.embedder.embedQuery(note);

    // Query ICD catalog namespace
    const icdResults = await this.index.query({
      vector: embedding,
      topK,
      namespace: "icd_catalog",
      includeMetadata: true,
    });

    // Query guideline snippets namespace
    const guidelineResults = await this.index.query({
      vector: embedding,
      topK,
      namespace: "guideline_snippets",
      includeMetadata: true,
    });

    // Map ICD results
    const icdMatches: ICDMatch[] = (icdResults.matches || []).map((match) => {
      const md = match.metadata as any;
      return {
        id: match.id,
        code: md.code,
        title: md.title,
        chapter: md.chapter,
        synonyms: md.synonyms,
        distance: match.score ?? null,
      };
    });

    // Map Guideline results
    const guidelineMatches: GuidelineMatch[] = (guidelineResults.matches || []).map((match) => {
      const md = match.metadata as any;
      return {
        id: match.id,
        title: md.title,
        source: md.source,
        effective: md.effective,
        text: md.text,
        distance: match.score ?? null,
      };
    });

    // Return structured response
    return {
      icdMatches,
      guidelineMatches,
    };
  }
}
