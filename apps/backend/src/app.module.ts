import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { TodosModule } from "./todos/todos.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DATABASE_CONNECTION } from "./database/database-connection";

@Module({
  imports: [
    ConfigModule.forRoot({}),
    DatabaseModule,
    AuthModule.forRootAsync({
      useFactory: (database: NodePgDatabase) => ({
        auth: betterAuth({
          database: drizzleAdapter(database, {
            provider: "pg",
          }),
        }),
      }),
      inject: [DATABASE_CONNECTION],
    }),
    TRPCModule.forRoot({
      autoSchemaFile: "../../packages/trpc/src/server",
    }),
    TodosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
