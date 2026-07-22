import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isVeg!: boolean;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ type: 'int', default: 0 })
  stockQuantity!: number;

  @Column({ type: 'int', default: 20 })
  preparationTime!: number;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column('uuid')
  categoryId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}