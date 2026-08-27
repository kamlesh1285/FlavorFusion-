import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CheckoutDto } from './dto/checkout.dto';

const STAFF_ROLES = [UserRole.ADMIN, UserRole.KITCHEN, UserRole.DELIVERY];

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Admin only — manual order creation on a customer's behalf
  // (e.g. a phone order). Customers place orders via /orders/checkout.
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Staff only — every order in the system, for fulfilment.
  @UseGuards(RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // The current user's own order history.
  @Get('mine')
  findMine(@Request() req) {
    return this.ordersService.findByUser(req.user.id);
  }

  // A single order — the customer who placed it, or staff, can view it.
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(id);
    const isOwner = order.userId === req.user.id;
    const isStaff = STAFF_ROLES.includes(req.user.role);

    if (!isOwner && !isStaff) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  // Staff only — updating order/payment status is a fulfilment action.
  @UseGuards(RolesGuard)
  @Roles(...STAFF_ROLES)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post('checkout')
  checkout(
    @Request() req,
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(
      req.user.id,
      dto,
    );
  }
}
