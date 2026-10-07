import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @ApiProperty({ example: 'coach@equipo.com' })
  @Transform(trim)
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'una-clave-larga-2026', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede pasar de 128 caracteres' })
  password!: string;

  @ApiProperty({ example: 'Coach Taylor', maxLength: 80 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80)
  name!: string;
}
