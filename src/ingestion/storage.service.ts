import { Injectable } from "@nestjs/common";
import { IngestionStep } from "./ingestion.interface.js";
import { FileType } from "../common/input-types.js";
import { Pinecone } from "@pinecone-database/pinecone";

@Injectable()
export class Storage implements IngestionStep {
  private pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  private index = this.pc.index({ name: "clinical-pipeline" });

  async execute(docs: any[], type: FileType = FileType.ICD_CATALOG): Promise<string> {
    const namespace = type === FileType.ICD_CATALOG ? "icd_catalog" : "guideline_snippets";

    // Prepare records for Pinecone
        const records = docs.map((doc) => ({
          id: doc.metadata.id,
          values: doc.vector, // embedding array
          metadata: {
            ...doc.metadata,
            text: doc.pageContent,
            type: namespace,
          },
        }));

        const BATCH_SIZE = 100; // adjust until each batch < 2MB
        
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        await this.index.upsert({
          records: batch,
          namespace,
        });
      }

      return `Stored ${docs.length} documents in namespace ${namespace}`;
  }
}
