import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserDocument } from '../schemas/user.schema.js';

/** Lo que la API devuelve de un usuario. Nunca incluye el hash de la contraseña. */
export class UserResponseDto {
  @ApiProperty({ format: 'uuid', example: '0199b4e2-7c1a-7d3e-9f42-3b8a1c5e6d70' })
  id!: string;

  @ApiProperty({ example: 'coach@equipo.com' })
  email!: string;

  @ApiProperty({ example: 'Coach Taylor' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg' })
  avatarUrl?: string;

  static from(user: UserDocument): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id;
    dto.email = user.email;
    dto.name = user.name;
    dto.avatarUrl = user.avatarUrl;
    return dto;
  }
}
