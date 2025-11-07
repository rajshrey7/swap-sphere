/**
 * Trust score service
 * Calculates trust scores for user pairs based on their individual trust scores
 */

import type { TrustScoreResult } from '../types/matching.types.js';
import type { UserProfile } from '../types/user.types.js';

class TrustService {
  /**
   * Calculate combined trust score for a user pair
   * Uses average of both users' trust scores
   */
  calculateTrustScore(
    userA: UserProfile,
    userB: UserProfile
  ): TrustScoreResult {
    const userATrust = this.normalizeTrustScore(userA.trustScore);
    const userBTrust = this.normalizeTrustScore(userB.trustScore);

    // Average trust score
    const averageTrust = (userATrust + userBTrust) / 2;

    // Apply additional factors if needed
    // For example, penalize if either user has very low trust
    let finalScore = averageTrust;

    // If either user has very low trust (< 0.3), reduce the score
    if (userATrust < 0.3 || userBTrust < 0.3) {
      finalScore = averageTrust * 0.7;
    }

    // If both users have high trust (> 0.8), boost the score slightly
    if (userATrust > 0.8 && userBTrust > 0.8) {
      finalScore = Math.min(1.0, averageTrust * 1.1);
    }

    return {
      score: Math.max(0, Math.min(1, finalScore)), // Clamp to 0-1
      factors: {
        userATrust,
        userBTrust,
        averageTrust,
      },
    };
  }

  /**
   * Normalize trust score to 0-1 range
   */
  private normalizeTrustScore(score: number): number {
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Check if both users meet minimum trust threshold
   */
  meetsTrustThreshold(
    userA: UserProfile,
    userB: UserProfile,
    minTrust: number = 0.3
  ): boolean {
    const result = this.calculateTrustScore(userA, userB);
    return result.score >= minTrust;
  }
}

// Singleton instance
export const trustService = new TrustService();

