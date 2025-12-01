import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThirdPartyApiService } from "./third-party-api.service";
import { RedisModule } from "@repo/redis-client";

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ThirdPartyApiModule {
  static registerAsync(): DynamicModule {
    return {
      module: ThirdPartyApiModule,
      imports: [ConfigModule, RedisModule],
      providers: [ThirdPartyApiService],
      exports: [ThirdPartyApiService],
    };
  }
}
