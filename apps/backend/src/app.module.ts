import {
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  Module,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard, AuthModule } from "@thallesp/nestjs-better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TRPCModule } from "nestjs-trpc";
import { AppController } from "./app.controller";
import { DATABASE_CONNECTION } from "./database/database-connection";
import { DatabaseModule } from "./database/database.module";
import { MarketDataModule } from "./market-data/market-data.module";
import { TodosModule } from "./todos/todos.module";
import { UsersModule } from "./users/users.module";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRootAsync({
      imports: [DatabaseModule, ConfigModule],
      useFactory: (database: NodePgDatabase) => {
        const logger = new Logger(AuthModule.name);

        const auth = betterAuth({
          basePath: "/api/auth",
          database: drizzleAdapter(database, {
            provider: "pg",
          }),
          advanced: { disableOriginCheck: true },
          emailAndPassword: {
            enabled: true,
          },
          onAPIError: {
            throw: true,
          },

          hooks: {
            // eslint-disable-next-line @typescript-eslint/require-await
            after: createAuthMiddleware(async (ctx) => {
              if (ctx.context.returned instanceof APIError) {
                switch (ctx.context.returned.statusCode) {
                  case 422:
                    throw new ForbiddenException(
                      "Email already in use. Try a different email, or sign in.",
                    );
                  case 400:
                    throw new UnauthorizedException("Invalid credentials");
                  default:
                    logger.error(ctx.context.returned);
                    throw new InternalServerErrorException(
                      `Unknown error ocurred in the authentication process: ${
                        ctx.context.returned.message
                      }`,
                    );
                }
              }
            }),
          },
        });
        return { auth };
      },
      inject: [DATABASE_CONNECTION],
    }),
    TRPCModule.forRoot({
      autoSchemaFile: "../../packages/trpc/src/server",
    }),
    RedisModule,
    UsersModule,
    TodosModule,
    MarketDataModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
