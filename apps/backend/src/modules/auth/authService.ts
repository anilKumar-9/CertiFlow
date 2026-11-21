import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { redisClient } from '../../config/redis.js';
import { comparePassword } from '../../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { AuditService } from '../audit/auditService.js';
import { UnauthorizedError } from '../../middleware/errorHandler.js';
import { LoginInput, User, AuthResponse } from '@certiflow/shared';

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public static async login(
    input: LoginInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResponse & { refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { district: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or account suspended');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      districtId: user.districtId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Persist refresh token in PostgreSQL & Redis
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    try {
      await redisClient.setex(`refresh_token:${tokenHash}`, 7 * 86400, user.id);
    } catch (err) {
      console.warn('[Redis] Failed to cache refresh token, fallback to DB', err);
    }

    await AuditService.logAction({
      actorId: user.id,
      actorRole: user.role,
      targetEntity: 'User',
      targetId: user.id,
      actionType: 'USER_LOGIN',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    const userProfile: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      districtId: user.districtId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      user: userProfile,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  public static async rotateRefreshToken(
    oldRefreshToken: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const oldTokenHash = this.hashToken(oldRefreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: oldTokenHash },
      include: { user: true },
    });

    // Reuse detection: if token does not exist or was already revoked, terminate all sessions
    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord?.isRevoked) {
        // Active breach detected: revoke all user sessions
        await prisma.refreshToken.updateMany({
          where: { userId: decoded.userId },
          data: { isRevoked: true },
        });

        await AuditService.logAction({
          actorId: decoded.userId,
          actorRole: decoded.role,
          targetEntity: 'RefreshToken',
          targetId: oldTokenHash,
          actionType: 'SECURITY_ALERT_REFRESH_TOKEN_REUSE',
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        });
      }

      throw new UnauthorizedError('Invalid refresh token. Please sign in again.');
    }

    // Mark current token as revoked
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    try {
      await redisClient.del(`refresh_token:${oldTokenHash}`);
    } catch (err) {
      console.warn('[Redis] Failed to delete old refresh token', err);
    }

    // Generate rotated tokens
    const payload = {
      userId: tokenRecord.user.id,
      role: tokenRecord.user.role,
      districtId: tokenRecord.user.districtId,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    const newTokenHash = this.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: tokenRecord.user.id,
        expiresAt,
      },
    });

    try {
      await redisClient.setex(`refresh_token:${newTokenHash}`, 7 * 86400, tokenRecord.user.id);
    } catch (err) {
      console.warn('[Redis] Failed to cache new refresh token', err);
    }

    const userProfile: User = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      name: tokenRecord.user.name,
      role: tokenRecord.user.role,
      districtId: tokenRecord.user.districtId,
      isActive: tokenRecord.user.isActive,
      createdAt: tokenRecord.user.createdAt.toISOString(),
      updatedAt: tokenRecord.user.updatedAt.toISOString(),
    };

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userProfile,
    };
  }

  public static async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });

      try {
        await redisClient.del(`refresh_token:${tokenHash}`);
      } catch (err) {
        console.warn('[Redis] Failed to delete token on logout', err);
      }
    }

    if (userId) {
      await AuditService.logAction({
        actorId: userId,
        actorRole: 'USER',
        targetEntity: 'Session',
        targetId: userId,
        actionType: 'USER_LOGOUT',
      });
    }
  }

  public static async getProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { district: true },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      districtId: user.districtId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
