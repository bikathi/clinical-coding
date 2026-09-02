import { Injectable } from "@nestjs/common";
import { IngestionStep } from "./ingestion.interface.js";
import { FileType } from "../common/input-types.js";
import { ChromaClient } from 'chromadb';

@Injectable()
export class Storage implements IngestionStep {
  private client = new ChromaClient({ path: `http://localhost:${process.env.CHROMA_DB_PORT}` });

  async execute(docs: any[], type: FileType = FileType.ICD_CATALOG): Promise<string> {
    const collectionName = type === FileType.ICD_CATALOG ? 'icd_catalog' : 'guideline_snippets';

    // Ensure collection exists
    let collection;
    try {
      collection = await this.client.getCollection({ name: collectionName });
    } catch {
      collection = await this.client.createCollection({
        name: collectionName,
        embeddingFunction: null as any, // <-- disables default embedder
      });
    }

    // Prepare data
    const ids = docs.map((doc) => doc.metadata.id);
    const embeddings = docs.map((doc) => doc.vector);
    const metadatas = docs.map((doc) => doc.metadata);
    const documents = docs.map((doc) => doc.pageContent);

    // Store in ChromaDB
    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents,
    });

    return `Stored ${docs.length} documents in ${collectionName}`;
  }
}
