import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';
import crypto from 'crypto';
import { JWT_SECRET } from '../lib/constants';

const ACCESS_TOKEN_EXPIRY = '5m';

export class JwtService {
  private static generateToken(payload: any, expiresIn: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  static generateAccessToken(userId: string): string {
    return this.generateToken({ userId }, ACCESS_TOKEN_EXPIRY);
  }

  static async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  static async verifyRefreshToken(token: string): Promise<string | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    if (refreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      return null;
    }

    return refreshToken.userId;
  }

  static async invalidateRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  static async invalidateAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
