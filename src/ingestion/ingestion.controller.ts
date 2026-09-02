import { Controller, Get } from "@nestjs/common";

@Controller("/injest")
export class InjestionController {
  @Get("/id")
  async getSample() {
    return "Hello injest";
  }
}
