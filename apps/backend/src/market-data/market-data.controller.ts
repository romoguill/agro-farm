import { Controller, Get } from "@nestjs/common";
import { ThirdPartyApiService } from "@repo/third-party-api";

@Controller("market-data")
export class MarketDataController {
  constructor(private readonly marketDataService: ThirdPartyApiService) {}

  @Get()
  getMarketData() {
    return this.marketDataService.getCurrentMarketPrice("CORN");
  }
}
