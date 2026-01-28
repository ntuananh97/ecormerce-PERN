import { prisma } from '../config/database';
import { CreateUserInput, LoginUserInput } from '../types/user.types';
import { AppError, ConflictError, UnauthorizedError, ValidationError } from '../types/errors';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, ITokenPayload } from '../helper/login.helper';
import { env } from 'process';
import jwt from 'jsonwebtoken';

/**
 * Auth Service Layer
 * Handles all business logic and database operations for authentication
 */
export class AuthService {
  /**
   * Register a new user
   * @param data - Registration data (email, password, name, etc.)
   * @returns User data and authentication token
   */
  async register(data: CreateUserInput): Promise<any> {
    const trimEmail = data.email.trim();
    const trimPassword = data.password.trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimEmail },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trimPassword, saltRounds);

    // 4. Create user in database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: 'user'
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 6. Return user data and token
    return {
      user,
    };
  }

  /**
   * Login user
   * @param data - Login credentials (email, password)
   * @returns User data and authentication token
   */
  async login(data: LoginUserInput): Promise<any> {
    const trimEmail = data.email.trim();
    const trimPassword = data.password.trim();
    const errorMessage = 'Invalid email or password.';
    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: trimEmail },
    });

    if (!user) {
      throw new ValidationError(errorMessage);
    }

    // Check if user is soft deleted
    if (user.deletedAt || user.status === 'blocked') {
      throw new ValidationError(errorMessage);
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(trimPassword, user.password);

    if (!isPasswordValid) {
      throw new ValidationError(errorMessage);
    }

    // 4. Generate JWT tokens
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Return user data and tokens (exclude password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  /**
   * Logout user
   * @param data - Logout data (token, userId, etc.)
   */
  async logout(data: any): Promise<void> {
    // TODO: Implement logout logic
    // - Invalidate token (if using token blacklist)
    // - Clear session (if using sessions)
    // - Perform any cleanup
    
    return;
  }

  /**
   * Refresh authentication token
   * @param data - Refresh token data
   * @returns New authentication token
   */
  async refreshToken(data: { refreshToken: string }): Promise<any> {
    // TODO: Implement refresh token logic
    // - Verify refresh token
    // - Generate new access token
    // - Return new token

    const rtSecret = env.RT_SECRET;
    const rtExpiresIn = env.RT_EXPIRES_IN;
    if (!rtSecret || !rtExpiresIn) {
      throw new AppError('Refresh token secret or expires in is not set');
    }


    const rtDecoded = jwt.verify(data.refreshToken, rtSecret) as ITokenPayload;

    if (!rtDecoded) {
      throw new UnauthorizedError('Invalid refresh token');
    }

   const newAccessToken = generateAccessToken({
    userId: rtDecoded.userId,
    email: rtDecoded.email,
    role: rtDecoded.role,
   });
    
    return {
      accessToken: newAccessToken,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
