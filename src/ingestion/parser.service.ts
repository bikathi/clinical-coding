import { Injectable } from "@nestjs/common";
import { IngestionStep } from "./ingestion.interface.js";
import { GuidelineSnippetList, ICDCatalogList } from "../common/input-types.js";
import ld from 'lodash';

@Injectable()
export class Parser implements IngestionStep {
  async execute(input: string): Promise<GuidelineSnippetList | ICDCatalogList> {
    try {
      const parsed = JSON.parse(input);
      return ld.cloneDeep(parsed);
    } catch (err: any) {
      throw new Error('Failed to parse JSON file: ' + err.message)
    }
  }
}
