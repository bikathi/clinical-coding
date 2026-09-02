import { Module } from "@nestjs/common";
import { PipelineOrchestrator } from "./pipeline.service.js";
import { Tokenizer } from "./tokenizer.service.js";
import { Retriever } from "./retriever.service.js";
import { Reasoner } from "./reasonser.service.js";
import { Formatter } from "./formatter.service.js";

@Module({
  providers: [PipelineOrchestrator, Tokenizer, Retriever, Reasoner, Formatter]
})
export class PipelineModule { }
