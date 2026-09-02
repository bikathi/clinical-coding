import { Module } from "@nestjs/common";
import { ProcessingController } from "./processing.controller.js";

@Module({
  controllers: [ProcessingController]
})
export class ProcessingModule {

}
