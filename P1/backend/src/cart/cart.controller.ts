import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Query('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCart(userId);
  }

  @Post()
  addItem(
    @Body('userId') userId: number,
    @Body('courseId') courseId: number,
  ) {
    return this.cartService.addItem(userId, courseId);
  }

  @Delete(':courseId')
  removeItem(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.cartService.removeItem(userId, courseId);
  }
}
