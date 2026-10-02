import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { UserRole } from '../config/constants';
import { env } from '../config/env';
import { AuditService } from './audit.service';

export interface RegisterDTO {
  name: string;
  phone: string;
  password: string;
  role?: UserRole;
  email?: string;
  villageId?: string;
  panchayatId?: string;
  blockId?: string;
  districtId?: string;
  departmentId?: string;
  languagePreference?: 'hi' | 'en';
}

export class AuthService {
  static generateTokens(user: IUser) {
    const payload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
      name: user.name
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any
    });

    return { accessToken, refreshToken };
  }

  static async register(data: RegisterDTO, ipAddress?: string) {
    const existing = await User.findOne({ phone: data.phone });
    if (existing) {
      throw new Error('A user with this phone number already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      passwordHash,
      role: data.role || UserRole.CITIZEN,
      villageId: data.villageId,
      panchayatId: data.panchayatId,
      blockId: data.blockId,
      districtId: data.districtId,
      departmentId: data.departmentId,
      languagePreference: data.languagePreference || 'hi',
      isVerified: true
    });

    const tokens = this.generateTokens(user);

    await AuditService.log({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress
    });

    return { user, ...tokens };
  }

  static async login(phone: string, candidatePass: string, ipAddress?: string) {
    const user = await User.findOne({ phone })
      .populate('villageId')
      .populate('panchayatId')
      .populate('departmentId');

    if (!user) {
      throw new Error('Invalid phone number or password.');
    }

    const isMatch = await user.comparePassword(candidatePass);
    if (!isMatch) {
      throw new Error('Invalid phone number or password.');
    }

    const tokens = this.generateTokens(user);

    await AuditService.log({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress
    });

    return { user, ...tokens };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found.');
      }
      return this.generateTokens(user);
    } catch {
      throw new Error('Invalid or expired refresh token.');
    }
  }

  static async getProfile(userId: string) {
    return User.findById(userId)
      .populate('villageId')
      .populate('panchayatId')
      .populate('departmentId');
  }

  static async updateProfile(userId: string, data: Partial<IUser>) {
    return User.findByIdAndUpdate(userId, data, { new: true });
  }
}
