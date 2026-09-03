#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Tokenizer } from './pipeline/tokenizer.service.js';
import { Retriever } from './pipeline/retriever.service.js';
import { Reasoner } from './pipeline/reasonser.service.js';
import { Formatter } from './pipeline/formatter.service.js';
import { PipelineOrchestrator } from './pipeline/pipeline.service.js';

// Instantiate services manually for CLI
const tokenizer = new Tokenizer();
const retriever = new Retriever();
const reasoner = new Reasoner();
const formatter = new Formatter();
const pipeline = new PipelineOrchestrator(tokenizer, retriever, reasoner, formatter);

const inputPath = process.argv[2];
const argNote = process.argv[3];

let notes: string[] = [];

if (argNote) {
  // If a note string is passed directly, ignore the file
  notes = [argNote];
} else if (inputPath) {
  const content = fs.readFileSync(inputPath, 'utf-8');
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) notes = parsed;
    else if (parsed.note) notes = [parsed.note];
  } catch {
    notes = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  }
} else {
  console.error('Usage: node dist/cli.js <filePath> [noteString]');
  process.exit(1);
}

// Run pipeline on each note
(async () => {
  for (const note of notes) {
    const result = await pipeline.execute(note, 'English');
    console.log(JSON.stringify(result.formatted, null, 2));
  }
})();
