import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.cart.findAll(user);
  }

  @Post()
  add(@Body() dto: AddCartItemDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.cart.add(dto, user);
  }

  /** 1단계: 결제 초기화 — Toss SDK에 넘길 주문 정보 반환 */
  @Post('checkout/initiate')
  initiateCheckout(@CurrentUserDecorator() user: CurrentUser) {
    return this.cart.initiateCheckout(user);
  }

  /** 2단계: Toss 결제 확인 — paymentKey·orderId·amount 검증 후 주문 완료 */
  @Post('checkout/confirm')
  confirmCheckout(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() body: { paymentKey: string; orderId: string; amount: number },
  ) {
    return this.cart.confirmCheckout(
      user,
      body.paymentKey,
      body.orderId,
      body.amount,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.cart.update(id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.cart.remove(id, user);
  }

  @Delete()
  clear(@CurrentUserDecorator() user: CurrentUser) {
    return this.cart.clear(user);
  }
}
