/**
 * User management API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import type { UserProfile } from '../types/user.types.js';

const router: ExpressRouter = Router();

/**
 * POST /api/users
 * Create or update a user profile
 */
router.post('/', async (req, res) => {
  try {
    const userData = req.body;

    // Validate required fields
    if (!userData.id || !userData.username || !userData.email) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['id', 'username', 'email']
      });
      return;
    }

    // Create user profile with defaults
    const user: UserProfile = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      languages: userData.languages ?? ['en'],
      offers: userData.offers ?? [],
      wants: userData.wants ?? [],
      trustScore: userData.trustScore ?? 0.5,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const savedUser = await userRepository.save(user);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to save user profile'
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.getById(id);

    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: `User with id ${id} does not exist`
      });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch user'
    });
  }
});

/**
 * GET /api/users
 * Get all users
 */
router.get('/', async (req, res) => {
  try {
    const users = await userRepository.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      res.status(404).json({ 
        error: 'User not found',
        message: `User with id ${id} does not exist`
      });
      return;
    }

    res.json({ 
      message: 'User deleted successfully',
      userId: id
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete user'
    });
  }
});

export default router;

