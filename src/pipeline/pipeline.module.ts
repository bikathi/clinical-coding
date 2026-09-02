import { Module } from "@nestjs/common";
import { PipelineOrchestrator } from "./pipeline.service.js";
import { Tokenizer } from "./tokenizer.service.js";
import { Retriever } from "./retriever.service.js";
import { Reasoner } from "./reasonser.service.js";

@Module({
  providers: [PipelineOrchestrator, Tokenizer, Retriever, Reasoner]
})
export class PipelineModule { }
