import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: registerDto.email },
        { phone: registerDto.phone },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(
        'Email or phone already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      12,
    );

    const user = this.usersRepository.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    await this.usersRepository.save(user);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    return {
    message: 'Registration successful',
    accessToken: token,
    user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
  const user = await this.usersRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email', {
      email: loginDto.email,
    })
    .getOne();

  if (!user) {
    throw new UnauthorizedException(
      'Invalid email or password',
    );
  }

  const isPasswordValid = await bcrypt.compare(
    loginDto.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException(
      'Invalid email or password',
    );
  }

  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

return {
 accessToken: token,
 user: userWithoutPassword,
};
}
}
