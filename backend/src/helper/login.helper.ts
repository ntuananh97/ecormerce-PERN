import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Payload for JWT tokens
 */
export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate access token for user authentication
 * @param payload - User information to encode in the token
 * @returns JWT access token
 */
export const generateAccessToken = (payload: ITokenPayload): string => {
  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions
  );

  return token;
};

/**
 * Generate refresh token for token renewal
 * @param payload - User information to encode in the token
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: ITokenPayload): string => {
  const refreshToken = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    env.RT_SECRET,
    {
      expiresIn: env.RT_EXPIRES_IN,
    } as jwt.SignOptions
  );

  return refreshToken;
};
