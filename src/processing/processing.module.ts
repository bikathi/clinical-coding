import { Module } from "@nestjs/common";
import { ProcessingController } from "./processing.controller.js";
import { Tokenizer } from "../pipeline/tokenizer.service.js";
import { PipelineOrchestrator } from "../pipeline/pipeline.service.js";
import { Retriever } from "../pipeline/retriever.service.js";
import { Reasoner } from "../pipeline/reasonser.service.js";
import { Formatter } from "../pipeline/formatter.service.js";

@Module({
  controllers: [ProcessingController],
  providers: [Tokenizer, Retriever, Reasoner, Formatter, PipelineOrchestrator]
})
export class ProcessingModule {

}
