import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { newId } from '@playbook/shared';
import type { Model } from 'mongoose';
import type { AccessTokenPayload } from '../../common/guards/jwt-auth.guard.js';
import type { Env } from '../../config/env.schema.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import type { UserDocument } from '../users/schemas/user.schema.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { hashPassword, verifyPassword } from './password.js';
import { RefreshToken } from './schemas/refresh-token.schema.js';

/** Resultado de registrarse, hacer login o renovar la sesión. */
export interface Session {
  accessToken: string;
  /** Va solo en la cookie httpOnly; nunca en el cuerpo de la respuesta. */
  refreshToken: string;
  refreshExpiresAt: Date;
  user: UserResponseDto;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const INVALID_CREDENTIALS = 'Email o contraseña incorrectos';
const INVALID_SESSION = 'La sesión no es válida o ha caducado';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  // Hash de relleno: si el email no existe se verifica contra él, para que la respuesta
  // tarde lo mismo y no se pueda averiguar qué emails están registrados.
  private readonly dummyHash = hashPassword(randomBytes(16).toString('hex'));

  constructor(
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(dto: RegisterDto): Promise<Session> {
    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash: await hashPassword(dto.password),
    });
    return this.issueSession(user, newId());
  }

  async login(dto: LoginDto): Promise<Session> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const passwordOk = await verifyPassword(
      dto.password,
      user?.passwordHash ?? (await this.dummyHash),
    );
    if (!user || !passwordOk) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issueSession(user, newId());
  }

  /**
   * Cambia el refresh token por uno nuevo (rotación). Cada token sirve una sola vez:
   * si llega uno ya usado, es señal de robo y se cierra toda esa sesión.
   */
  async refresh(refreshToken: string | undefined): Promise<Session> {
    if (!refreshToken) {
      throw new UnauthorizedException(INVALID_SESSION);
    }
    const tokenHash = hashToken(refreshToken);
    const now = new Date();

    // Buscar y revocar en una sola operación: dos peticiones simultáneas no pueden usar el mismo token.
    const current = await this.refreshTokenModel
      .findOneAndUpdate({ tokenHash, revokedAt: null, expiresAt: { $gt: now } }, { revokedAt: now })
      .exec();

    if (!current) {
      const reused = await this.refreshTokenModel.findOne({ tokenHash }).exec();
      if (reused) {
        await this.revokeFamily(reused.userId, reused.family);
      }
      throw new UnauthorizedException(INVALID_SESSION);
    }

    const user = await this.users.findById(current.userId);
    if (!user) {
      throw new UnauthorizedException(INVALID_SESSION);
    }
    return this.issueSession(user, current.family);
  }

  /** Cierra la sesión de este dispositivo. No falla si el token ya no existe. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const token = await this.refreshTokenModel
      .findOne({ tokenHash: hashToken(refreshToken) })
      .exec();
    if (token) {
      await this.revokeFamily(token.userId, token.family);
    }
  }

  private async revokeFamily(userId: string, family: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId, family, revokedAt: null }, { revokedAt: new Date() })
      .exec();
  }

  private async issueSession(user: UserDocument, family: string): Promise<Session> {
    const payload: AccessTokenPayload = { sub: user._id };
    const accessToken = await this.jwt.signAsync(payload);

    // El refresh token es aleatorio (no un JWT ni un UUID) y en Mongo solo queda su hash.
    const refreshToken = randomBytes(32).toString('base64url');
    const ttlDays = this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true });
    const refreshExpiresAt = new Date(Date.now() + ttlDays * DAY_IN_MS);
    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      family,
      expiresAt: refreshExpiresAt,
    });

    return { accessToken, refreshToken, refreshExpiresAt, user: UserResponseDto.from(user) };
  }
}
