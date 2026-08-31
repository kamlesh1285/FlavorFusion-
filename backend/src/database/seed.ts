import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Food } from '../foods/entities/food.entity';

config();

const databaseUrl = process.env.DATABASE_URL;

const connectionOptions = databaseUrl
  ? { url: databaseUrl }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };

const dataSource = new DataSource({
  type: 'postgres',
  ...connectionOptions,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, Category, Food],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('📦 Connected to database, seeding...');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const foodRepo = dataSource.getRepository(Food);

  // --- Demo users ---
  const demoUsers = [
    {
      fullName: 'Admin User',
      email: 'admin@flavorfusion.com',
      phone: '9999900001',
      password: 'Admin@123',
      role: UserRole.ADMIN,
    },
    {
      fullName: 'Demo Customer',
      email: 'customer@flavorfusion.com',
      phone: '9999900002',
      password: 'Customer@123',
      role: UserRole.CUSTOMER,
    },
    {
      fullName: 'Kitchen Staff',
      email: 'kitchen@flavorfusion.com',
      phone: '9999900003',
      password: 'Kitchen@123',
      role: UserRole.KITCHEN,
    },
  ];

  for (const u of demoUsers) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (existing) continue;

    const hashed = await bcrypt.hash(u.password, 12);
    await userRepo.save(
      userRepo.create({ ...u, password: hashed, isVerified: true }),
    );
    console.log(`  ✓ Created user ${u.email} (${u.role})`);
  }

  // --- Categories ---
  const categoryData = [
    { name: 'Starters', description: 'Appetizers to kick things off' },
    { name: 'Main Course', description: 'Hearty main dishes' },
    { name: 'Breads', description: 'Freshly baked breads' },
    { name: 'Desserts', description: 'Sweet endings' },
    { name: 'Beverages', description: 'Drinks, hot and cold' },
  ];

  const categories: Record<string, Category> = {};

  for (const c of categoryData) {
    let category = await categoryRepo.findOne({ where: { name: c.name } });
    if (!category) {
      category = await categoryRepo.save(categoryRepo.create(c));
      console.log(`  ✓ Created category ${c.name}`);
    }
    categories[c.name] = category;
  }

  // --- Foods ---
  const foodData = [
    {
      name: 'Paneer Tikka',
      description: 'Chargrilled cottage cheese marinated in spiced yogurt',
      price: 220,
      isVeg: true,
      stockQuantity: 50,
      preparationTime: 15,
      category: 'Starters',
    },
    {
      name: 'Chicken 65',
      description: 'Spicy, deep-fried chicken bites, South Indian style',
      price: 260,
      isVeg: false,
      stockQuantity: 40,
      preparationTime: 18,
      category: 'Starters',
    },
    {
      name: 'Butter Chicken',
      description: 'Chicken simmered in a creamy tomato-butter gravy',
      price: 340,
      isVeg: false,
      stockQuantity: 30,
      preparationTime: 25,
      category: 'Main Course',
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Cottage cheese cubes in a rich tomato-cashew gravy',
      price: 300,
      isVeg: true,
      stockQuantity: 30,
      preparationTime: 20,
      category: 'Main Course',
    },
    {
      name: 'Dal Makhani',
      description: 'Slow-cooked black lentils finished with cream',
      price: 240,
      isVeg: true,
      stockQuantity: 35,
      preparationTime: 20,
      category: 'Main Course',
    },
    {
      name: 'Butter Naan',
      description: 'Soft leavened bread brushed with butter',
      price: 60,
      isVeg: true,
      stockQuantity: 100,
      preparationTime: 10,
      category: 'Breads',
    },
    {
      name: 'Garlic Naan',
      description: 'Naan topped with roasted garlic and herbs',
      price: 70,
      isVeg: true,
      stockQuantity: 100,
      preparationTime: 10,
      category: 'Breads',
    },
    {
      name: 'Gulab Jamun',
      description: 'Milk-solid dumplings soaked in rose-cardamom syrup',
      price: 120,
      isVeg: true,
      stockQuantity: 60,
      preparationTime: 5,
      category: 'Desserts',
    },
    {
      name: 'Gajar Halwa',
      description: 'Carrot pudding slow-cooked with milk and ghee',
      price: 140,
      isVeg: true,
      stockQuantity: 40,
      preparationTime: 5,
      category: 'Desserts',
    },
    {
      name: 'Masala Chai',
      description: 'Spiced Indian tea brewed with milk',
      price: 40,
      isVeg: true,
      stockQuantity: 100,
      preparationTime: 5,
      category: 'Beverages',
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Lime, soda, and a hint of mint - sweet or salted',
      price: 60,
      isVeg: true,
      stockQuantity: 100,
      preparationTime: 5,
      category: 'Beverages',
    },
  ];

  for (const f of foodData) {
    const existing = await foodRepo.findOne({ where: { name: f.name } });
    if (existing) continue;

    const { category: categoryName, ...rest } = f;
    await foodRepo.save(
      foodRepo.create({
        ...rest,
        category: categories[categoryName],
        categoryId: categories[categoryName].id,
      }),
    );
    console.log(`  ✓ Created food ${f.name}`);
  }

  console.log('✅ Seeding complete.');
  console.log('');
  console.log('Demo logins:');
  console.log('  Admin:    admin@flavorfusion.com    / Admin@123');
  console.log('  Customer: customer@flavorfusion.com / Customer@123');
  console.log('  Kitchen:  kitchen@flavorfusion.com  / Kitchen@123');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
