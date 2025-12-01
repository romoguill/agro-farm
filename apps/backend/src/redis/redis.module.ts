import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

export const REDIS_CONNECTION = "redis_connection";

@Module({
  imports: [],
  providers: [
    {
      provide: REDIS_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.getOrThrow("REDIS_HOST"),
          port: configService.getOrThrow("REDIS_PORT"),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CONNECTION],
})
export class RedisModule {}
