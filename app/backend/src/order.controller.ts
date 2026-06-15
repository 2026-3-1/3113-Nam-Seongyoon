import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Get()
  findMine(@CurrentUserDecorator() user: CurrentUser) {
    return this.orders.findMine(user);
  }
}
