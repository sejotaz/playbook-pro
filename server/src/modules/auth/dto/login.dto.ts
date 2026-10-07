import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'coach@equipo.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'una-clave-larga-2026' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
