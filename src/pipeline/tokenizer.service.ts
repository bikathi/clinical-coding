import { Injectable } from "@nestjs/common";
import { PipelineStep } from "./pipeline.interface.js";
import { TokenizerInput } from "../common/input-types.js";
import natural from 'natural';

@Injectable()
export class Tokenizer implements PipelineStep<TokenizerInput, string[]> {
  async execute(input: TokenizerInput): Promise<string[]> {
    const { text, language = 'English' } = input;

    let tokens: string[];

    switch (language.toLowerCase()) {
      case 'english': {
        const tokenizer = new natural.WordTokenizer();
        tokens = tokenizer.tokenize(text);
        // Apply stemming for English
        const stemmer = natural.PorterStemmer;
        tokens = tokens.map((t) => stemmer.stem(t));
        break;
      }
      case 'spanish': {
        const tokenizer = new natural.AggressiveTokenizerEs();
        tokens = tokenizer.tokenize(text);
        break;
      }
      case 'french': {
        const tokenizer = new natural.AggressiveTokenizerFr();
        tokens = tokenizer.tokenize(text);
        break;
      }
      case 'german': {
        const tokenizer = new natural.AggressiveTokenizerDe();
        tokens = tokenizer.tokenize(text);
        break;
      }
      default: {
        const tokenizer = new natural.WordTokenizer();
        tokens = tokenizer.tokenize(text);
      }
    }

    // stem words (English example)
    if (language.toLowerCase() === 'english') {
      const stemmer = natural.PorterStemmer;
      return tokens.map((t) => stemmer.stem(t));
    }

    return tokens;
  }
}
