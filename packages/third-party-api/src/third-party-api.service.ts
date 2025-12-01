import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CROPS_API } from "./types/types";
import { ConfigService } from "@nestjs/config";
import { REDIS_CONNECTION, type RedisClient } from "@repo/redis-client";
import { jwtDecode } from "jwt-decode";

type MatbaCedentials = {
  username: string;
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

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CONNECTION) private readonly redis: RedisClient
  ) {
    this.MATBA_API_LOGIN_URL = this.configService.getOrThrow(
      "MATBA_API_LOGIN_URL"
    );
    this.MATBA_API_MARKET_URL = this.configService.getOrThrow(
      "MATBA_API_MARKET_URL"
    );
  }

  private async getToken(
    credentials: MatbaCedentials
  ): Promise<{ access: string; refresh?: string }> {
    const cachedToken = await this.redis.get("matba_token");

    if (cachedToken) {
      this.logger.debug("Cached token found");
      const tokenDecoded = jwtDecode(cachedToken);
      if (tokenDecoded.exp && tokenDecoded.exp < Date.now() / 1000 + 10) {
        await this.redis.del("matba_token");
        this.logger.debug("Cached token expired, deleting");
      } else {
        this.logger.debug("Cached token is valid");
        return { access: cachedToken };
      }
    }

    const response = await fetch(this.MATBA_API_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...credentials }),
    });

    const body = (await response.json()) as { access: string; refresh: string };

    if (!response.ok) {
      this.logger.error(
        "Failed to get token from Matba API: " + JSON.stringify(body)
      );
      throw new Error("Failed to get token");
    }

    try {
      this.logger.debug("Setting token in Redis");
      const result = await this.redis.set("matba_token", body.access);
      this.logger.debug("Token set in Redis: " + result);
    } catch (error) {
      this.logger.error("Failed to set token in Redis: " + error);
    }

    return body;
  }

  private async getData(
    symbol: keyof typeof CROPS_API,
    token: string
  ): Promise<MatbaMarketData> {
    const response = await fetch(
      `${this.MATBA_API_MARKET_URL}${CROPS_API[symbol]}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const body = await response.json();

    if (!response.ok) {
      this.logger.error(JSON.stringify(body));
      throw new InternalServerErrorException("Failed to get market data");
    }

    return body;
  }

  async getCurrentMarketPrice(
    symbol: keyof typeof CROPS_API,
    credentials: MatbaCedentials
  ) {
    try {
      const token = await this.getToken(credentials);

      const data = await this.getData(symbol, token.access);
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException("Failed to get market data");
    }
  }
}
