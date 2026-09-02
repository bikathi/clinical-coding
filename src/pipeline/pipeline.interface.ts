export interface PipelineStep<Input, Output> {
  execute(input: Input): Promise<Output>;
}
