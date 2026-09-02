import { Injectable } from "@nestjs/common";
import { PipelineStep } from "./pipeline.interface.js";
import { RetrieverInput } from "../common/input-types.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChromaClient } from 'chromadb';
import { GuidelineMatch, ICDMatch } from "../common/chroma-retriever-types.js";

@Injectable()
export class Retriever implements PipelineStep<RetrieverInput, any> {
  private client = new ChromaClient({
    port: process.env.CHROMA_DB_PORT! as unknown as number,
    ssl: false,
  });
  private embedder = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_MODEL!,
  });

  async execute(input: RetrieverInput): Promise<any> {
    const { note, topK = 3 } = input;

    // Generate embedding for the consult note
    const embedding = await this.embedder.embedQuery(note);

    // Query ICD catalog collection
    const icdCollection = await this.client.getCollection({
      name: 'icd_catalog',
      embeddingFunction: null as any
    });
    const icdResults = await icdCollection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
    });

    // Query guideline snippets collection
    const guidelineCollection = await this.client.getCollection({
      name: 'guideline_snippets',
      embeddingFunction: null as any
    });
    const guidelineResults = await guidelineCollection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
    });

    // Map ICD results safely
    const icdMatches: ICDMatch[] = (icdResults.documents[0] || [])
      .filter((doc: string | null): doc is string => doc !== null)
      .map((doc: string, idx: number) => {
        const parsed = JSON.parse(doc);
        return {
          id: icdResults.ids[0][idx],
          code: parsed.code,
          title: parsed.title,
          chapter: parsed.chapter,
          synonyms: parsed.synonyms,
          distance: icdResults.distances[0][idx] ?? null,
        };
      });
    
    // Map Guideline results safely
    const guidelineMatches: GuidelineMatch[] = (guidelineResults.documents[0] || [])
      .filter((doc: string | null): doc is string => doc !== null)
      .map((doc: string, idx: number) => {
        const parsed = JSON.parse(doc);
        return {
          id: guidelineResults.ids[0][idx],
          title: parsed.title,
          source: parsed.source,
          effective: parsed.effective,
          text: parsed.text,
          distance: guidelineResults.distances[0][idx] ?? null,
        };
      });

    // Return structured response
    return {
      icdMatches,
      guidelineMatches,
    };
  }

}
