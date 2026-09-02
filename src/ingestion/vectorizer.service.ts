import { Injectable } from "@nestjs/common";
import { IngestionStep } from "./ingestion.interface.js";
import * as _ from 'lodash';
import { Document } from "langchain";
import { OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class Vectorizer implements IngestionStep {
  private embeddings = new OpenAIEmbeddings({
    modelName: process.env.OPENAI_MODEL!,
  })

  async execute(entries: any[]): Promise<Document[]> {

    // Convert entries into LangChain Documents
    const docs = entries.map(entry => new Document({
      pageContent: JSON.stringify(entry),
      metadata: { id: entry.id || entry.code }
    }));

    // Embed each document
    const vectors = await this.embeddings.embedDocuments(docs.map(d => d.pageContent));
    return docs.map((doc, i) => ({ ...doc, vector: vectors[i] }));
  }
}
