import { Body, Controller, Get, Post } from "@nestjs/common";
import { Tokenizer } from "../pipeline/tokenizer.service.js";
import { TokenizerInput } from "../common/input-types.js";
import { PipelineOrchestrator } from "../pipeline/pipeline.service.js";

@Controller("/process")
export class ProcessingController {
  constructor(private readonly pipeline: PipelineOrchestrator) {}

  @Post()
  async getSample(@Body() body: { note: string; language?: string } ) {
    const result = await this.pipeline.execute(body.note, body.language || 'English');
    
    return {
      message: 'Note processed successfully',
      ...result,
    };
  }
}
