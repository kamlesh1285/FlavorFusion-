import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Rahul Sharma',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    example: 'rahul@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '+919999999999',
  })
  @IsPhoneNumber('IN')
  phone!: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}