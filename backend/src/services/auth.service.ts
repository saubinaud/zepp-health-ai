import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { query } from '../db';
import { ZeppClient } from '../api/zepp-client';
import { User } from '../types';

export class AuthService {
  /**
   * Register new user with Zepp credentials
   */
  async register(
    email: string,
    password: string,
    zeppEmail: string,
    zeppPassword: string
  ): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Authenticate with Zepp to validate credentials
    const zeppClient = new ZeppClient();
    let zeppAuth;

    try {
      zeppAuth = await zeppClient.authenticate(zeppEmail, zeppPassword);
    } catch (error: any) {
      throw new Error(`Failed to authenticate with Zepp: ${error.message}`);
    }

    // Hash user password
    const passwordHash = await bcrypt.hash(password, 10);

    // Encrypt Zepp password
    const encryptionKey = process.env.JWT_SECRET || 'secret';
    const zeppPasswordEncrypted = CryptoJS.AES.encrypt(zeppPassword, encryptionKey).toString();

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, zepp_email, zepp_password_encrypted, app_token, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, created_at`,
      [email, passwordHash, zeppEmail, zeppPasswordEncrypted, zeppAuth.appToken, zeppAuth.userId]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return { user, token };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const result = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return { user, token };
  }

  /**
   * Get Zepp credentials for a user (decrypted)
   */
  async getZeppCredentials(userId: number): Promise<{ email: string; password: string; appToken?: string; zeppUserId?: string }> {
    const result = await query(
      'SELECT zepp_email, zepp_password_encrypted, app_token, user_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const encryptionKey = process.env.JWT_SECRET || 'secret';

    // Decrypt Zepp password
    const zeppPassword = CryptoJS.AES.decrypt(user.zepp_password_encrypted, encryptionKey).toString(CryptoJS.enc.Utf8);

    return {
      email: user.zepp_email,
      password: zeppPassword,
      appToken: user.app_token,
      zeppUserId: user.user_id,
    };
  }

  /**
   * Refresh Zepp token
   */
  async refreshZeppToken(userId: number): Promise<void> {
    const credentials = await this.getZeppCredentials(userId);

    const zeppClient = new ZeppClient();
    const zeppAuth = await zeppClient.authenticate(credentials.email, credentials.password);

    // Update tokens in database
    await query(
      'UPDATE users SET app_token = $1, user_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [zeppAuth.appToken, zeppAuth.userId, userId]
    );
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number, email: string): string {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { id: number; email: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; email: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
