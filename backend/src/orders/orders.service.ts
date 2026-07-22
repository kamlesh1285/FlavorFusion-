import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Food } from '../foods/entities/food.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const user = await this.usersRepository.findOne({
      where: { id: createOrderDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of createOrderDto.items) {
      const food = await this.foodsRepository.findOne({
        where: { id: item.foodId },
      });

      if (!food) {
        throw new NotFoundException(
          `Food with ID ${item.foodId} not found`,
        );
      }

      if (!food.isAvailable) {
        throw new BadRequestException(
          `${food.name} is currently unavailable`,
        );
      }

      if (food.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${food.name}`,
        );
      }

      const price = Number(food.price);

      const orderItem = this.orderItemsRepository.create({
        foodId: food.id,
        food,
        quantity: item.quantity,
        price,
      });

      orderItems.push(orderItem);

      totalAmount += price * item.quantity;

      food.stockQuantity -= item.quantity;
      await this.foodsRepository.save(food);
    }

    const order = this.ordersRepository.create({
      userId: user.id,
      user,
      items: orderItems,
      totalAmount,
    });

    return this.ordersRepository.save(order);
  }

  findAll() {
    return this.ordersRepository.find({
      relations: {
        user: true,
        items: {
          food: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

    async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        items: {
          food: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
  const order = await this.findOne(id);

  // Restore stock only once when changing to CANCELLED
  if (
    updateOrderDto.status === 'CANCELLED' &&
    order.status !== 'CANCELLED'
  ) {
    for (const item of order.items) {
      const food = await this.foodsRepository.findOne({
        where: { id: item.foodId },
      });

      if (food) {
        food.stockQuantity += item.quantity;
        await this.foodsRepository.save(food);
      }
    }
  }

  if (updateOrderDto.status) {
    order.status = updateOrderDto.status;
  }

  return this.ordersRepository.save(order);
}

async checkout(userId: string, dto: CheckoutDto) {
  const cart = await this.cartRepository.findOne({
    where: {
      user: {
        id: userId,
      },
    },
    relations: {
      user: true,
      items: {
        food: true,
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  let totalAmount = 0;
  const orderItems: OrderItem[] = [];

  for (const item of cart.items) {
    const food = await this.foodsRepository.findOne({
      where: { id: item.food.id },
    });

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    if (food.stockQuantity < item.quantity) {
      throw new BadRequestException(
        `${food.name} is out of stock`,
      );
    }

    food.stockQuantity -= item.quantity;
    await this.foodsRepository.save(food);

    totalAmount += Number(food.price) * item.quantity;

    orderItems.push(
      this.orderItemsRepository.create({
        food,
        foodId: food.id,
        quantity: item.quantity,
        price: Number(food.price),
      }),
    );
  }

  const order = this.ordersRepository.create({
    user: cart.user,
    userId: cart.user.id,
    items: orderItems,
    totalAmount,
    deliveryAddress: dto.deliveryAddress,
    paymentMethod: dto.paymentMethod,
  });

  const savedOrder = await this.ordersRepository.save(order);

  await this.cartItemRepository.delete({
    cart: {
      id: cart.id,
    },
  });

  return this.findOne(savedOrder.id);
}
}