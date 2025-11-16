import { Module } from "@nestjs/common";
import { ThirdPartyApiModule } from "@repo/third-party-api";
import { MarketDataController } from "./market-data.controller";

@Module({
  imports: [ThirdPartyApiModule.registerAsync()],
  controllers: [MarketDataController],
})
export class MarketDataModule {}
