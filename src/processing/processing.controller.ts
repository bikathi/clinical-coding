import { Controller, Get } from "@nestjs/common";

@Controller("/process")
export class ProcessingController {
  @Get("/id")
  async getSample() {
    return "Hello process ";
  }
}
