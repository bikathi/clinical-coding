import { Module } from "@nestjs/common";
import { InjestionController } from "./ingestion.controller.js";
import { Parser } from "./parser.service.js";
import { Storage } from "./storage.service.js";
import { Vectorizer } from "./vectorizer.service.js";

@Module({
  providers: [Parser, Storage, Vectorizer],
  controllers: [InjestionController]
})
export class InjestionModule {

}
