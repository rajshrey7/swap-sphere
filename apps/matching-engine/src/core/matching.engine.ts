/**
 * Core matching engine
 * Implements the hybrid formula-based matching algorithm
 * 
 * Total Match Score = w1 * (semantic similarity of A's offer → B's want)
 *                   + w2 * (semantic similarity of B's offer → A's want)
 *                   + w3 * (language similarity)
 *                   + w4 * (trust score)
 */

import type { UserProfile, MatchResult, MatchScore, MatchingWeights } from '../types/user.types.js';
import { DEFAULT_WEIGHTS } from '../types/user.types.js';
import type { MatchingConfig, SemanticSimilarityResult, LanguageSimilarityResult, TrustScoreResult } from '../types/matching.types.js';
import { semanticService } from '../services/semantic.service.js';
import { languageService } from '../services/language.service.js';
import { trustService } from '../services/trust.service.js';

class MatchingEngine {
  /**
   * Find matches for a given user
   */
  async findMatches(
    user: UserProfile,
    candidates: UserProfile[],
    config: MatchingConfig = { weights: DEFAULT_WEIGHTS }
  ): Promise<MatchResult[]> {
    const startTime = Date.now();
    const weights = config.weights;
    const minScore = config.minMatchScore ?? 0.3;
    const maxResults = config.maxResults ?? 50;

    // Ensure semantic service is initialized
    await semanticService.initialize();

    const matches: MatchResult[] = [];

    for (const candidate of candidates) {
      // Skip self
      if (user.id === candidate.id) {
        continue;
      }

      // Calculate match score
      const matchScore = await this.calculateMatchScore(user, candidate, weights);

      // Only include matches above threshold
      if (matchScore.totalScore >= minScore) {
        matches.push({
          userA: user,
          userB: candidate,
          matchScore,
          matchedAt: new Date(),
        });
      }
    }

    // Sort by total score (descending)
    matches.sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);

    // Limit results
    const limitedMatches = matches.slice(0, maxResults);

    const processingTime = Date.now() - startTime;
    console.log(`Found ${limitedMatches.length} matches in ${processingTime}ms`);

    return limitedMatches;
  }

  /**
   * Calculate match score between two users using the hybrid formula
   */
  async calculateMatchScore(
    userA: UserProfile,
    userB: UserProfile,
    weights: MatchingWeights = DEFAULT_WEIGHTS
  ): Promise<MatchScore> {
    // 1. Semantic similarity: A's offer → B's want
    const semanticScoreAtoB = await this.calculateSemanticScoreAtoB(
      userA,
      userB
    );

    // 2. Semantic similarity: B's offer → A's want
    const semanticScoreBtoA = await this.calculateSemanticScoreBtoA(
      userA,
      userB
    );

    // 3. Language similarity
    const languageResult = languageService.calculateLanguageSimilarity(
      userA,
      userB
    );

    // 4. Trust score
    const trustResult = trustService.calculateTrustScore(userA, userB);

    // Calculate weighted total score
    const totalScore =
      weights.w1 * semanticScoreAtoB +
      weights.w2 * semanticScoreBtoA +
      weights.w3 * languageResult.score +
      weights.w4 * trustResult.score;

    return {
      totalScore: Math.max(0, Math.min(1, totalScore)), // Clamp to 0-1
      semanticScoreAtoB,
      semanticScoreBtoA,
      languageScore: languageResult.score,
      trustScore: trustResult.score,
      breakdown: {
        w1: weights.w1,
        w2: weights.w2,
        w3: weights.w3,
        w4: weights.w4,
      },
    };
  }

  /**
   * Calculate semantic similarity: A's offers → B's wants
   * Finds the best matching pair and returns the similarity score
   */
  private async calculateSemanticScoreAtoB(
    userA: UserProfile,
    userB: UserProfile
  ): Promise<number> {
    if (userA.offers.length === 0 || userB.wants.length === 0) {
      return 0;
    }

    // Find best matches for each of A's offers
    const scores: number[] = [];

    for (const offer of userA.offers) {
      const bestMatch = await semanticService.findBestMatch(
        offer,
        userB.wants
      );

      if (bestMatch) {
        // Weight by skill level (higher level = more valuable)
        const levelWeight = this.getLevelWeight(offer.level);
        scores.push(bestMatch.similarity * levelWeight);
      }
    }

    // Return average of best matches, or max if we want to prioritize strong matches
    if (scores.length === 0) {
      return 0;
    }

    // Use average for more balanced scoring
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Also consider the best match
    const max = Math.max(...scores);
    
    // Weighted combination: 70% average, 30% max
    return average * 0.7 + max * 0.3;
  }

  /**
   * Calculate semantic similarity: B's offers → A's wants
   * Finds the best matching pair and returns the similarity score
   */
  private async calculateSemanticScoreBtoA(
    userA: UserProfile,
    userB: UserProfile
  ): Promise<number> {
    // This is the reverse direction, so swap users
    return this.calculateSemanticScoreAtoB(userB, userA);
  }

  /**
   * Get weight multiplier based on skill level
   */
  private getLevelWeight(
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): number {
    const weights: Record<string, number> = {
      beginner: 0.5,
      intermediate: 0.75,
      advanced: 0.9,
      expert: 1.0,
    };

    return weights[level] ?? 0.5;
  }

  /**
   * Validate that a match is bidirectional (both directions work)
   */
  async validateBidirectionalMatch(
    userA: UserProfile,
    userB: UserProfile,
    minScore: number = 0.3
  ): Promise<boolean> {
    const scoreAtoB = await this.calculateSemanticScoreAtoB(userA, userB);
    const scoreBtoA = await this.calculateSemanticScoreBtoA(userA, userB);

    // Both directions should have reasonable scores
    return scoreAtoB >= minScore && scoreBtoA >= minScore;
  }
}

// Singleton instance
export const matchingEngine = new MatchingEngine();

