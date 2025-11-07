/**
 * Language similarity service
 * Calculates how well two users can communicate based on shared languages
 */

import type { LanguageSimilarityResult } from '../types/matching.types.js';
import type { UserProfile } from '../types/user.types.js';

class LanguageService {
  /**
   * Calculate language similarity between two users
   * Returns a score from 0-1 based on shared languages
   */
  calculateLanguageSimilarity(
    userA: UserProfile,
    userB: UserProfile
  ): LanguageSimilarityResult {
    const languagesA = new Set(
      userA.languages.map((lang) => lang.toLowerCase().trim())
    );
    const languagesB = new Set(
      userB.languages.map((lang) => lang.toLowerCase().trim())
    );

    // Find common languages
    const commonLanguages = Array.from(languagesA).filter((lang) =>
      languagesB.has(lang)
    );

    // Calculate similarity score
    // If they share at least one language, give a base score
    // More common languages = higher score
    let score = 0;

    if (commonLanguages.length > 0) {
      // Base score for having at least one common language
      score = 0.5;

      // Bonus for multiple common languages
      const totalUniqueLanguages = new Set([
        ...languagesA,
        ...languagesB,
      ]).size;
      const commonRatio = commonLanguages.length / totalUniqueLanguages;

      // Additional score based on ratio of common to total languages
      score += commonRatio * 0.5;

      // Cap at 1.0
      score = Math.min(1.0, score);
    }

    // Special case: if they share a primary language (first in list), boost score
    if (
      userA.languages.length > 0 &&
      userB.languages.length > 0 &&
      userA.languages[0]?.toLowerCase().trim() ===
        userB.languages[0]?.toLowerCase().trim()
    ) {
      score = Math.min(1.0, score + 0.2);
    }

    return {
      score,
      commonLanguages,
      totalLanguages: new Set([...languagesA, ...languagesB]).size,
    };
  }

  /**
   * Check if two users can communicate (share at least one language)
   */
  canCommunicate(userA: UserProfile, userB: UserProfile): boolean {
    const result = this.calculateLanguageSimilarity(userA, userB);
    return result.commonLanguages.length > 0;
  }

  /**
   * Get primary language for a user (first language in their list)
   */
  getPrimaryLanguage(user: UserProfile): string | null {
    return user.languages.length > 0 ? user.languages[0]! : null;
  }
}

// Singleton instance
export const languageService = new LanguageService();

