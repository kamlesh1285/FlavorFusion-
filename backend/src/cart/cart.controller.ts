import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  addItem(
    @Req() req: any,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch(':itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      req.user.id,
      itemId,
      dto,
    );
  }

  @Delete(':itemId')
  removeItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(
      req.user.id,
      itemId,
    );
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}