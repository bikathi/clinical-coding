import { Module } from "@nestjs/common";
import { PipelineOrchestrator } from "./pipeline.service.js";
import { Tokenizer } from "./tokenizer.service.js";

@Module({
  providers: [PipelineOrchestrator, Tokenizer]
})
export class PipelineModule { }
