import { Injectable, Logger } from "@nestjs/common";
import { CROPS_API } from "./types/types";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ThirdPartyApiService {
  private readonly logger = new Logger(ThirdPartyApiService.name);

  private readonly MATBA_API_LOGIN_URL: string;
  private readonly MATBA_API_MARKET_URL: string;
  private readonly MATBA_API_USERNAME: string;
  private readonly MATBA_API_PASSWORD: string;
  private readonly MATBA_API_EMAIL: string;

  constructor(private readonly configService: ConfigService) {
    this.MATBA_API_LOGIN_URL = this.configService.getOrThrow(
      "MATBA_API_LOGIN_URL"
    );
    this.MATBA_API_MARKET_URL = this.configService.getOrThrow(
      "MATBA_API_MARKET_URL"
    );
    this.MATBA_API_USERNAME =
      this.configService.getOrThrow("MATBA_API_USERNAME");
    this.MATBA_API_EMAIL = this.configService.getOrThrow("MATBA_API_EMAIL");
    this.MATBA_API_PASSWORD =
      this.configService.getOrThrow("MATBA_API_PASSWORD");
  }

  async getToken(): Promise<{ access: string; refresh: string }> {
    const response = await fetch(this.MATBA_API_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.MATBA_API_USERNAME,
        email: this.MATBA_API_EMAIL,
        password: this.MATBA_API_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get token");
    }

    const data = await response.json();
    return data;
  }

  getCurrentMarketPrice(symbol: keyof typeof CROPS_API) {
    return { symbol, price: 100 };
  }
}
