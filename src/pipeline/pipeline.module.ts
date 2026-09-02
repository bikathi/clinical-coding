import { Module } from "@nestjs/common";
import { PipelineOrchestrator } from "./pipeline.service.js";
import { Tokenizer } from "./tokenizer.service.js";
import { Retriever } from "./retriever.service.js";

@Module({
  providers: [PipelineOrchestrator, Tokenizer, Retriever]
})
export class PipelineModule { }
