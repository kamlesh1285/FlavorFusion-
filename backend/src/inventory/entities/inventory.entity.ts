import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Food } from '../../foods/entities/food.entity';

export enum InventoryType {
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  foodId!: string;

  @ManyToOne(() => Food, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'foodId' })
  food!: Food;

  @Column({
    type: 'enum',
    enum: InventoryType,
  })
  type!: InventoryType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
