import { Controller, Get } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";

@Controller("users")
export class UsersController {
  @Get("session")
  getSession(@Session() session: UserSession) {
    return session.user;
  }
}
