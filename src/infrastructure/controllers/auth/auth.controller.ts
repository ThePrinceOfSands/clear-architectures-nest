import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { UseCaseProxy } from "../../usecases-proxy/usecases-proxy";
import { UsecasesProxyModule } from "../../usecases-proxy/usecases-proxy.module";
import { LoginUseCases } from "../../../usecases/auth/login.usecase";
import { IsAuthenticatedUseCases } from "../../../usecases/auth/isAuthenticated.usecases";
import { LogoutUseCases } from "../../../usecases/auth/logout.usecases";

@Controller("auth")
@ApiTags("auth")
@ApiResponse({
  status: 401,
  description: "No authorization token was found",
})
@ApiResponse({ status: 500, description: "Internal error" })
export class AuthController {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    @Inject(UsecasesProxyModule.LOGOUT_USECASES_PROXY)
    private readonly logoutUsecaseProxy: UseCaseProxy<LogoutUseCases>,
    @Inject(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
    private readonly isAuthUsecaseProxy: UseCaseProxy<IsAuthenticatedUseCases>
  ) {}

  @Post("login")
  @ApiBearerAuth()
  @ApiBody({ type: AuthLoginDto })
  @ApiOperation({ description: "login" })
  async login(@Body() auth: AuthLoginDto, @Request() request: any) {
    const accessTokenCookie = await this.loginUsecaseProxy
      .getInstance()
      .getCookieWithJwtToken(auth.username);
    const refreshTokenCookie = await this.loginUsecaseProxy
      .getInstance()
      .getCookieWithJwtRefreshToken(auth.username);
    request.res.setHeader("Set-Cookie", [
      accessTokenCookie,
      refreshTokenCookie,
    ]);
    return "Login successful";
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: "logout" })
  async logout(@Request() request: any) {
    const cookie = await this.logoutUsecaseProxy.getInstance().execute();

    request.res.setHeader("Set-Cookie", cookie);

    return "Logout successful";
  }

  @Get("is_authenticated")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: "is_authenticated" })
  async isAuthenticated(@Req() request: any) {
    const user = await this.isAuthUsecaseProxy
      .getInstance()
      .execute(request.user.username);

    const response = new IsAuthPresenter();

    response.username = user.username;

    return response;
  }

  @Get("refresh")
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  async refresh(@Req() request: any) {
    const accessTokenCookie = await this.loginUsecaseProxy
      .getInstance()
      .getCookieWithJwtToken(request.user.username);

    request.res.setHeader("Set-Cookie", accessTokenCookie);

    return "Refresh successful";
  }
}
