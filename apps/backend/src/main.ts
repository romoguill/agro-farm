import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import type { Server as HttpServer } from "http";
declare const module: {
  hot?: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const shutdown = async () => {
    try {
      await app.close();
    } catch {
      // no-op
    }
    const httpServer = app.getHttpServer() as HttpServer;
    if (httpServer && typeof httpServer.close === "function") {
      try {
        httpServer.close();
      } catch {
        // no-op
      }
    }
    process.exit(0);
  };

  ["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
    process.on(signal as NodeJS.Signals, () => {
      void shutdown();
    });
  });

  if (module && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      void shutdown();
    });
  }
}
void bootstrap();
