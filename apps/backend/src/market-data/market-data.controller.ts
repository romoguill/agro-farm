import { Controller, Get } from "@nestjs/common";
import { ThirdPartyApiService } from "@repo/third-party-api";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller("market-data")
export class MarketDataController {
  constructor(private readonly marketDataService: ThirdPartyApiService) {}

  @Get()
  @AllowAnonymous()
  getMarketData() {
    console.log(this.marketDataService.getCurrentMarketPrice("CORN"));
    return this.marketDataService.getCurrentMarketPrice("CORN");
  }
}
