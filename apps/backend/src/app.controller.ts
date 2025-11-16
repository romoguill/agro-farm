import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  @Get("/health")
  @AllowAnonymous()
  health() {
    console.log("ok");
    return { status: "ok" };
  }
}
