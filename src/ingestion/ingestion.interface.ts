export interface IngestionStep {
  execute(input: any ): Promise<any>
}
