import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';
import { JwtService } from './jwt.service';
import { sendVerificationEmail } from '../lib/mailer';
import crypto from 'crypto';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
  };
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<void> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        verificationCode,
      },
    });

    // Create organization and add user as admin
    const organization = await prisma.organization.create({
      data: {
        name: input.organizationName,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN',
          },
        },
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = JwtService.generateAccessToken(user.id);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      organizations: user.organizations.map(membership => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      })),
      accessTokenExpiry: accessToken.accessTokenExpiry,
      refreshTokenExpiry: refreshToken.refreshTokenExpiry,
      accessToken: accessToken.accessToken,
      refreshToken: refreshToken.refreshToken,
    };
  }

  static async verifyEmail(email: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email already verified');
    }

    if (user.verificationCode !== code) {
      throw new Error('Invalid verification code');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });
  }

  static async refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string
  }> {
    const userId = await JwtService.verifyRefreshToken(token);
    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    // Invalidate the old refresh token
    await JwtService.invalidateRefreshToken(token);

    // Generate new tokens
    const accessToken = JwtService.generateAccessToken(userId);
    const refreshToken = await JwtService.generateRefreshToken(userId);

    return { accessToken: accessToken.accessToken, refreshToken: refreshToken.refreshToken, accessTokenExpiry: accessToken.accessTokenExpiry, refreshTokenExpiry: refreshToken.refreshTokenExpiry };
  }

  static async logout(refreshToken: string): Promise<void> {
    await JwtService.invalidateRefreshToken(refreshToken);
  }

  static async logoutAll(userId: string): Promise<void> {
    await JwtService.invalidateAllUserRefreshTokens(userId);
  }

  static async getCurrentUser(userId: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // We don't need to generate new tokens for /me endpoint
    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = { accessToken: '', refreshToken: '', accessTokenExpiry: '', refreshTokenExpiry: '' };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      organizations: user.organizations.map(membership => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      })),
      accessTokenExpiry: accessTokenExpiry,
      refreshTokenExpiry: refreshTokenExpiry,
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}
