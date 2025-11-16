import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThirdPartyApiService } from "./third-party-api.service";

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ThirdPartyApiModule {
  static registerAsync(): DynamicModule {
    return {
      module: ThirdPartyApiModule,
      imports: [ConfigModule],
      providers: [ThirdPartyApiService],
      exports: [ThirdPartyApiService],
    };
  }
}
