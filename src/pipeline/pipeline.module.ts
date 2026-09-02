import { Module } from "@nestjs/common";
import { PipelineOrchestrator } from "./pipeline.service.js";

@Module({
  providers: [PipelineOrchestrator]
})
export class PipelineModule { }
