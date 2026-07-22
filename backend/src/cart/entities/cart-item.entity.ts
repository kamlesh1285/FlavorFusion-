import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';

import { Cart } from './cart.entity';
import { Food } from '../../foods/entities/food.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  cart!: Cart;

  @ManyToOne(() => Food, {
    eager: true,
  })
  food!: Food;

  @Column()
  quantity!: number;
}