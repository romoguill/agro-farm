import { ForbiddenException, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { TodosModule } from "./todos/todos.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({}),
    AuthModule.forRootAsync({
      imports: [DatabaseModule, ConfigModule],
      useFactory: (database: NodePgDatabase, configService: ConfigService) => ({
        auth: betterAuth({
          basePath: "/api/auth",
          database: drizzleAdapter(database, {
            provider: "pg",
          }),
          trustedOrigins: [
            configService.getOrThrow("UI_URL"),
            "http://localhost:3000",
          ],
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
                if (ctx.context.returned.statusCode === 422) {
                  throw new ForbiddenException(
                    "Email already in use. Try a different email, or sign in.",
                  );
                }
              }
            }),
          },
        }),
      }),
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
    TRPCModule.forRoot({
      autoSchemaFile: "../../packages/trpc/src/server",
    }),
    UsersModule,
    TodosModule,
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
