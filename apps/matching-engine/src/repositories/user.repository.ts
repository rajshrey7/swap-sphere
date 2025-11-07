/**
 * User repository
 * Manages user data storage and retrieval
 * Currently uses in-memory storage, but designed to be easily replaceable with a database
 */

import type { UserProfile } from '../types/user.types.js';

class UserRepository {
  private users: Map<string, UserProfile> = new Map();

  /**
   * Create or update a user profile
   */
  async save(user: UserProfile): Promise<UserProfile> {
    const updatedUser = { ...user, updatedAt: new Date() };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) ?? null;
  }

  /**
   * Get all users
   */
  async getAll(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }

  /**
   * Get all users except the specified one
   */
  async getAllExcept(userId: string): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.id !== userId
    );
  }

  /**
   * Delete a user
   */
  async delete(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }

  /**
   * Check if user exists
   */
  async exists(userId: string): Promise<boolean> {
    return this.users.has(userId);
  }

  /**
   * Get users by skill category (for filtering)
   */
  async getBySkillCategory(category: string): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter((user) =>
      [...user.offers, ...user.wants].some(
        (skill) => skill.category?.toLowerCase() === category.toLowerCase()
      )
    );
  }

  /**
   * Clear all users (useful for testing)
   */
  async clear(): Promise<void> {
    this.users.clear();
  }
}

// Singleton instance
export const userRepository = new UserRepository();

