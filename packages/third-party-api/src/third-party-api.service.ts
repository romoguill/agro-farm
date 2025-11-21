import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CROPS_API } from "./types/types";
import { ConfigService } from "@nestjs/config";

type MatbaCedentials = {
  username: string;
  email: string;
  password: string;
};

type MatbaMarketData = {
  indexValue: number;
  maturity: number;
  mdEntryDateTime: string;
  unixTimestamp: number;
  name: string;
};

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

  private async getToken(
    credentials: MatbaCedentials
  ): Promise<{ access: string; refresh: string }> {
    const response = await fetch(this.MATBA_API_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...credentials }),
    });

    const body = await response.json();

    if (!response.ok) {
      this.logger.error(JSON.stringify(body));
      throw new Error("Failed to get token");
    }

    return body;
  }

  private async getData(
    symbol: keyof typeof CROPS_API,
    token: string
  ): Promise<MatbaMarketData> {
    const response = await fetch(`${this.MATBA_API_MARKET_URL}${symbol}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await response.json();

    if (!response.ok) {
      this.logger.error(JSON.stringify(body));
      throw new InternalServerErrorException("Failed to get market data");
    }

    return body;
  }

  async getCurrentMarketPrice(symbol: keyof typeof CROPS_API) {
    try {
      const token = await this.getToken({
        username: this.MATBA_API_USERNAME,
        email: this.MATBA_API_EMAIL,
        password: this.MATBA_API_PASSWORD,
      });

      const data = await this.getData(symbol, token.access);
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException("Failed to get market data");
    }
  }
}
