import { ForbiddenException, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import {
  AuthGuard,
  AuthHookContext,
  AuthModule,
} from "@thallesp/nestjs-better-auth";
import { betterAuth, Status } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TRPCModule } from "nestjs-trpc";
import { DATABASE_CONNECTION } from "./database/database-connection";
import { DatabaseModule } from "./database/database.module";
import { TodosModule } from "./todos/todos.module";
import { UsersModule } from "./users/users.module";
import { AppController } from "./app.controller";
import { createAuthMiddleware } from "better-auth/api";

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
            after: createAuthMiddleware(async (ctx) => {
              console.log(ctx.context.returned);
              // @ts-expect-error - better-auth handling error
              if (ctx.context?.returned?.statusCode === 422) {
                throw new ForbiddenException("Invalid credentials");
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
