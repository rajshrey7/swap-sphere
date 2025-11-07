/**
 * Matching API routes
 */

import { Router, type Router as ExpressRouter } from 'express';
import { matchingEngine } from '../core/matching.engine.js';
import { userRepository } from '../repositories/user.repository.js';
import type { MatchingRequest, MatchingResponse, MatchingConfig } from '../types/matching.types.js';
import { DEFAULT_WEIGHTS } from '../types/user.types.js';

const router: ExpressRouter = Router();

/**
 * POST /api/matching/find
 * Find matches for a user
 */
router.post('/find', async (req, res) => {
  try {
    const { userId, config }: MatchingRequest = req.body;

    if (!userId) {
      res.status(400).json({ 
        error: 'userId is required',
        message: 'Please provide a userId in the request body'
      });
      return;
    }

    // Get user
    const user = await userRepository.getById(userId);
    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: `User with id ${userId} does not exist`
      });
      return;
    }

    // Get all candidates
    const candidates = await userRepository.getAllExcept(userId);

    if (candidates.length === 0) {
      res.json({
        matches: [],
        totalCandidates: 0,
        processingTime: 0,
        message: 'No candidates available for matching'
      } as MatchingResponse);
      return;
    }

    // Build matching config
    const matchingConfig: MatchingConfig = {
      weights: config?.weights ?? DEFAULT_WEIGHTS,
      minMatchScore: config?.minMatchScore ?? 0.3,
      maxResults: config?.maxResults ?? 50,
      enableBidirectionalMatching: config?.enableBidirectionalMatching ?? true,
    };

    // Find matches
    const startTime = Date.now();
    const matches = await matchingEngine.findMatches(user, candidates, matchingConfig);
    const processingTime = Date.now() - startTime;

    const response: MatchingResponse = {
      matches,
      totalCandidates: candidates.length,
      processingTime,
    };

    res.json(response);
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to find matches. Please try again later.'
    });
  }
});

/**
 * POST /api/matching/score
 * Calculate match score between two specific users
 */
router.post('/score', async (req, res) => {
  try {
    const { userIdA, userIdB, weights } = req.body;

    if (!userIdA || !userIdB) {
      res.status(400).json({ 
        error: 'Both userIdA and userIdB are required'
      });
      return;
    }

    const userA = await userRepository.getById(userIdA);
    const userB = await userRepository.getById(userIdB);

    if (!userA) {
      res.status(404).json({ error: `User ${userIdA} not found` });
      return;
    }

    if (!userB) {
      res.status(404).json({ error: `User ${userIdB} not found` });
      return;
    }

    const matchWeights = weights ?? DEFAULT_WEIGHTS;
    const matchScore = await matchingEngine.calculateMatchScore(
      userA,
      userB,
      matchWeights
    );

    res.json({
      userA: { id: userA.id, username: userA.username },
      userB: { id: userB.id, username: userB.username },
      matchScore,
    });
  } catch (error) {
    console.error('Error calculating match score:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to calculate match score'
    });
  }
});

/**
 * GET /api/matching/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'matching-engine',
    timestamp: new Date().toISOString()
  });
});

export default router;

