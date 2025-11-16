import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  @Get("/health")
  @AllowAnonymous()
  health() {
    throw new Error("testing");
    console.log("ok");
    return { status: "ok" };
  }
}
