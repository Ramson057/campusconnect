/**
 * Authentication & User Profile Service
 *
 * Endpoints:
 * - POST /api/v1/auth/login
 *   Body: { email: string, password: string, role?: 'student' | 'admin' }
 *   Response: { token: string, user: User }
 *
 * - POST /api/v1/auth/register
 *   Body: { name, email, studentId, password, role, course, yearLevel }
 *   Response: { token: string, user: User }
 *
 * - GET /api/v1/auth/me
 *   Headers: Authorization: Bearer <token>
 *   Response: User
 *
 * - PUT /api/v1/users/:id
 *   Body: Partial<User>
 *   Response: User
 *
 * - GET /api/v1/users
 *   Query: ?page=1&limit=20
 *   Response: PaginatedResponse<User>
 */

import { USE_MOCK_API } from '../config/env';
import { PaginatedResponse, PaginationParams, User, UserRole } from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { ApiError, apiRequest, simulateNetworkDelay } from './api';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  studentId: string;
  password: string;
  role: UserRole;
  course: string;
  yearLevel: string;
}

export const authService = {
  /**
   * POST /api/v1/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!USE_MOCK_API) {
      return apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const users = mockStore.getUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // Allow demo login with any valid email by matching role or creating a session user
      if (payload.role === 'admin') {
        user = users.find((u) => u.role === 'admin') || users[1];
      } else {
        user = users.find((u) => u.role === 'student') || users[0];
      }
    } else if (payload.role && user.role !== payload.role) {
      // If user explicitly toggled Student vs Organizer in demo login, honor role selection
      user = { ...user, role: payload.role };
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    return simulateNetworkDelay({ token, user });
  },

  /**
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!USE_MOCK_API) {
      return apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const users = mockStore.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (exists) {
      throw new ApiError('An account with this USC email already exists.', 409);
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim(),
      studentId: payload.studentId.trim(),
      role: payload.role,
      course: payload.course,
      yearLevel: payload.yearLevel,
      department:
        payload.role === 'admin'
          ? 'Office of Student Affairs & Accredited Organizations'
          : 'University of San Carlos Academic Department',
      organizations: ['USC Supreme Student Council (SSC)'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newUser, ...users];
    mockStore.saveUsers(updated);

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    return simulateNetworkDelay({ token, user: newUser });
  },

  /**
   * PUT /api/v1/users/:id
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    if (!USE_MOCK_API) {
      return apiRequest<User>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }

    const users = mockStore.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new ApiError('User profile not found.', 404);
    }

    const updatedUser: User = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updatedUser;
    mockStore.saveUsers(users);
    return simulateNetworkDelay(updatedUser);
  },

  /**
   * GET /api/v1/users
   */
  async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    if (!USE_MOCK_API) {
      return apiRequest<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
    }

    const users = mockStore.getUsers();
    const start = (page - 1) * limit;
    const sliced = users.slice(start, start + limit);

    return simulateNetworkDelay({
      data: sliced,
      total: users.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(users.length / limit)),
    });
  },
};
