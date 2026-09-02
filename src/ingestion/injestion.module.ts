import { Module } from "@nestjs/common";
import { InjestionController } from "./ingestion.controller.js";

@Module({
  controllers: [InjestionController]
})
export class InjestionModule {

}
