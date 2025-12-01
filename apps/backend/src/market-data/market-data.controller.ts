import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThirdPartyApiService } from "@repo/third-party-api";

@Controller("market-data")
export class MarketDataController {
  constructor(
    private readonly marketDataService: ThirdPartyApiService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getMarketData() {
    return this.marketDataService.getCurrentMarketPrice("CORN", {
      username: this.configService.getOrThrow<string>("MATBA_API_USERNAME"),
      password: this.configService.getOrThrow<string>("MATBA_API_PASSWORD"),
    });
  }
}
