import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

import { Food } from '../foods/entities/food.entity';
import { User } from '../users/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Cart> {
  let cart = await this.cartRepository.findOne({
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

  if (!cart) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    cart = this.cartRepository.create({
      user,
      items: [],
    });

    cart = await this.cartRepository.save(cart);
  }

  return cart;
}
async addItem(userId: string, dto: AddCartItemDto) {
  const cart = await this.getOrCreateCart(userId);

  const food = await this.foodRepository.findOne({
    where: { id: dto.foodId },
  });

  if (!food) {
    throw new NotFoundException('Food not found');
  }

  let cartItem = cart.items.find(
    (item) => item.food.id === dto.foodId,
  );

  if (cartItem) {
    cartItem.quantity += dto.quantity;
  } else {
    cartItem = this.cartItemRepository.create({
      cart,
      food,
      quantity: dto.quantity,
    });

    cart.items.push(cartItem);
  }

  await this.cartRepository.save(cart);

  return this.getCart(userId);
}

async getCart(userId: string) {
  return this.getOrCreateCart(userId);
}

async updateItem(
  userId: string,
  itemId: string,
  dto: UpdateCartItemDto,
) {
  const cart = await this.getOrCreateCart(userId);

  const item = cart.items.find((i) => i.id === itemId);

  if (!item) {
    throw new NotFoundException('Cart item not found');
  }

  item.quantity = dto.quantity;

  await this.cartRepository.save(cart);

  return this.getCart(userId);
}

async removeItem(userId: string, itemId: string) {
  const cart = await this.getOrCreateCart(userId);

  const item = cart.items.find((i) => i.id === itemId);

  if (!item) {
    throw new NotFoundException('Cart item not found');
  }

  await this.cartItemRepository.remove(item);

  return this.getCart(userId);
}

async clearCart(userId: string) {
  const cart = await this.getOrCreateCart(userId);

  if (cart.items.length > 0) {
    await this.cartItemRepository.remove(cart.items);
  }

  return {
    message: 'Cart cleared successfully',
  };
}
}