import { Module } from '@nestjs/common';
import { InjestionModule } from './ingestion/injestion.module.js';
import { PipelineModule } from './pipeline/pipeline.module.js';
import { ProcessingModule } from './processing/processing.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), InjestionModule, PipelineModule, ProcessingModule],
})
export class AppModule {}
