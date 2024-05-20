import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RoleRequestDto } from './dtos/role-request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<any> {
    return this.appService.readPolicy();
  }

  @Post('grant-role')
  async grantRole(@Body() request: RoleRequestDto) {
    return await this.appService.grantRole(request);
  }

  @Post('revoke-role')
  async revokeRole(@Body() request: RoleRequestDto) {
    return await this.appService.revokeRole(request);
  }

  @Get('read-policy')
  async readPolicy(@Query() projectId: string) {
    return await this.appService.getPolicy(projectId);
  }
}
