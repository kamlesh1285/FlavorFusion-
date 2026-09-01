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
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // Hosted platforms (Render, Railway, Heroku-style) typically
        // provide one connection string. Local dev uses the five
        // separate DATABASE_* fields instead - support both so the
        // same code works in either environment.
        const base = databaseUrl
          ? { url: databaseUrl }
          : {
              host: configService.get<string>('DATABASE_HOST'),
              port: Number(configService.get<number>('DATABASE_PORT')),
              username: configService.get<string>('DATABASE_USERNAME'),
              password: configService.get<string>('DATABASE_PASSWORD'),
              database: configService.get<string>('DATABASE_NAME'),
            };

        return {
          type: 'postgres' as const,
          ...base,
          autoLoadEntities: true,
          synchronize: true,
          // Hosted Postgres requires SSL for external connections;
          // local dev doesn't have/need it.
          ssl:
            configService.get<string>('DATABASE_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),

    UsersModule,

    CategoriesModule,

    FoodsModule,

    InventoryModule,

    OrdersModule,

    AuthModule,

    CartModule,

    UploadsModule,
  ],
})
export class AppModule {}