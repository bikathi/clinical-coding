import { Injectable } from "@nestjs/common";
import { Tokenizer } from "./tokenizer.service.js";
import { TokenizerInput } from "../common/input-types.js";

@Injectable()
export class PipelineOrchestrator {
  constructor(
    private readonly tokenizer: Tokenizer
  ) { }

  async execute(note: string, language: string = 'English') {
    const input: TokenizerInput = { text: note, language };
    const tokens = await this.tokenizer.execute(input);

    // Later: pass tokens into retriever → reasoner → formatter
    return { tokens };
  }
}
