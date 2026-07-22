import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { FoodsModule } from './foods/foods.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DATABASE_HOST'),

        port: Number(configService.get<number>('DATABASE_PORT')),

        username: configService.get<string>('DATABASE_USERNAME'),

        password: configService.get<string>('DATABASE_PASSWORD'),

        database: configService.get<string>('DATABASE_NAME'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    UsersModule,

    CategoriesModule,

    FoodsModule,

    InventoryModule,

    OrdersModule,

    AuthModule,

    CartModule,
  ],
})
export class AppModule {}