import { Injectable } from "@nestjs/common";
import { Tokenizer } from "./tokenizer.service.js";
import { RetrieverInput, TokenizerInput } from "../common/input-types.js";
import { Retriever } from "./retriever.service.js";

@Injectable()
export class PipelineOrchestrator {
  constructor(
    private readonly tokenizer: Tokenizer,
    private readonly retriever: Retriever
  ) { }

  async execute(note: string, language: string = 'English') {
    // Step 1: Tokenize
    const input: TokenizerInput = { text: note, language };
    const tokens = await this.tokenizer.execute(input);

    // Step 2: Retrieve from ChromaDB
        const retrieverInput: RetrieverInput = { note, topK: 3 };
        const retrievalResults = await this.retriever.execute(retrieverInput);

    // Later: pass tokens into retriever → reasoner → formatter
    return {
      tokens,
      retrievalResults,
    };
  }
}
