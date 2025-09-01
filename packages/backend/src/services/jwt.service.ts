import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';
import crypto from 'crypto';
import { JWT_SECRET } from '../lib/constants';



export class JwtService {

  static generateAccessToken(userId: string): { accessToken: string; accessTokenExpiry: string } {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "5m" });
    return {
      accessToken: token,
      accessTokenExpiry: expiresAt.toISOString(),
    };
  }

  static async generateRefreshToken(userId: string): Promise<{ refreshToken: string; refreshTokenExpiry: string }> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return {
      refreshToken: token,
      refreshTokenExpiry: expiresAt.toISOString(),
    };
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
