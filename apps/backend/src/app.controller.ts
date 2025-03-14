import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('/')
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('test')
  async testing() {
    const users = await this.prismaService.campus.findMany();
    return users;
  }
}
