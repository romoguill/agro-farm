import { Controller, Get } from "@nestjs/common";
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";

@Controller("users")
export class UsersController {
  @Get("me")
  getSession(@Session() session: UserSession) {
    return session;
  }

  @Get("public")
  @AllowAnonymous()
  getPublic() {
    return true;
  }
}
