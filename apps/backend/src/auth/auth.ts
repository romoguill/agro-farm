import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// For better-auth cli.
// npx @better-auth/cli generate --config=./src/auth/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(
    {},
    {
      provider: "pg",
    },
  ),
});
