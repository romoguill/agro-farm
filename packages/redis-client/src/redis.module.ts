import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REDIS_CONNECTION } from "./tokens";
import Redis from "ioredis";

let redisClient: Redis;

@Module({
  imports: [],
  providers: [
    {
      provide: REDIS_CONNECTION,
      useFactory: (configService: ConfigService) => {
        if (!redisClient) {
          redisClient = new Redis({
            host: configService.getOrThrow("REDIS_HOST"),
            port: configService.getOrThrow("REDIS_PORT"),
          });
        }

        return redisClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CONNECTION],
})
export class RedisModule {}
