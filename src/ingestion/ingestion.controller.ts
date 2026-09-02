import { Controller, Body, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileType } from "../common/input-types.js";
import { type Express } from 'express';
import { FileInterceptor } from "@nestjs/platform-express";
import { Parser } from "./parser.service.js";
import { Vectorizer } from "./vectorizer.service.js";
import { Storage } from "./storage.service.js";

@Controller("injest")
export class InjestionController {
  constructor(
    private readonly parser: Parser,
    private readonly vectorizer: Vectorizer,
    private readonly storage: Storage
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async injestFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: FileType
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    if (!type) {
      throw new Error('File type not provided');
    }

    // Step 1: Parse JSON
    const parsedEntries = await this.parser.execute(file.buffer.toString());

    // Step 2: Vectorize entries
    const vectorizedDocs = await this.vectorizer.execute(parsedEntries);

    // Step 3: Store (stub for now)
    const result = await this.storage.execute(vectorizedDocs, type);

    return {
      message: 'File processed successfully',
      type,
      stored: result,
    };
  }
}
